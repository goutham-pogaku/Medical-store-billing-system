# Verify Routes Are Working

## The Routes DO Exist!

The `/api/auth/register` route **IS** defined in `server.js` at line 111.

## Quick Verification

### 1. Test Health Endpoint
```bash
curl https://medical-store-billing-system.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-16T...",
  "routes": {
    "register": "/api/auth/register",
    "login": "/api/auth/login"
  }
}
```

### 2. Test Register Endpoint (GET - should fail)
```bash
curl https://medical-store-billing-system.onrender.com/api/auth/register
```

**Expected:** Error (because it's POST only)

### 3. Test Register Endpoint (POST)
```bash
curl -X POST https://medical-store-billing-system.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "storeName": "Test Pharmacy",
    "ownerName": "John Doe",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "address": "123 Test St"
  }'
```

**Expected:** Success or validation error (not "Cannot POST")

## Routes in server.js

All routes are defined directly in `server.js`:

```javascript
// Line 111
app.post('/api/auth/register', validateRegistration, async (req, res) => { ... }

// Line 195
app.post('/api/auth/login', async (req, res) => { ... }

// Line 260
app.get('/api/inventory', authenticateToken, async (req, res) => { ... }

// Line 273
app.post('/api/inventory/excel', authenticateToken, upload.single('excel'), async (req, res) => { ... }

// Line 316
app.post('/api/inventory/manual', authenticateToken, validateInventoryItem, async (req, res) => { ... }

// Line 360
app.post('/api/bills', authenticateToken, async (req, res) => { ... }

// And many more...
```

## If You're Getting "Network Error"

This means:

1. **Backend not deployed** - Deploy the latest code to Render
2. **Wrong URL** - Check `client/src/config.js` has correct URL
3. **CORS issue** - Check CORS settings in server.js
4. **Backend crashed** - Check Render logs

## Deploy and Test

### 1. Deploy Backend
```bash
git add .
git commit -m "Add health check and verify routes"
git push
```

### 2. Wait for Render Deploy
Check Render dashboard for deployment status

### 3. Test Health Endpoint
```bash
curl https://medical-store-billing-system.onrender.com/api/health
```

### 4. Check Render Logs
Look for:
```
Server running on port 10000
```

### 5. Test from Frontend
Go to: `https://your-app.vercel.app/test-registration`

## Common Issues

### "Cannot POST /api/auth/register"
- Backend not deployed
- Server crashed on startup
- Check Render logs

### "Network Error"
- CORS blocking request
- Backend URL wrong in config.js
- Backend not running

### "404 Not Found"
- Route path mismatch
- Check URL in frontend matches backend

### "500 Internal Server Error"
- Database connection failed
- Check Render logs for error details

## The Routes ARE There!

The code clearly shows:
- ✅ `app.post('/api/auth/register', ...)` exists
- ✅ All middleware is set up
- ✅ CORS is configured
- ✅ Server listens on PORT

The issue is likely:
1. Backend needs to be deployed
2. Database connection is failing (we saw ENOTFOUND earlier)
3. Server is crashing before routes are registered

Check Render logs after deploying to see what's happening!
