const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify merchant exists and is active
    const [merchants] = await pool.execute(
      'SELECT merchant_id, store_name, owner_name, email, status FROM merchants WHERE merchant_id = ? AND status = "active"',
      [decoded.merchantId]
    );

    if (merchants.length === 0) {
      return res.status(403).json({ error: 'Invalid or inactive merchant' });
    }

    req.merchant = merchants[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateToken };