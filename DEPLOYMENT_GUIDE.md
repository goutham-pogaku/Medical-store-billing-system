# GoDaddy Deployment Guide - Medical Store Billing System

## Prerequisites
- GoDaddy Shared Hosting or VPS with Node.js support
- MySQL database access
- FTP/File Manager access
- SSH access (for VPS)

---

## Step 1: Prepare Your Application for Production

### 1.1 Update Environment Variables

Create a production `.env` file with your GoDaddy database credentials:

```env
DB_HOST=your_godaddy_mysql_host
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=medical_store_billing
JWT_SECRET=983f4de169ff9d3da22cb7ede28f3c9678ef47d2acbc9e9eac0be154936b7c85edbfac0df77d756f71bb724919d2f605017c71f8a38f381dffe386dd2e7ef624
PORT=3000
NODE_ENV=production
```

### 1.2 Update API URLs in Frontend

Before building, update all API URLs in your React components to use your production domain.

Create a config file: `client/src/config.js`

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://yourdomain.com/api' 
  : 'http://localhost:5000/api';

export default API_BASE_URL;
```

Then update all axios calls to use this config.

### 1.3 Build the Frontend

```bash
cd client
npm run build
```

This creates an optimized production build in `client/build` folder.

---

## Step 2: Database Setup on GoDaddy

### 2.1 Create MySQL Database

1. Log in to your GoDaddy cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `medical_store_billing`)
4. Create a database user with a strong password
5. Add the user to the database with ALL PRIVILEGES
6. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (usually `localhost` or specific hostname)

### 2.2 Import Database Schema

**Option A: Using phpMyAdmin**
1. Open phpMyAdmin from cPanel
2. Select your database
3. Go to **SQL** tab
4. Copy and paste the contents of `database/schema.sql`
5. Click **Go** to execute

**Option B: Using MySQL Command Line (if SSH available)**
```bash
mysql -u username -p database_name < database/schema.sql
```

### 2.3 Verify Tables Created

Check that all tables are created:
- merchants
- inventory
- bills
- bill_items
- stock_movements
- suppliers
- purchases
- purchase_items
- supplier_payments

---

## Step 3: Upload Files to GoDaddy

### 3.1 Prepare Files for Upload

Create a deployment folder with these files:
```
deployment/
├── server.js
├── package.json
├── .env (production version)
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── uploads/ (empty folder)
└── public/ (contents of client/build)
```

### 3.2 Upload via FTP

1. Connect to your GoDaddy hosting via FTP (FileZilla, WinSCP, etc.)
   - Host: ftp.yourdomain.com
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

2. Upload all backend files to your root directory or subdirectory
3. Upload the contents of `client/build` to the `public` folder

### 3.3 File Structure on Server

```
/home/username/
├── public_html/
│   ├── index.html (from client/build)
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── ... (other build files)
├── server.js
├── package.json
├── .env
├── config/
├── middleware/
└── uploads/
```

---

## Step 4: Install Dependencies on Server

### 4.1 SSH into Your Server

```bash
ssh username@yourdomain.com
```

### 4.2 Navigate to Your Application Directory

```bash
cd /home/username/
```

### 4.3 Install Node.js Dependencies

```bash
npm install --production
```

This installs only production dependencies (no devDependencies).

---

## Step 5: Configure Node.js Application

### 5.1 Setup Node.js in cPanel

1. Go to **Setup Node.js App** in cPanel
2. Click **Create Application**
3. Configure:
   - **Node.js version**: Select latest LTS (18.x or 20.x)
   - **Application mode**: Production
   - **Application root**: Path to your app (e.g., `/home/username/`)
   - **Application URL**: Your domain or subdomain
   - **Application startup file**: `server.js`
   - **Environment variables**: Add your .env variables

4. Click **Create**

### 5.2 Set Environment Variables in cPanel

Add these environment variables:
```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=medical_store_billing
JWT_SECRET=your_jwt_secret
PORT=3000
NODE_ENV=production
```

---

## Step 6: Configure Web Server (Apache/Nginx)

### 6.1 Create .htaccess for Apache (if using shared hosting)

Create `.htaccess` in your `public_html` folder:

```apache
# Enable Rewrite Engine
RewriteEngine On

# API requests go to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# All other requests serve React app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
```

### 6.2 Configure Reverse Proxy

If you have access to Apache config, add:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /home/username/public_html

    # Serve static files
    <Directory /home/username/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Proxy API requests to Node.js
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
</VirtualHost>
```

---

## Step 7: Start the Application

### 7.1 Start Node.js Application

**Via cPanel:**
1. Go to **Setup Node.js App**
2. Click on your application
3. Click **Start App** or **Restart App**

**Via SSH:**
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name medical-store
pm2 save
pm2 startup

# Or using node directly
node server.js &
```

### 7.2 Verify Application is Running

```bash
# Check if process is running
ps aux | grep node

# Check if port is listening
netstat -tulpn | grep 3000

# Test API endpoint
curl http://localhost:3000/api/inventory
```

---

## Step 8: Configure SSL Certificate (HTTPS)

### 8.1 Install SSL Certificate

1. Go to cPanel → **SSL/TLS Status**
2. Enable **AutoSSL** for your domain
3. Or install a custom SSL certificate

### 8.2 Force HTTPS

Add to `.htaccess`:

```apache
# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Step 9: Update Frontend API URLs

### 9.1 Update All API Calls

Replace all instances of `http://localhost:5000` with your production URL:

```javascript
// Before
axios.get('http://localhost:5000/api/inventory')

// After
axios.get('https://yourdomain.com/api/inventory')
```

### 9.2 Use Environment Variables

Better approach - use environment variables:

Create `client/.env.production`:
```
REACT_APP_API_URL=https://yourdomain.com/api
```

Update axios calls:
```javascript
axios.get(`${process.env.REACT_APP_API_URL}/inventory`)
```

### 9.3 Rebuild and Redeploy

```bash
cd client
npm run build
# Upload new build files to public_html
```

---

## Step 10: Testing

### 10.1 Test All Features

1. **Registration**: Create a new merchant account
2. **Login**: Log in with credentials
3. **Inventory**: Add items manually and via Excel
4. **Billing**: Create a bill and print
5. **Reports**: Check sales and inventory reports
6. **Financial**: Add suppliers and record payments

### 10.2 Check Logs

```bash
# View application logs
pm2 logs medical-store

# Or check Node.js app logs in cPanel
```

---

## Step 11: Maintenance & Monitoring

### 11.1 Setup Automatic Restart

```bash
# Using PM2
pm2 startup
pm2 save
```

### 11.2 Database Backup

Set up automatic MySQL backups in cPanel:
1. Go to **Backup Wizard**
2. Schedule daily backups
3. Download backups regularly

### 11.3 Monitor Application

```bash
# Check application status
pm2 status

# Monitor resources
pm2 monit
```

---

## Troubleshooting

### Issue: Application Not Starting

**Check:**
- Node.js version compatibility
- All dependencies installed
- Environment variables set correctly
- Database connection working

**Solution:**
```bash
# Check logs
pm2 logs medical-store

# Restart application
pm2 restart medical-store
```

### Issue: Database Connection Failed

**Check:**
- Database credentials in .env
- Database host (might not be localhost)
- Database user has proper permissions

**Solution:**
```bash
# Test database connection
mysql -h hostname -u username -p database_name
```

### Issue: API Requests Failing

**Check:**
- Reverse proxy configuration
- CORS settings
- Firewall rules

**Solution:**
Update server.js CORS settings:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### Issue: File Upload Not Working

**Check:**
- uploads/ folder exists
- Folder has write permissions

**Solution:**
```bash
mkdir uploads
chmod 755 uploads
```

---

## Security Checklist

- [ ] Strong database password
- [ ] JWT secret is secure and random
- [ ] SSL certificate installed
- [ ] .env file not publicly accessible
- [ ] File upload directory secured
- [ ] Regular database backups
- [ ] Keep Node.js and dependencies updated
- [ ] Monitor application logs
- [ ] Implement rate limiting (optional)
- [ ] Set up firewall rules

---

## Performance Optimization

### Enable Compression

Add to server.js:
```javascript
const compression = require('compression');
app.use(compression());
```

### Enable Caching

Add to .htaccess:
```apache
# Cache static files
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## Support & Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

### Backup Strategy

1. **Daily**: Automatic database backups
2. **Weekly**: Full application backup
3. **Monthly**: Download backups locally

---

## Quick Deployment Checklist

- [ ] Database created and schema imported
- [ ] .env file configured with production credentials
- [ ] Frontend built (`npm run build`)
- [ ] Files uploaded to server
- [ ] Dependencies installed (`npm install --production`)
- [ ] Node.js app configured in cPanel
- [ ] Environment variables set
- [ ] Application started
- [ ] SSL certificate installed
- [ ] API URLs updated in frontend
- [ ] All features tested
- [ ] Backups configured

---

## Contact & Support

For issues specific to:
- **GoDaddy Hosting**: Contact GoDaddy support
- **Application Issues**: Check logs and troubleshooting section
- **Database Issues**: Verify credentials and permissions

---

**Congratulations!** Your Medical Store Billing System is now live on GoDaddy! 🎉
