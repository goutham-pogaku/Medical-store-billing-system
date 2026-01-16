# Render Environment Variables Setup

## Required Environment Variables

Set these in your Render Dashboard → Your Service → Environment tab:

### Database Configuration

```bash
DB_HOST=your-database-host.com
DB_PORT=3306
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=medical_store_billing
DB_SSL_CA=ca.pem
```

### Application Configuration

```bash
NODE_ENV=production
JWT_SECRET=your-random-secret-key-here-make-it-long-and-random
PORT=5000
```

### Frontend URL (for CORS)

```bash
CLIENT_URL=https://medical-store-billing-system.vercel.app
```

## Detailed Explanation

### DB_HOST
Your MySQL database host address.
- Example: `mysql-12345.railway.app`
- Example: `db.example.com`
- Example: `123.45.67.89`

### DB_PORT
MySQL port (usually 3306)
- Default: `3306`
- Some providers use different ports

### DB_USER
Your database username
- Example: `root`
- Example: `admin`
- Example: `medical_store_user`

### DB_PASSWORD
Your database password
- Use a strong password
- Keep it secret!

### DB_NAME
The database name
- Should be: `medical_store_billing`
- Or whatever you named your database

### DB_SSL_CA
Path to SSL certificate file
- Use: `ca.pem` (file should be in project root)
- Or: `./ca.pem`
- Or: `/etc/secrets/ca.pem` (if using Render secrets)

**Important:** Make sure the `ca.pem` file is in your repository root or uploaded to Render.

### JWT_SECRET
Secret key for JWT token generation
- Generate a random string
- Example: `my-super-secret-jwt-key-12345-change-this`
- Use a password generator for better security

### CLIENT_URL
Your Vercel frontend URL
- Example: `https://medical-store-billing-system.vercel.app`
- Used for CORS configuration

## How to Set Environment Variables on Render

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your backend service

### Step 2: Open Environment Tab
1. Click "Environment" in the left sidebar
2. You'll see a list of environment variables

### Step 3: Add Variables
For each variable:
1. Click "Add Environment Variable"
2. Enter the **Key** (e.g., `DB_HOST`)
3. Enter the **Value** (e.g., `mysql.example.com`)
4. Click "Save"

### Step 4: Save Changes
1. After adding all variables, click "Save Changes"
2. Render will automatically redeploy your service

## SSL Certificate Setup

### Option 1: File in Repository (Recommended)
1. Make sure `ca.pem` is in your project root
2. Commit it to Git:
   ```bash
   git add ca.pem
   git commit -m "Add SSL certificate"
   git push
   ```
3. Set `DB_SSL_CA=ca.pem` in Render

### Option 2: Render Secret Files
1. Go to Render Dashboard → Your Service
2. Click "Environment"
3. Scroll to "Secret Files"
4. Click "Add Secret File"
5. Filename: `ca.pem`
6. Contents: Paste your certificate content
7. Set `DB_SSL_CA=/etc/secrets/ca.pem` in environment variables

## Verify Configuration

After setting environment variables and deploying:

### Check Render Logs
Look for:
```
=== DATABASE CONFIGURATION ===
DB_HOST: mysql.example.com
DB_PORT: 3306
DB_USER: your-user
DB_NAME: medical_store_billing
DB_PASSWORD: ***SET***
DB_SSL_CA: ***SET***
SSL CA file path: /opt/render/project/src/ca.pem
✅ SSL configuration added
Creating connection pool...
Testing database connection...
✅ Database connection acquired
✅ Test query successful: [ { test: 1 } ]
✅ Merchants table exists
✅ Database connection test completed successfully
```

### If You See Errors:

**SSL CA file not found:**
```
⚠️ SSL CA file not found: /opt/render/project/src/ca.pem
```
**Fix:** Make sure `ca.pem` is in your repository or use Render Secret Files

**Database connection failed:**
```
❌ Database connection failed: connect ECONNREFUSED
```
**Fix:** Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

**Access denied:**
```
❌ Database connection failed: Access denied for user
```
**Fix:** Check DB_USER and DB_PASSWORD

**Unknown database:**
```
❌ Database connection failed: Unknown database 'medical_store_billing'
```
**Fix:** Create the database or check DB_NAME

**Merchants table does NOT exist:**
```
⚠️ Merchants table does NOT exist - run database setup!
```
**Fix:** Run database setup:
```bash
curl https://your-backend.onrender.com/run-db-setup
```

## Example Configuration

Here's a complete example:

```bash
# Database
DB_HOST=mysql-production.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MySecurePassword123!
DB_NAME=medical_store_billing
DB_SSL_CA=ca.pem

# Application
NODE_ENV=production
JWT_SECRET=super-secret-jwt-key-change-this-to-something-random
PORT=5000

# CORS
CLIENT_URL=https://medical-store-billing-system.vercel.app
```

## Testing After Setup

### 1. Check Logs
```bash
# Render will show logs automatically after deploy
# Look for "✅ Database connection test completed successfully"
```

### 2. Test Database Setup Endpoint
```bash
curl https://your-backend.onrender.com/run-db-setup
```

Should return:
```
✔ Tables created successfully!
```

### 3. Test Registration
Go to: `https://your-frontend.vercel.app/test-registration`

Click "Test Registration" and check the result.

## Troubleshooting

### Can't connect to database
1. Verify all DB_* variables are set correctly
2. Check if database server is running
3. Verify firewall allows connections from Render
4. Check if SSL is required (set DB_SSL_CA)

### SSL errors
1. Make sure `ca.pem` file exists
2. Check DB_SSL_CA path is correct
3. Try using Render Secret Files instead

### Tables don't exist
1. Run: `curl https://your-backend.onrender.com/run-db-setup`
2. Or manually run SQL from `database/schema.sql`

### JWT errors
1. Make sure JWT_SECRET is set
2. Use a long random string
3. Don't use special characters that need escaping

## Security Notes

- Never commit `.env` file with real credentials
- Use strong passwords
- Keep JWT_SECRET secret and random
- Use SSL for database connections in production
- Regularly rotate passwords and secrets

## Need Help?

After setting up, check Render logs for detailed error messages. The enhanced logging will show exactly what's wrong!
