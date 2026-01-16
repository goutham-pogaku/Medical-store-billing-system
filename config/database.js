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

// Build database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medical_store_billing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  family: 4, // Force IPv4 only
  connectTimeout: 20000
};

// Add SSL configuration if DB_SSL_CA is provided
if (process.env.DB_SSL_CA) {
  try {
    const sslCaPath = path.resolve(process.env.DB_SSL_CA);
    console.log('SSL CA file path:', sslCaPath);
    
    if (fs.existsSync(sslCaPath)) {
      dbConfig.ssl = {
        ca: fs.readFileSync(sslCaPath),
        rejectUnauthorized: false
      };
      console.log('✅ SSL configuration added');
    } else {
      console.warn('⚠️ SSL CA file not found:', sslCaPath);
    }
  } catch (error) {
    console.error('❌ Error reading SSL CA file:', error.message);
  }
} else {
  console.log('ℹ️ No SSL configuration (DB_SSL_CA not set)');
}

console.log('Creating connection pool...');
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
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
      }
    } catch (tableError) {
      console.error('❌ Error checking tables:', tableError.message);
    }
    
    connection.release();
    console.log('✅ Database connection test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error stack:', error.stack);
    return false;
  }
};

module.exports = { pool, testConnection };