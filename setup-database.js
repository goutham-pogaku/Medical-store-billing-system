const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to MySQL...');
    
    // Connect without specifying database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL successfully!');
    
    // Read the SQL schema file
    const sqlSchema = fs.readFileSync('./database/schema.sql', 'utf8');
    
    console.log('🔄 Creating database and tables...');
    
    // Split SQL statements and execute them one by one
    const statements = sqlSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - merchants');
    console.log('   - inventory');
    console.log('   - bills');
    console.log('   - bill_items');
    console.log('   - stock_movements');
    console.log('');
    console.log('🧪 Sample merchant account created:');
    console.log('   Email: admin@citymedical.com');
    console.log('   Password: password');
    console.log('');
    console.log('🚀 Your medical store billing system is ready!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check your database credentials in .env file');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Check your database host in .env file');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase();