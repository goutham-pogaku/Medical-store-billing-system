const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const createTables = require("./create-tables");

const { pool, testConnection } = require('./config/database');
const { authenticateToken } = require('./middleware/auth');
const { 
  validateRegistration, 
  validateInventoryItem, 
  validateSupplier, 
  validatePayment 
} = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 5000;

// Test database connection (non-blocking)
testConnection().catch(err => {
  console.error('⚠️ Initial database connection test failed, but server will continue');
  console.error('⚠️ Database operations will be retried on each request');
});

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://medical-store-billing-system.vercel.app', process.env.CLIENT_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Bearer ***' : 'none',
    'origin': req.headers['origin']
  });
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});
app.use(express.static('uploads'));


app.get("/run-db-setup", async (req, res) => {
  console.log('=== DATABASE SETUP REQUESTED ===');
  try {
    const result = await createTables();
    if (result.success) {
      console.log('✅ Database setup completed successfully');
      res.json({ 
        success: true, 
        message: "✔ Tables created successfully!",
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('❌ Database setup failed:', result.error);
      res.status(500).json({ 
        success: false, 
        error: result.error,
        message: "❌ Error: " + result.error
      });
    }
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      success: false, 
      error: err.message,
      message: "❌ Error: " + err.message
    });
  }
});


// Storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Auth Routes
app.post('/api/auth/register', validateRegistration, async (req, res) => {
  console.log('=== REGISTRATION REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', JSON.stringify({
    'content-type': req.headers['content-type'],
    'origin': req.headers['origin']
  }, null, 2));
  
  try {
    const { storeName, ownerName, email, password, phone, address, gstNumber, licenseNumber } = req.body;
    
    console.log('Extracted fields:', JSON.stringify({
      storeName,
      ownerName,
      email,
      phone,
      address,
      gstNumber,
      licenseNumber,
      passwordLength: password?.length
    }, null, 2));
    
    // Check database connection
    console.log('Testing database connection...');
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      console.error('DB Error code:', dbError.code);
      console.error('DB Error stack:', dbError.stack);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Check if merchant already exists
    console.log('Checking if merchant exists with email:', email);
    const [existing] = await pool.execute('SELECT id FROM merchants WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log('❌ Merchant already exists');
      return res.status(400).json({ error: 'Merchant already exists with this email' });
    }
    
    console.log('✅ Email is unique, proceeding with registration');
    
    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');
    
    const merchantId = `MERCH${Date.now()}`;
    console.log('Generated merchant ID:', merchantId);
    
    // Insert new merchant
    console.log('Inserting merchant into database...');
    const insertQuery = `INSERT INTO merchants (merchant_id, store_name, owner_name, email, password, phone, address, gst_number, license_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertValues = [merchantId, storeName, ownerName, email, hashedPassword, phone, address, gstNumber, licenseNumber];
    
    console.log('Insert query:', insertQuery);
    console.log('Insert values (password hidden):', JSON.stringify([
      merchantId, storeName, ownerName, email, '***', phone, address, gstNumber, licenseNumber
    ], null, 2));
    
    await pool.execute(insertQuery, insertValues);
    
    console.log('✅ Merchant registered successfully:', merchantId);
    res.json({ message: 'Merchant registered successfully', merchantId });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error stack:', error.stack);
    
    // Send detailed error in development
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('=== LOGIN REQUEST ===');
  console.log('Request body:', { email: req.body.email, passwordProvided: !!req.body.password });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find merchant
    console.log('Searching for merchant with email:', email);
    const [merchants] = await pool.execute(
      'SELECT merchant_id, store_name, owner_name, email, password, status FROM merchants WHERE email = ?',
      [email]
    );
    
    if (merchants.length === 0) {
      console.log('❌ No merchant found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const merchant = merchants[0];
    console.log('✅ Merchant found:', { 
      merchantId: merchant.merchant_id, 
      storeName: merchant.store_name,
      status: merchant.status 
    });
    
    if (merchant.status !== 'active') {
      console.log('❌ Account is inactive');
      return res.status(401).json({ error: 'Account is inactive' });
    }
    
    // Verify password
    console.log('Verifying password...');
    const validPassword = await bcrypt.compare(password, merchant.password);
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ Password verified');
    
    // Generate JWT token
    const token = jwt.sign(
      { merchantId: merchant.merchant_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated');
    console.log('✅ Login successful for:', merchant.email);
    
    res.json({
      token,
      merchant: {
        merchantId: merchant.merchant_id,
        storeName: merchant.store_name,
        ownerName: merchant.owner_name,
        email: merchant.email
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
});

// Protected Routes (require authentication)
app.get('/api/inventory', authenticateToken, async (req, res) => {
  console.log('=== GET /api/inventory ===');
  console.log('Merchant ID:', req.merchant.merchant_id);
  
  try {
    const [inventory] = await pool.execute(
      'SELECT * FROM inventory WHERE merchant_id = ? ORDER BY category, name',
      [req.merchant.merchant_id]
    );
    console.log('✅ Inventory fetched:', inventory.length, 'items');
    res.json(inventory);
  } catch (error) {
    console.error('❌ Failed to fetch inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory/excel', authenticateToken, upload.single('excel'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      const itemId = `ITEM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      // Check if item exists
      const [existing] = await pool.execute(
        'SELECT id, quantity FROM inventory WHERE merchant_id = ? AND name = ?',
        [req.merchant.merchant_id, row.name]
      );
      
      if (existing.length > 0) {
        // Update existing item
        await pool.execute(
          'UPDATE inventory SET quantity = quantity + ?, price = ?, gst_rate = ? WHERE id = ?',
          [parseInt(row.quantity) || 0, parseFloat(row.price) || 0, parseFloat(row.gst) || 18, existing[0].id]
        );
      } else {
        // Insert new item
        await pool.execute(
          `INSERT INTO inventory (merchant_id, item_id, name, category, quantity, price, gst_rate, batch_number, manufacturer) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.merchant.merchant_id,
            itemId,
            row.name || '',
            row.category || 'general',
            parseInt(row.quantity) || 0,
            parseFloat(row.price) || 0,
            parseFloat(row.gst) || 18,
            row.batch_number || '',
            row.manufacturer || ''
          ]
        );
      }
      
      // Record stock movement
      await pool.execute(
        `INSERT INTO stock_movements (merchant_id, item_id, movement_type, quantity, reference_type, notes) 
         VALUES (?, ?, 'in', ?, 'excel_upload', 'Excel upload')`,
        [req.merchant.merchant_id, itemId, parseInt(row.quantity) || 0]
      );
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({ message: 'Inventory updated successfully from Excel' });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

app.post('/api/inventory/manual', authenticateToken, validateInventoryItem, async (req, res) => {
  console.log('=== POST /api/inventory/manual ===');
  console.log('Merchant ID:', req.merchant.merchant_id);
  console.log('Item data:', req.body);
  
  try {
    const { name, category, quantity, price, gstRate, batchNumber, manufacturer } = req.body;
    const itemId = `ITEM${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if item exists
    const [existing] = await pool.execute(
      'SELECT id FROM inventory WHERE merchant_id = ? AND name = ?',
      [req.merchant.merchant_id, name]
    );
    
    if (existing.length > 0) {
      console.log('Item exists, updating quantity');
      // Update existing item
      await pool.execute(
        'UPDATE inventory SET quantity = quantity + ?, price = ?, gst_rate = ? WHERE id = ?',
        [parseInt(quantity), parseFloat(price), parseFloat(gstRate) || 18, existing[0].id]
      );
    } else {
      console.log('Creating new item with ID:', itemId);
      // Insert new item
      await pool.execute(
        `INSERT INTO inventory (merchant_id, item_id, name, category, quantity, price, gst_rate, batch_number, manufacturer) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.merchant.merchant_id, itemId, name, category || 'general', parseInt(quantity), parseFloat(price), parseFloat(gstRate) || 18, batchNumber || '', manufacturer || '']
      );
    }
    
    console.log('✅ Item added successfully');
    res.json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('❌ Manual inventory error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

app.post('/api/bills', authenticateToken, async (req, res) => {
  console.log('=== POST /api/bills ===');
  console.log('Merchant ID:', req.merchant.merchant_id);
  console.log('Request body:', req.body);
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { items, discount, customerName, customerPhone } = req.body;
    const billNumber = `${req.merchant.merchant_id}-${Date.now()}`;
    
    console.log('Bill number:', billNumber);
    console.log('Items count:', items.length);
    
    let subtotal = 0;
    let totalGst = 0;
    const billItems = [];
    
    // Process each item
    for (const item of items) {
      console.log('Processing item:', item);
      
      const [inventoryItems] = await connection.execute(
        'SELECT * FROM inventory WHERE merchant_id = ? AND item_id = ?',
        [req.merchant.merchant_id, item.itemId]
      );
      
      if (inventoryItems.length === 0) {
        console.error('❌ Item not found:', item.itemId);
        throw new Error(`Item not found: ${item.name}`);
      }
      
      if (inventoryItems[0].quantity < item.quantity) {
        console.error('❌ Insufficient stock for:', item.name);
        throw new Error(`Insufficient stock for ${item.name}`);
      }
      
      const inventoryItem = inventoryItems[0];
      const itemTotal = item.quantity * inventoryItem.price;
      const gstAmount = (itemTotal * inventoryItem.gst_rate) / 100;
      
      console.log('Item calculation:', { itemTotal, gstAmount });
      
      billItems.push({
        item_id: inventoryItem.item_id,
        item_name: inventoryItem.name,
        quantity: item.quantity,
        unit_price: inventoryItem.price,
        gst_rate: inventoryItem.gst_rate,
        item_total: itemTotal,
        gst_amount: gstAmount
      });
      
      subtotal += itemTotal;
      totalGst += gstAmount;
      
      // Update inventory
      await connection.execute(
        'UPDATE inventory SET quantity = quantity - ? WHERE item_id = ?',
        [item.quantity, inventoryItem.item_id]
      );
      
      // Record stock movement
      await connection.execute(
        `INSERT INTO stock_movements (merchant_id, item_id, movement_type, quantity, reference_type, reference_id) 
         VALUES (?, ?, 'out', ?, 'sale', ?)`,
        [req.merchant.merchant_id, inventoryItem.item_id, item.quantity, billNumber]
      );
    }
    
    const discountAmount = (subtotal * (discount || 0)) / 100;
    const finalAmount = subtotal + totalGst - discountAmount;
    
    // Insert bill
    const [billResult] = await connection.execute(
      `INSERT INTO bills (merchant_id, bill_number, customer_name, customer_phone, subtotal, discount_percent, discount_amount, total_gst, final_amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.merchant.merchant_id, billNumber, customerName || 'Walk-in Customer', customerPhone || '', subtotal, discount || 0, discountAmount, totalGst, finalAmount]
    );
    
    const billId = billResult.insertId;
    
    // Insert bill items
    for (const billItem of billItems) {
      await connection.execute(
        `INSERT INTO bill_items (bill_id, item_id, item_name, quantity, unit_price, gst_rate, item_total, gst_amount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [billId, billItem.item_id, billItem.item_name, billItem.quantity, billItem.unit_price, billItem.gst_rate, billItem.item_total, billItem.gst_amount]
      );
    }
    
    await connection.commit();
    
    const bill = {
      id: billId,
      billNumber,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      items: billItems,
      subtotal,
      discount: discount || 0,
      discountAmount,
      totalGst,
      finalAmount,
      date: new Date()
    };
    
    console.log('✅ Bill created successfully:', billNumber);
    console.log('Final amount:', finalAmount);
    
    res.json(bill);
  } catch (error) {
    await connection.rollback();
    console.error('❌ Billing error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to create bill' });
  } finally {
    connection.release();
  }
});

app.get('/api/bills', authenticateToken, async (req, res) => {
  try {
    const [bills] = await pool.execute(
      `SELECT b.*, GROUP_CONCAT(bi.item_name) as items_summary 
       FROM bills b 
       LEFT JOIN bill_items bi ON b.id = bi.bill_id 
       WHERE b.merchant_id = ? 
       GROUP BY b.id 
       ORDER BY b.created_at DESC 
       LIMIT 50`,
      [req.merchant.merchant_id]
    );
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.get('/api/bills/:billId', authenticateToken, async (req, res) => {
  try {
    const [bills] = await pool.execute(
      'SELECT * FROM bills WHERE id = ? AND merchant_id = ?',
      [req.params.billId, req.merchant.merchant_id]
    );
    
    if (bills.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    const [billItems] = await pool.execute(
      'SELECT * FROM bill_items WHERE bill_id = ?',
      [req.params.billId]
    );
    
    res.json({ ...bills[0], items: billItems });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bill details' });
  }
});

// Reports API
// ...existing code...
app.get('/api/reports/sales', authenticateToken, async (req, res) => {
  console.log('GET /api/reports/sales called. req.merchant=', req.merchant);
  try {
    if (!req.merchant) {
      console.error('Unauthorized: req.merchant is missing');
      return res.status(401).json({ error: 'Unauthorized: missing merchant' });
    }
    const merchantId = req.merchant.merchant_id || req.merchant.merchantId || req.merchant.id;
    if (!merchantId) {
      console.error('Unauthorized: merchant id missing on req.merchant', req.merchant);
      return res.status(401).json({ error: 'Unauthorized: missing merchant id' });
    }

    const { period = 'daily' } = req.query;

    const periodMap = {
      daily: {
        dateCondition: 'DATE(created_at) = CURDATE()',
        groupBy: 'DATE(created_at)',
        dateFormat: '%Y-%m-%d',
        includeTrend: false
      },
      weekly: {
        dateCondition: 'YEARWEEK(created_at) = YEARWEEK(CURDATE())',
        groupBy: 'YEARWEEK(created_at)',
        dateFormat: '%Y-W%u',
        includeTrend: false
      },
      monthly: {
        dateCondition: 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())',
        groupBy: 'YEAR(created_at), MONTH(created_at)',
        dateFormat: '%Y-%m',
        includeTrend: true
      },
      yearly: {
        dateCondition: 'YEAR(created_at) = YEAR(CURDATE())',
        groupBy: 'YEAR(created_at)',
        dateFormat: '%Y',
        includeTrend: true
      },
      lifetime: {
        dateCondition: '1=1',
        groupBy: null,
        dateFormat: null,
        includeTrend: false
      }
    };

    const cfg = periodMap[period] || periodMap.daily;

    // SUMMARY: use aggregated MIN(created_at) for period_label to satisfy ONLY_FULL_GROUP_BY
    let summary;
    if (cfg.groupBy) {
      const periodLabelSelect = cfg.dateFormat
        ? `DATE_FORMAT(MIN(created_at), '${cfg.dateFormat}') AS period_label`
        : `'Period' AS period_label`;

      const salesSummaryQuery = `
        SELECT
          COUNT(*) AS total_bills,
          COALESCE(SUM(subtotal),0) AS total_sales,
          COALESCE(SUM(total_gst),0) AS total_gst,
          COALESCE(SUM(discount_amount),0) AS total_discount,
          COALESCE(SUM(final_amount),0) AS total_revenue,
          COALESCE(AVG(final_amount),0) AS avg_bill_amount,
          ${periodLabelSelect}
        FROM bills
        WHERE merchant_id = ? AND ${cfg.dateCondition}
        GROUP BY ${cfg.groupBy}
        ORDER BY MIN(created_at) DESC
        LIMIT 1
      `;
      const [rows] = await pool.execute(salesSummaryQuery, [merchantId]);
      summary = rows && rows[0] ? rows[0] : null;
    } else {
      const lifetimeQuery = `
        SELECT
          COUNT(*) AS total_bills,
          COALESCE(SUM(subtotal),0) AS total_sales,
          COALESCE(SUM(total_gst),0) AS total_gst,
          COALESCE(SUM(discount_amount),0) AS total_discount,
          COALESCE(SUM(final_amount),0) AS total_revenue,
          COALESCE(AVG(final_amount),0) AS avg_bill_amount,
          'Lifetime' AS period_label
        FROM bills
        WHERE merchant_id = ?
      `;
      const [rows] = await pool.execute(lifetimeQuery, [merchantId]);
      summary = rows && rows[0] ? rows[0] : null;
    }

    if (!summary) {
      summary = {
        total_bills: 0,
        total_sales: 0,
        total_gst: 0,
        total_discount: 0,
        total_revenue: 0,
        avg_bill_amount: 0,
        period_label: cfg.dateFormat ? '' : (cfg.groupBy ? '' : 'Lifetime')
      };
    }

    // TOP ITEMS
    const topItemsQuery = `
      SELECT 
        bi.item_name,
        COALESCE(SUM(bi.quantity),0) AS total_quantity,
        COALESCE(SUM(bi.item_total),0) AS total_sales,
        COUNT(DISTINCT bi.bill_id) AS times_sold
      FROM bill_items bi
      JOIN bills b ON bi.bill_id = b.id
      WHERE b.merchant_id = ? AND ${cfg.dateCondition}
      GROUP BY bi.item_name
      ORDER BY total_quantity DESC
      LIMIT 10
    `;
    const [topItems] = await pool.execute(topItemsQuery, [merchantId]);

    // TREND (monthly/yearly)
    let salesTrend = [];
    if (cfg.includeTrend) {
      if (period === 'monthly') {
        const trendSql = `
          SELECT
            DATE(created_at) AS date,
            COUNT(*) AS bills_count,
            COALESCE(SUM(final_amount),0) AS revenue
          FROM bills
          WHERE merchant_id = ? AND ${cfg.dateCondition}
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at)
        `;
        const [trendRows] = await pool.execute(trendSql, [merchantId]);
        salesTrend = trendRows || [];
      } else if (period === 'yearly') {
        const trendSql = `
          SELECT
            DATE_FORMAT(MIN(created_at), '%Y-%m') AS date,
            COUNT(*) AS bills_count,
            COALESCE(SUM(final_amount),0) AS revenue
          FROM bills
          WHERE merchant_id = ? AND ${cfg.dateCondition}
          GROUP BY YEAR(created_at), MONTH(created_at)
          ORDER BY MIN(created_at)
        `;
        const [trendRows] = await pool.execute(trendSql, [merchantId]);
        salesTrend = trendRows || [];
      }
    }

    return res.json({
      summary,
      topItems: topItems || [],
      salesTrend,
      period
    });
  } catch (err) {
    console.error('Reports /api/reports/sales error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Failed to fetch sales reports' });
  }
});
// ...existing code...

app.get('/api/reports/inventory', authenticateToken, async (req, res) => {
  try {
    const merchantId = req.merchant.merchant_id;
    
    // Stock summary by category
    const [stockByCategory] = await pool.execute(
      `SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_stock,
        SUM(quantity * price) as stock_value
       FROM inventory 
       WHERE merchant_id = ?
       GROUP BY category
       ORDER BY stock_value DESC`,
      [merchantId]
    );
    
    // Low stock items (quantity < 10)
    const [lowStockItems] = await pool.execute(
      `SELECT name, category, quantity, price
       FROM inventory 
       WHERE merchant_id = ? AND quantity < 10 AND quantity > 0
       ORDER BY quantity ASC`,
      [merchantId]
    );
    
    // Out of stock items
    const [outOfStockItems] = await pool.execute(
      `SELECT name, category, price
       FROM inventory 
       WHERE merchant_id = ? AND quantity = 0`,
      [merchantId]
    );
    
    // Total inventory value
    const [inventoryValue] = await pool.execute(
      `SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_stock,
        SUM(quantity * price) as total_value
       FROM inventory 
       WHERE merchant_id = ?`,
      [merchantId]
    );
    
    res.json({
      stockByCategory,
      lowStockItems,
      outOfStockItems,
      inventoryValue: inventoryValue[0] || {
        total_items: 0,
        total_stock: 0,
        total_value: 0
      }
    });
  } catch (error) {
    console.error('Inventory reports error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory reports' });
  }
});

// Financial Management APIs

// Suppliers Management
app.get('/api/suppliers', authenticateToken, async (req, res) => {
  try {
    const [suppliers] = await pool.execute(
      'SELECT * FROM suppliers WHERE merchant_id = ? ORDER BY company_name',
      [req.merchant.merchant_id]
    );
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.post('/api/suppliers', authenticateToken, validateSupplier, async (req, res) => {
  console.log("POST /api/suppliers BODY:", req.body);
  try {
    const { companyName, contactPerson, phone, email, address, gstNumber, paymentTerms } = req.body;
    const supplierId = `SUP${Date.now()}${Math.random().toString(36).substr(2, 6)}`;

    await pool.execute(
      `INSERT INTO suppliers 
        (merchant_id, supplier_id, company_name, contact_person, phone, email, address, gst_number, payment_terms) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.merchant.merchant_id,
        supplierId,
        companyName,
        contactPerson,
        phone,
        email,
        address,
        gstNumber,
        paymentTerms
      ]
    );

    res.json({ message: 'Supplier added successfully', supplierId });
  } catch (error) {
    console.error("ADD SUPPLIER ERROR:", error);
    res.status(500).json({ error: 'Failed to add supplier' });
  }
});


// Purchases Management
app.get('/api/purchases', authenticateToken, async (req, res) => {
  try {
    const [purchases] = await pool.execute(
      `SELECT p.*, s.agency_name 
       FROM purchases p 
       JOIN suppliers s ON p.supplier_id = s.supplier_id 
       WHERE p.merchant_id = ? 
       ORDER BY p.purchase_date DESC`,
      [req.merchant.merchant_id]
    );
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.post('/api/purchases', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { supplierId, invoiceNumber, purchaseDate, dueDate, items, notes } = req.body;
    const purchaseId = `PUR${Date.now()}${Math.random().toString(36).substr(2, 6)}`;
    
    let subtotal = 0;
    let gstAmount = 0;
    
    // Calculate totals
    items.forEach(item => {
      subtotal += item.totalPrice;
      gstAmount += (item.totalPrice * 18) / 100; // Assuming 18% GST
    });
    
    const totalAmount = subtotal + gstAmount;
    
    // Insert purchase
    await connection.execute(
      `INSERT INTO purchases (merchant_id, purchase_id, supplier_id, invoice_number, purchase_date, due_date, subtotal, gst_amount, total_amount, balance_due, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.merchant.merchant_id, purchaseId, supplierId, invoiceNumber, purchaseDate, dueDate, subtotal, gstAmount, totalAmount, totalAmount, notes]
    );
    
    // Insert purchase items
    for (const item of items) {
      await connection.execute(
        `INSERT INTO purchase_items (purchase_id, item_name, quantity, unit_price, total_price, batch_number, expiry_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [purchaseId, item.itemName, item.quantity, item.unitPrice, item.totalPrice, item.batchNumber, item.expiryDate]
      );
    }
    
    await connection.commit();
    res.json({ message: 'Purchase recorded successfully', purchaseId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Failed to record purchase' });
  } finally {
    connection.release();
  }
});

// Payments Management
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.execute(
      `SELECT sp.*, s.company_name, p.invoice_number 
       FROM supplier_payments sp 
       JOIN suppliers s ON sp.supplier_id = s.supplier_id 
       LEFT JOIN purchases p ON sp.purchase_id = p.purchase_id 
       WHERE sp.merchant_id = ? 
       ORDER BY sp.payment_date DESC`,
      [req.merchant.merchant_id]
    );
    res.json(payments);
  } catch (error) {
    console.error("Payment GET error:", error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/payments', authenticateToken, validatePayment, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
let { supplierId, purchaseId, amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;

// Convert empty purchaseId to NULL
if (!purchaseId || purchaseId === "" || purchaseId === "null") {
  purchaseId = null;
}
    const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 6)}`;

    // Insert payment
    await connection.execute(
      `INSERT INTO supplier_payments 
        (merchant_id, payment_id, supplier_id, purchase_id, payment_date, amount, payment_method, reference_number, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.merchant.merchant_id,
        paymentId,
        supplierId,
        purchaseId,
        paymentDate,
        amount,
        paymentMethod,
        referenceNumber,
        notes
      ]
    );

    // Update purchase if specific purchase is being paid
    if (purchaseId) {
      await connection.execute(
        `UPDATE purchases 
         SET paid_amount = paid_amount + ?, 
             balance_due = total_amount - (paid_amount + ?),
             status = CASE 
               WHEN (paid_amount + ?) >= total_amount THEN 'paid'
               WHEN (paid_amount + ?) > 0 THEN 'partial'
               ELSE 'pending'
             END
         WHERE purchase_id = ?`,
        [amount, amount, amount, amount, purchaseId]
      );
    }

    await connection.commit();
    res.json({ message: 'Payment recorded successfully', paymentId });

  } catch (error) {
    console.error("PAYMENT ERROR:", error);  // ← ADD THIS
    await connection.rollback();
    res.status(500).json({ error: error.message });
}
 finally {
    connection.release();
  }
});

// Financial Reports
app.get('/api/reports/financial', authenticateToken, async (req, res) => {
  try {
    const merchantId = req.merchant.merchant_id;

    // Supplier-wise summary
    const [supplierSummary] = await pool.execute(
      `SELECT 
        s.supplier_id,
        s.company_name,
        COALESCE(SUM(p.total_amount), 0) as total_purchased,
        COALESCE(SUM(p.paid_amount), 0) as total_paid,
        COALESCE(SUM(p.balance_due), 0) as balance_due,
        COUNT(p.id) as total_invoices
       FROM suppliers s
       LEFT JOIN purchases p ON s.supplier_id = p.supplier_id
       WHERE s.merchant_id = ?
       GROUP BY s.supplier_id, s.company_name
       ORDER BY total_purchased DESC`,
      [merchantId]
    );

    // Outstanding payments (overdue)
    const [overduePayments] = await pool.execute(
      `SELECT p.*, s.company_name, 
              DATEDIFF(CURDATE(), p.due_date) as days_overdue
       FROM purchases p
       JOIN suppliers s ON p.supplier_id = s.supplier_id
       WHERE p.merchant_id = ? 
         AND p.balance_due > 0 
         AND p.due_date < CURDATE()
       ORDER BY days_overdue DESC`,
      [merchantId]
    );

    // Recent Payments
    const [recentPayments] = await pool.execute(
      `SELECT sp.*, s.company_name, p.invoice_number
       FROM supplier_payments sp
       JOIN suppliers s ON sp.supplier_id = s.supplier_id
       LEFT JOIN purchases p ON sp.purchase_id = p.purchase_id
       WHERE sp.merchant_id = ?
       ORDER BY sp.payment_date DESC
       LIMIT 10`,
      [merchantId]
    );

    // Financial summary
    const [financialSummary] = await pool.execute(
      `SELECT 
        COALESCE(SUM(total_amount), 0) as total_purchases,
        COALESCE(SUM(paid_amount), 0) as total_payments,
        COALESCE(SUM(balance_due), 0) as total_outstanding
       FROM purchases 
       WHERE merchant_id = ?`,
      [merchantId]
    );

    res.json({
      supplierSummary,
      overduePayments,
      recentPayments,
      financialSummary: financialSummary[0] || {
        total_purchases: 0,
        total_payments: 0,
        total_outstanding: 0
      }
    });

  } catch (error) {
    console.error('Financial reports error:', error);
    res.status(500).json({ error: 'Failed to fetch financial reports' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
