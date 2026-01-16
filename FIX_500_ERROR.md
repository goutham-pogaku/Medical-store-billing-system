# Fix 500 Internal Server Error

## What's Happening

You're getting a **500 Internal Server Error** which means the backend is crashing during registration. This is most likely:

1. **Database connection issue** (most common)
2. **Missing environment variables**
3. **Database table doesn't exist**
4. **Database credentials are wrong**

## Step 1: Check Render Logs

### Go to Render Dashboard
1. Open https://dashboard.render.com
2. Select your backend service
3. Click "Logs" tab

### Look for These Errors:

#### Database Connection Error:
```
❌ Database connection failed: connect ECONNREFUSED
❌ Database connection failed: Access denied for user
❌ Database connection failed: Unknown database
```

#### Missing Environment Variables:
```
=== DATABASE CONFIGURATION ===
DB_HOST: localhost
DB_USER: root
DB_NAME: medical_store_billing
DB_PASSWORD: ***NOT SET***
```

#### Table Doesn't Exist:
```
❌ Registration error: Table 'medical_store_billing.merchants' doesn't exist
Error code: ER_NO_SUCH_TABLE
```

## Step 2: Fix Based on Error

### Fix 1: Database Connection Failed

**Check Environment Variables on Render:**

1. Go to Render Dashboard
2. Select your service
3. Click "Environment" tab
4. Verify these are set:

```
DB_HOST=your-database-host.com
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=medical_store_billing
NODE_ENV=production
JWT_SECRET=your-secret-key
```

**If using Render PostgreSQL:**
- Render provides a connection string
- You might need to parse it or use it directly

**If using external MySQL:**
- Make sure the host is accessible from Render
- Check firewall rules
- Verify credentials

### Fix 2: Table Doesn't Exist

**Run Database Setup:**

Option A: Use the setup endpoint
```bash
curl https://your-backend.onrender.com/run-db-setup
```

Option B: Run SQL manually
Connect to your database and run the SQL from `database/schema.sql`

### Fix 3: Wrong Database Credentials

**Test Connection Locally:**
```bash
# In your project root
node -e "
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'YOUR_DB_HOST',
  user: 'YOUR_DB_USER',
  password: 'YOUR_DB_PASSWORD',
  database: 'YOUR_DB_NAME'
});
pool.query('SELECT 1').then(() => {
  console.log('✅ Connection successful');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"
```

## Step 3: Check Detailed Backend Logs

After deploying the updated code, the backend will show detailed logs:

### Successful Registration:
```
=== REGISTRATION REQUEST ===
Request body: { ... }
Testing database connection...
✅ Database connection OK
Checking if merchant exists with email: test@example.com
✅ Email is unique, proceeding with registration
Hashing password...
✅ Password hashed
Generated merchant ID: MERCH1737024600000
Inserting merchant into database...
✅ Merchant registered successfully: MERCH1737024600000
```

### Database Connection Error:
```
=== REGISTRATION REQUEST ===
Testing database connection...
❌ Database connection failed: connect ECONNREFUSED
DB Error code: ECONNREFUSED
```

### Table Missing Error:
```
=== REGISTRATION REQUEST ===
✅ Database connection OK
Checking if merchant exists with email: test@example.com
❌ Registration error: Table 'medical_store_billing.merchants' doesn't exist
Error code: ER_NO_SUCH_TABLE
Error sqlMessage: Table 'medical_store_billing.merchants' doesn't exist
```

## Step 4: Common Solutions

### Solution 1: Set Environment Variables

On Render:
1. Go to Environment tab
2. Add all required variables
3. Click "Save Changes"
4. Service will auto-redeploy

### Solution 2: Create Database Tables

**Method A: Use setup endpoint**
```bash
curl https://your-backend.onrender.com/run-db-setup
```

**Method B: Run SQL manually**
1. Connect to your database
2. Run the SQL from `database/schema.sql`

**Method C: Use setup script**
```bash
# Locally with correct DB credentials
node setup-database.js
```

### Solution 3: Check Database Access

**For MySQL:**
- Ensure remote access is enabled
- Check firewall rules
- Verify user has proper permissions

**For Render PostgreSQL:**
- Use the internal connection string
- Don't use external connection from Render

### Solution 4: Check JWT_SECRET

Make sure `JWT_SECRET` is set in Render environment variables:
```
JWT_SECRET=your-random-secret-key-here
```

## Step 5: Test After Fix

### Deploy Updated Code:
```bash
git add .
git commit -m "Add detailed error logging"
git push
```

Render will auto-deploy.

### Check Logs:
1. Go to Render Logs
2. Look for database configuration output
3. Try registration again
4. Check for detailed error messages

### Test Registration:
1. Go to `/test-registration` page
2. Click "Test Registration"
3. Check the response
4. If still error, check Render logs for details

## Step 6: Share Logs

If still not working, share:

1. **Render Logs** (from when you try to register)
2. **Frontend Debug Console logs** (download as file)
3. **Environment variables** (names only, not values!)

The detailed logs will show exactly what's failing!

## Quick Checklist

- [ ] Environment variables set on Render
- [ ] Database is accessible from Render
- [ ] Database tables exist (run setup script)
- [ ] JWT_SECRET is set
- [ ] Backend is deployed and running
- [ ] Check Render logs for detailed errors
- [ ] Test with `/test-registration` page

## Most Likely Issue

Based on 500 error, it's probably:

**#1: Database tables don't exist**
- Run: `curl https://your-backend.onrender.com/run-db-setup`

**#2: Database credentials wrong**
- Check environment variables on Render
- Verify DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

**#3: Database not accessible**
- Check firewall rules
- Verify database is running
- Test connection from Render

The enhanced logging will tell you exactly which one it is! 🎯
