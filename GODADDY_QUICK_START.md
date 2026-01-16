# GoDaddy Deployment - Quick Start Guide

## 🚀 5-Step Deployment Process

### Step 1: Prepare Your Files (5 minutes)

**On Windows:**
```bash
deploy.bat
```

**On Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

This creates a `deployment` folder with all necessary files.

---

### Step 2: Setup Database (10 minutes)

1. **Login to GoDaddy cPanel**
2. **Go to MySQL Databases**
3. **Create Database:**
   - Database name: `medical_store_billing`
   - Create user with strong password
   - Add user to database with ALL PRIVILEGES

4. **Import Schema:**
   - Open phpMyAdmin
   - Select your database
   - Go to SQL tab
   - Copy/paste contents of `database/schema.sql`
   - Click Go

5. **Note Your Credentials:**
   ```
   Database Host: _____________ (usually localhost)
   Database Name: _____________
   Database User: _____________
   Database Password: _____________
   ```

---

### Step 3: Configure Environment (2 minutes)

Edit `deployment/.env.production`:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=medical_store_billing
JWT_SECRET=983f4de169ff9d3da22cb7ede28f3c9678ef47d2acbc9e9eac0be154936b7c85edbfac0df77d756f71bb724919d2f605017c71f8a38f381dffe386dd2e7ef624
PORT=3000
NODE_ENV=production
```

---

### Step 4: Upload Files (15 minutes)

**Using FileZilla or FTP Client:**

1. **Connect to GoDaddy:**
   - Host: `ftp.yourdomain.com`
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

2. **Upload Backend Files:**
   ```
   Upload to: /home/username/
   Files:
   - server.js
   - package.json
   - .env.production (rename to .env)
   - config/ folder
   - middleware/ folder
   - uploads/ folder (empty)
   ```

3. **Upload Frontend Files:**
   ```
   Upload to: /home/username/public_html/
   Files: Everything from deployment/public/
   - index.html
   - static/ folder
   - .htaccess
   - All other files
   ```

---

### Step 5: Start Application (10 minutes)

**Option A: Using cPanel (Recommended)**

1. **Go to cPanel → Setup Node.js App**
2. **Click "Create Application"**
3. **Configure:**
   - Node.js version: 18.x or 20.x
   - Application mode: Production
   - Application root: `/home/username/`
   - Application URL: `yourdomain.com`
   - Application startup file: `server.js`

4. **Add Environment Variables:**
   - Click "Add Variable" for each .env variable
   - Or upload .env file

5. **Click "Create"**
6. **Run Command:** `npm install --production`
7. **Click "Start App"**

**Option B: Using SSH**

```bash
# Connect via SSH
ssh username@yourdomain.com

# Navigate to app directory
cd /home/username/

# Install dependencies
npm install --production

# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name medical-store

# Save PM2 configuration
pm2 save
pm2 startup
```

---

## ✅ Verify Deployment

### Test Your Application:

1. **Visit:** `https://yourdomain.com`
2. **Register:** Create a new merchant account
3. **Login:** Use your credentials
4. **Test Features:**
   - Add inventory items
   - Create a bill
   - View reports
   - Add suppliers
   - Record payments

---

## 🔧 Troubleshooting

### Issue: White Screen / Blank Page

**Solution:**
- Check browser console for errors
- Verify all files uploaded correctly
- Check .htaccess file is in public_html

### Issue: API Errors / 404

**Solution:**
- Verify Node.js app is running in cPanel
- Check .htaccess proxy rules
- Test API directly: `https://yourdomain.com/api/inventory`

### Issue: Database Connection Error

**Solution:**
- Verify database credentials in .env
- Check database host (might not be localhost)
- Ensure database user has permissions

### Issue: Cannot Login / Register

**Solution:**
- Check browser console for CORS errors
- Verify JWT_SECRET is set
- Check database tables exist

---

## 📞 Getting Help

### Check Logs:

**cPanel:**
- Setup Node.js App → Your App → View Logs

**SSH:**
```bash
pm2 logs medical-store
```

### Common Commands:

```bash
# Restart app
pm2 restart medical-store

# Check status
pm2 status

# View logs
pm2 logs

# Stop app
pm2 stop medical-store
```

---

## 🔒 Security Checklist

After deployment:

- [ ] SSL certificate installed (HTTPS)
- [ ] Strong database password
- [ ] .env file not publicly accessible
- [ ] Regular backups enabled
- [ ] Test all features work correctly

---

## 📱 Access Your Application

**Your Medical Store Billing System is now live at:**
- Frontend: `https://yourdomain.com`
- API: `https://yourdomain.com/api`

**Default Test Account:**
- Email: `admin@citymedical.com`
- Password: `password`

**⚠️ Important:** Change or delete this test account after deployment!

---

## 🎉 Congratulations!

Your Medical Store Billing System is now deployed on GoDaddy!

**Next Steps:**
1. Create your actual merchant account
2. Add your inventory
3. Start billing customers
4. Monitor reports and analytics

**Need detailed instructions?** See `DEPLOYMENT_GUIDE.md`

---

## 💡 Pro Tips

1. **Enable Auto-Backups:** Set up daily database backups in cPanel
2. **Monitor Performance:** Use PM2 monitoring features
3. **Update Regularly:** Keep dependencies updated with `npm update`
4. **Use SSL:** Always use HTTPS for security
5. **Test Thoroughly:** Test all features after deployment

---

**Support:** For GoDaddy-specific issues, contact GoDaddy support
**Application Issues:** Check logs and troubleshooting section above
