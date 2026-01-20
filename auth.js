const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  console.log('🔐 Authentication check for:', req.method, req.path);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth header present:', !!authHeader);
  console.log('Token extracted:', !!token);
  console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

  if (!token) {
    console.error('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not configured in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log('Verifying token with JWT_SECRET...');
    console.log('Token preview:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully');
    console.log('Token payload:', { 
      merchantId: decoded.merchantId, 
      iat: decoded.iat, 
      exp: decoded.exp,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    });
    
    // Verify merchant exists and is active
    console.log('Checking merchant in database...');
    const [merchants] = await pool.execute(
      'SELECT merchant_id, store_name, owner_name, email, status FROM merchants WHERE merchant_id = ? AND status = "active"',
      [decoded.merchantId]
    );

    if (merchants.length === 0) {
      console.error('❌ Merchant not found or inactive:', decoded.merchantId);
      return res.status(403).json({ error: 'Invalid or inactive merchant' });
    }

    console.log('✅ Merchant authenticated:', merchants[0].merchant_id);
    req.merchant = merchants[0];
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('Error name:', error.name);
    
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired at:', new Date(error.expiredAt).toISOString());
      return res.status(403).json({ 
        error: 'Token expired',
        expiredAt: error.expiredAt 
      });
    } else if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error details:', error.message);
      if (error.message.includes('invalid signature')) {
        console.error('💡 LIKELY CAUSE: JWT_SECRET mismatch between token creation and verification');
        console.error('💡 SOLUTION: Check JWT_SECRET on Render, logout and login again');
      }
      return res.status(403).json({ 
        error: 'Invalid token',
        details: 'JWT signature verification failed'
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      details: error.message 
    });
  }
};

module.exports = { authenticateToken };