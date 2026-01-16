const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('=== DATABASE CONFIGURATION ===');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_PORT:', process.env.DB_PORT || '3306');
console.log('DB_USER:', process.env.DB_USER || 'root');
console.log('DB_NAME:', process.env.DB_NAME || 'medical_store_billing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');
console.log('DB_SSL_CA:', process.env.DB_SSL_CA ? '***SET***' : '***NOT SET***');

// Build database configuration (matching create-tables.js)
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 30000, // Increased timeout for DNS resolution
  // Pool-specific settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Add SSL configuration if DB_SSL_CA is provided (matching create-tables.js)
if (process.env.DB_SSL_CA) {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      process.env.DB_SSL_CA,
      path.resolve(process.env.DB_SSL_CA),
      path.join(__dirname, process.env.DB_SSL_CA),
      path.join(process.cwd(), process.env.DB_SSL_CA)
    ];
    
    let sslCaPath = null;
    for (const testPath of possiblePaths) {
      console.log('Checking SSL CA path:', testPath);
      if (fs.existsSync(testPath)) {
        sslCaPath = testPath;
        console.log('✅ Found SSL CA file at:', testPath);
        break;
      }
    }
    
    if (sslCaPath) {
      dbConfig.ssl = {
        ca: fs.readFileSync(sslCaPath),
        rejectUnauthorized: false
      };
      console.log('✅ SSL configuration added');
    } else {
      console.warn('⚠️ SSL CA file not found, proceeding without SSL');
    }
  } catch (sslError) {
    console.warn('⚠️ Error loading SSL certificate:', sslError.message);
    console.warn('⚠️ Proceeding without SSL');
  }
} else {
  console.log('ℹ️ No SSL configuration (DB_SSL_CA not set)');
}

console.log('Creating connection pool...');
let pool;
let poolCreationError = null;

try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Connection pool created');
} catch (error) {
  console.error('❌ Failed to create connection pool:', error.message);
  poolCreationError = error;
  // Create a basic pool without SSL as fallback
  const fallbackConfig = { ...dbConfig };
  delete fallbackConfig.ssl;
  try {
    pool = mysql.createPool(fallbackConfig);
    console.log('⚠️ Created fallback connection pool without SSL');
  } catch (fallbackError) {
    console.error('❌ Fallback pool creation also failed:', fallbackError.message);
  }
}

// Lazy connection getter - creates connection on first use
const getPool = () => {
  if (!pool && poolCreationError) {
    console.log('Attempting to recreate connection pool...');
    try {
      pool = mysql.createPool(dbConfig);
      poolCreationError = null;
      console.log('✅ Connection pool recreated successfully');
    } catch (error) {
      console.error('❌ Pool recreation failed:', error.message);
    }
  }
  return pool;
};

// Test connection with retry logic
const testConnection = async (retries = 5, delay = 5000) => {
  // Try to resolve DNS first
  const dns = require('dns').promises;
  
  console.log('Attempting to resolve hostname:', process.env.DB_HOST);
  try {
    const addresses = await dns.resolve4(process.env.DB_HOST);
    console.log('✅ DNS resolution successful:', addresses);
  } catch (dnsError) {
    console.error('❌ DNS resolution failed:', dnsError.message);
    console.error('This might be a temporary network issue or incorrect hostname');
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Testing database connection... (Attempt ${attempt}/${retries})`);
      const connection = await pool.getConnection();
      console.log('✅ Database connection acquired');
      
      // Test query
      const [rows] = await connection.query('SELECT 1 as test');
      console.log('✅ Test query successful:', rows);
      
      // Check if merchants table exists
      try {
        const [tables] = await connection.query(
          "SHOW TABLES LIKE 'merchants'"
        );
        if (tables.length > 0) {
          console.log('✅ Merchants table exists');
        } else {
          console.warn('⚠️ Merchants table does NOT exist - run database setup!');
          console.warn('⚠️ Visit: /run-db-setup to create tables');
        }
      } catch (tableError) {
        console.error('❌ Error checking tables:', tableError.message);
      }
      
      connection.release();
      console.log('✅ Database connection test completed successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed (Attempt ${attempt}/${retries}):`, error.message);
      console.error('Error code:', error.code);
      console.error('Error errno:', error.errno);
      
      if (error.code === 'ENOTFOUND') {
        console.error('💡 DNS lookup failed. Possible causes:');
        console.error('   - Hostname is incorrect');
        console.error('   - Network connectivity issue');
        console.error('   - DNS server temporarily unavailable');
        console.error('   - Check DB_HOST value:', process.env.DB_HOST);
      }
      
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ All connection attempts failed');
        console.error('Error stack:', error.stack);
        console.warn('⚠️ Server will continue but database operations will fail');
        console.warn('⚠️ Please check your database configuration and try again');
      }
    }
  }
  return false;
};

module.exports = { pool, getPool, testConnection };