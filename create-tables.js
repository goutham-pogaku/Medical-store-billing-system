const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function createTables() {
  let connection;
  
  try {
    console.log('🔄 Connecting to Aiven MySQL...');

    // Aiven requires SSL certificate
    const sslConfig = {
      ca: fs.readFileSync(process.env.DB_SSL_CA)
    };

    // Connect to defaultdb (Aiven does NOT allow CREATE DATABASE)
   connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA),
    rejectUnauthorized: false
  },
  family: 4,   // << FORCE IPv4 only
  connectTimeout: 20000
});



    console.log('✅ Connected successfully to Aiven!');

    // merchants
    console.log('🔄 Creating merchants table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS merchants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) UNIQUE NOT NULL,
        store_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        gst_number VARCHAR(50),
        license_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active'
      )
    `);

    // inventory
    console.log('🔄 Creating inventory table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL,
        item_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category ENUM('tablets', 'syrups', 'injections', 'capsules', 'ointments', 'general') DEFAULT 'general',
        quantity INT DEFAULT 0,
        price DECIMAL(10, 2) NOT NULL,
        gst_rate DECIMAL(5, 2) DEFAULT 18.00,
        batch_number VARCHAR(100),
        expiry_date DATE,
        manufacturer VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
        INDEX idx_merchant_category (merchant_id, category),
        INDEX idx_merchant_name (merchant_id, name)
      )
    `);

    // bills
    console.log('🔄 Creating bills table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL,
        bill_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
        customer_phone VARCHAR(20),
        subtotal DECIMAL(10, 2) NOT NULL,
        discount_percent DECIMAL(5, 2) DEFAULT 0.00,
        discount_amount DECIMAL(10, 2) DEFAULT 0.00,
        total_gst DECIMAL(10, 2) NOT NULL,
        final_amount DECIMAL(10, 2) NOT NULL,
        payment_status ENUM('pending', 'paid') DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
        INDEX idx_merchant_date (merchant_id, created_at),
        INDEX idx_bill_number (bill_number)
      )
    `);

    // bill_items
    console.log('🔄 Creating bill_items table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bill_id INT NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        gst_rate DECIMAL(5, 2) NOT NULL,
        item_total DECIMAL(10, 2) NOT NULL,
        gst_amount DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
        INDEX idx_bill_items (bill_id)
      )
    `);

    // stock_movements
    console.log('🔄 Creating stock_movements table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL,
        item_id VARCHAR(50) NOT NULL,
        movement_type ENUM('in', 'out', 'adjustment') NOT NULL,
        quantity INT NOT NULL,
        reference_type ENUM('purchase', 'sale', 'adjustment', 'excel_upload') NOT NULL,
        reference_id VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
        INDEX idx_merchant_item (merchant_id, item_id),
        INDEX idx_movement_date (created_at)
      )
    `);

    // suppliers
    console.log('🔄 Creating suppliers table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL,
        supplier_id VARCHAR(50) UNIQUE NOT NULL,
        agency_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        gst_number VARCHAR(50),
        payment_terms VARCHAR(100) DEFAULT 'Net 30',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive') DEFAULT 'active',
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE
      )
    `);

    // purchases
    console.log('🔄 Creating purchases table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL,
        purchase_id VARCHAR(50) UNIQUE NOT NULL,
        supplier_id VARCHAR(50) NOT NULL,
        invoice_number VARCHAR(100),
        purchase_date DATE NOT NULL,
        due_date DATE,
        subtotal DECIMAL(12, 2) NOT NULL,
        gst_amount DECIMAL(12, 2) DEFAULT 0.00,
        total_amount DECIMAL(12, 2) NOT NULL,
        paid_amount DECIMAL(12, 2) DEFAULT 0.00,
        balance_due DECIMAL(12, 2) NOT NULL,
        status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
      )
    `);

    // purchase_items
    console.log('🔄 Creating purchase_items table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_id VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(12, 2) NOT NULL,
        batch_number VARCHAR(100),
        expiry_date DATE,
        FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE
      )
    `);

    // supplier_payments
    console.log('🔄 Creating supplier_payments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supplier_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id VARCHAR(50) NOT NULL,
        payment_id VARCHAR(50) UNIQUE NOT NULL,
        supplier_id VARCHAR(50) NOT NULL,
        purchase_id VARCHAR(50),
        payment_date DATE NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        payment_method ENUM('cash', 'bank_transfer', 'cheque', 'upi', 'card') DEFAULT 'cash',
        reference_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
        FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE SET NULL
      )
    `);

    console.log('🎉 All tables created successfully — NO sample data inserted.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = createTables;

