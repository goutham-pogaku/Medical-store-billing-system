const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('=== DATABASE CONFIGURATION ===');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_USER:', process.env.DB_USER || 'root');
console.log('DB_NAME:', process.env.DB_NAME || 'medical_store_billing');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medical_store_billing',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Creating connection pool...');
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error stack:', error.stack);
    return false;
  }
};

module.exports = { pool, testConnection };