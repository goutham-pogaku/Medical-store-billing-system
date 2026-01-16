# Comprehensive Logging Guide

## Overview
Extensive logging has been added throughout the application to help debug issues in production.

## Frontend Logging

### Debug Console Component
A visual debug console has been added that can be toggled on any page to view logs in real-time.

**Features:**
- Shows all console.log, console.error, and console.warn messages
- Color-coded by log type (green=log, red=error, yellow=warn)
- Timestamps for each log entry
- Clear button to reset logs
- Hide/Show toggle button

**Added to:**
- Login page
- Register page

**To use:**
1. Click "Show Debug Console" button (bottom-right corner)
2. Perform actions (login, register, etc.)
3. View logs in the console panel
4. Click "Clear" to reset logs
5. Click "Hide" to minimize

### Axios Interceptors
All API requests and responses are automatically logged:

**Request logs show:**
- HTTP method (GET, POST, etc.)
- Full URL
- Request data
- Headers

**Response logs show:**
- Status code
- URL
- Response data

**Error logs show:**
- Status code
- URL
- Error data
- Error message

### Component-Specific Logging

#### AuthContext (Login & Register)
```javascript
// Login logs:
- API URL being called
- Email (password length only for security)
- Response data
- Token and merchant data saved
- Any errors with full details

// Register logs:
- API URL being called
- Form data being sent
- Response data
- Detailed error information
```

#### Register Component
```javascript
- Form data on submit
- Client-side validation results
- Server response
- Validation errors with field names
- Success/failure status
```

#### Login Component
```javascript
- Email and password length
- Login attempt status
- Success/failure with navigation
- Error details
```

#### Inventory Component
```javascript
- Inventory fetch requests
- Excel file upload (name, size)
- Manual item addition
- Success/failure for each operation
```

#### Billing Component
```javascript
- Inventory fetch for billing
- Selected items
- Customer information
- Bill generation process
- Success/failure status
```

## Backend Logging

### Request Logger Middleware
Every incoming request is logged with:
- Timestamp
- HTTP method
- Path
- Headers (content-type, authorization, origin)
- Request body (for POST/PUT requests)

### Authentication Routes

#### POST /api/auth/register
```javascript
Logs:
- Request body (sanitized)
- Request headers
- Extracted fields
- Email uniqueness check
- Generated merchant ID
- Success/failure status
- Error stack traces
```

#### POST /api/auth/login
```javascript
Logs:
- Email (password presence only)
- Merchant search results
- Account status
- Password verification
- JWT token generation
- Success/failure status
- Error details
```

### Inventory Routes

#### GET /api/inventory
```javascript
Logs:
- Merchant ID
- Number of items fetched
- Success/failure status
```

#### POST /api/inventory/manual
```javascript
Logs:
- Merchant ID
- Item data
- Existing item check
- Item ID generation
- Update vs insert decision
- Success/failure status
```

### Billing Routes

#### POST /api/bills
```javascript
Logs:
- Merchant ID
- Request body
- Bill number
- Items count
- Each item processing
- Stock availability checks
- Calculations (subtotal, GST, discount)
- Final amount
- Success/failure status
- Error stack traces
```

### Validation Middleware
```javascript
Logs:
- Request body
- All validation errors
- Field names and error messages
- Formatted error summary
```

## How to View Logs

### Development (Local)

**Frontend:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Or use the Debug Console component

**Backend:**
1. Check terminal where server is running
2. All logs appear in real-time

### Production

**Frontend (Vercel):**
1. Use the Debug Console component (recommended)
2. Or open browser DevTools Console
3. Vercel doesn't provide server-side logs for frontend

**Backend (Render):**
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time logs
5. Use search/filter to find specific entries

## Log Format Examples

### Successful Registration
```
Frontend:
=== REGISTRATION ATTEMPT ===
Form Data: { storeName: "ABC Pharmacy", ... }
Client-side validation passed, sending to server...
🌐 API Request: POST https://...onrender.com/api/auth/register
✅ API Response: { message: "Merchant registered successfully", ... }
✅ Registration successful!

Backend:
[2025-01-16T10:30:00.000Z] POST /api/auth/register
=== REGISTRATION REQUEST ===
Request body: { storeName: "ABC Pharmacy", ... }
✅ Email is unique, proceeding with registration
Generated merchant ID: MERCH1737024600000
✅ Merchant registered successfully: MERCH1737024600000
```

### Failed Validation
```
Frontend:
=== REGISTRATION ATTEMPT ===
❌ Registration failed: { error: "Validation failed", details: [...] }
Server validation errors: [{ field: "phone", message: "Invalid phone number" }]

Backend:
=== VALIDATION FAILED ===
Request body: { ... }
Validation errors: [
  {
    "field": "phone",
    "message": "Invalid phone number format",
    "value": "abc123"
  }
]
```

### Successful Login
```
Frontend:
=== LOGIN ATTEMPT ===
Email: user@example.com
Password length: 8
🌐 API Request: POST https://...onrender.com/api/auth/login
✅ API Response: { token: "...", merchant: {...} }
✅ Token and merchant data saved to localStorage
✅ Login successful, navigating to dashboard

Backend:
[2025-01-16T10:35:00.000Z] POST /api/auth/login
=== LOGIN REQUEST ===
Searching for merchant with email: user@example.com
✅ Merchant found: { merchantId: "MERCH...", storeName: "ABC Pharmacy" }
Verifying password...
✅ Password verified
✅ JWT token generated
✅ Login successful for: user@example.com
```

## Troubleshooting with Logs

### Issue: "Validation failed" with no details
**Check:**
1. Frontend Debug Console for detailed validation errors
2. Backend logs for validation middleware output
3. Look for field-specific error messages

### Issue: Network errors
**Check:**
1. Axios interceptor logs for request URL
2. CORS errors in browser console
3. Backend request logger for incoming requests

### Issue: Database errors
**Check:**
1. Backend logs for SQL query errors
2. Connection pool errors
3. Transaction rollback messages

### Issue: Authentication failures
**Check:**
1. Token presence in request headers
2. JWT verification errors
3. Merchant ID in decoded token

## Best Practices

1. **Always check both frontend and backend logs** for complete picture
2. **Use timestamps** to correlate frontend and backend events
3. **Search for error markers** (❌) to quickly find issues
4. **Check success markers** (✅) to verify expected flow
5. **Look for request/response pairs** to track API calls
6. **Use Debug Console in production** when browser DevTools aren't accessible

## Security Notes

- Passwords are never logged (only length/presence)
- JWT tokens are masked in logs
- Sensitive data is sanitized before logging
- Production logs can be disabled via environment variables if needed
