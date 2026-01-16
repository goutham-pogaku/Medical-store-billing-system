# Deploy with Enhanced Logging

## What's New

### Enhanced Debug Console
- **Visual console** available on all pages
- Shows all logs in real-time with color coding
- Download logs as text file
- Auto-scrolls to latest logs
- Shows log count badge

### Comprehensive Logging
- All API requests/responses logged
- Validation errors with field details
- Authentication flow tracking
- Database operations logging
- Error stack traces

## How to Deploy

### 1. Build Frontend
```bash
cd client
npm install
npm run build
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

Or push to Git if auto-deploy is enabled.

### 3. Deploy Backend to Render
Push your code to Git repository, Render will auto-deploy.

## How to Use Debug Console in Production

### Step 1: Open Your App
Go to your Vercel URL: `https://medical-store-billing-system.vercel.app`

### Step 2: Show Debug Console
Click the **"🔍 Show Debug Console"** button in the bottom-right corner

### Step 3: Perform Actions
- Try to register
- Try to login
- Add inventory items
- Generate bills

### Step 4: View Logs
All actions will be logged in the debug console with:
- ✅ Green = Success logs
- ❌ Red = Error logs
- ⚠️ Yellow = Warning logs
- 🔵 Blue = Info logs

### Step 5: Download Logs
Click **"💾 Download"** to save logs as a text file

### Step 6: Share Logs
Send the downloaded log file or screenshot the console to debug issues

## What to Look For

### Registration Issues

**Check for:**
```
=== REGISTRATION ATTEMPT ===
Form Data: { ... }
Client-side validation passed
🌐 API Request: POST https://...
```

**If you see:**
```
❌ Registration failed: { error: "Validation failed", details: [...] }
```

Look at the `details` array to see which fields failed validation.

**Common Issues:**
- `storeName`: Must be 2-255 characters, alphanumeric
- `ownerName`: Must be 2-255 characters, letters only
- `email`: Must be valid email format
- `password`: Must be at least 6 characters
- `phone`: Must be 10 digits

### Network Issues

**Check for:**
```
❌ API Error Response: {
  status: 0,
  message: "Network Error"
}
```

This means the frontend can't reach the backend. Verify:
1. Backend is running on Render
2. Backend URL is correct in `config.js`
3. No CORS errors

### CORS Issues

**Check for:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
has been blocked by CORS policy
```

Fix: Update CORS settings in `server.js` to include your Vercel URL

## Backend Logs (Render)

### View Logs
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab

### What to Look For

**Successful Registration:**
```
[2025-01-16T10:30:00.000Z] POST /api/auth/register
=== REGISTRATION REQUEST ===
Request body: { storeName: "...", ... }
✅ Email is unique, proceeding with registration
Generated merchant ID: MERCH...
✅ Merchant registered successfully
```

**Validation Failure:**
```
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

**Database Error:**
```
❌ Registration error: Error: ER_NO_SUCH_TABLE: Table 'merchants' doesn't exist
```

## Troubleshooting Steps

### 1. Check Frontend Logs
- Open Debug Console
- Look for API request URLs
- Check for validation errors
- Verify request data

### 2. Check Backend Logs
- Go to Render Dashboard
- Check if requests are reaching the server
- Look for database errors
- Verify environment variables

### 3. Check Network Tab
- Open Browser DevTools (F12)
- Go to Network tab
- Look for failed requests
- Check response status codes

### 4. Common Fixes

**Issue: "Validation failed" with no details**
- Check Debug Console for detailed errors
- Look at backend logs for validation middleware output

**Issue: Network Error**
- Verify backend is running
- Check backend URL in config.js
- Test backend directly: `curl https://your-backend.onrender.com/api/auth/login`

**Issue: CORS Error**
- Update CORS settings in server.js
- Redeploy backend
- Clear browser cache

**Issue: 500 Internal Server Error**
- Check backend logs for error stack trace
- Verify database connection
- Check environment variables

## Testing Checklist

After deployment, test with Debug Console open:

- [ ] Registration with valid data
- [ ] Registration with invalid data (check error messages)
- [ ] Login with correct credentials
- [ ] Login with wrong credentials
- [ ] Add inventory item
- [ ] Generate bill
- [ ] View reports

For each test:
1. Perform action
2. Check Debug Console for logs
3. Verify success/error messages
4. Download logs if issues occur

## Support

If you still see "Validation failed" or "Registration error":

1. **Download logs** from Debug Console
2. **Check Render logs** for backend errors
3. **Take screenshots** of error messages
4. **Share the log file** for debugging

The logs will show exactly where the issue is occurring!
