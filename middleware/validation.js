const { body, validationResult } = require('express-validator');

// Sanitize and escape HTML to prevent XSS
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  
  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('=== VALIDATION FAILED ===');
    console.log('Request body:', req.body);
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    
    const errorDetails = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    
    console.log('Formatted errors:', errorDetails);
    
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array(),
      summary: errorDetails.map(e => `${e.field}: ${e.message}`).join(', ')
    });
  }
  
  console.log('✅ Validation passed');
  next();
};

// Registration validation
const validateRegistration = [
  body('storeName')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Store name must be 2-255 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,']+$/).withMessage('Store name contains invalid characters')
    .customSanitizer(sanitizeInput),
  
  body('ownerName')
    .trim()
    .notEmpty().withMessage('Owner name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Owner name must be 2-255 characters')
    .matches(/^[a-zA-Z\s.]+$/).withMessage('Owner name should only contain letters')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format')
    .customSanitizer(sanitizeInput),
  
  body('address')
    .optional()
    .trim()
    .customSanitizer(sanitizeInput),
  
  body('gstNumber')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]+$/).withMessage('Invalid GST number format')
    .customSanitizer(sanitizeInput),
  
  body('licenseNumber')
    .optional()
    .trim()
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

// Inventory item validation
const validateInventoryItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Item name must be 2-255 characters')
    .matches(/^[a-zA-Z0-9\s\-().]+$/).withMessage('Item name contains invalid characters (only letters, numbers, spaces, hyphens, dots, and parentheses allowed)')
    .customSanitizer(sanitizeInput),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['tablets', 'syrups', 'injections', 'capsules', 'ointments', 'general'])
    .withMessage('Invalid category'),
  
  body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('gstRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('GST rate must be between 0 and 100'),
  
  body('batchNumber')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9\-]+$/).withMessage('Batch number contains invalid characters')
    .customSanitizer(sanitizeInput),
  
  body('manufacturer')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9\s\-&.,]+$/).withMessage('Manufacturer name contains invalid characters')
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

// Supplier validation
const validateSupplier = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 255 }).withMessage('Company name must be 2-255 characters')
    .matches(/^[a-zA-Z0-9\s\-&.,']+$/).withMessage('Company name contains invalid characters')
    .customSanitizer(sanitizeInput),
  
  body('contactPerson')
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s.]+$/).withMessage('Contact person name should only contain letters')
    .customSanitizer(sanitizeInput),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('address')
    .optional()
    .trim()
    .customSanitizer(sanitizeInput),
  
  body('gstNumber')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]+$/).withMessage('Invalid GST number format')
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

// Payment validation
const validatePayment = [
  body('supplierId')
    .trim()
    .notEmpty().withMessage('Supplier is required'),
  
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  
  body('paymentDate')
    .isDate().withMessage('Invalid payment date'),
  
  body('paymentMethod')
    .isIn(['cash', 'bank_transfer', 'cheque', 'upi', 'card'])
    .withMessage('Invalid payment method'),
  
  body('referenceNumber')
    .optional()
    .trim()
    .customSanitizer(sanitizeInput),
  
  body('notes')
    .optional()
    .trim()
    .customSanitizer(sanitizeInput),
  
  handleValidationErrors
];

module.exports = {
  sanitizeInput,
  validateRegistration,
  validateInventoryItem,
  validateSupplier,
  validatePayment,
  handleValidationErrors
};