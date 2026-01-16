# Deployment Checklist

## Pre-Deployment

### 1. Verify ca.pem File
- [ ] `ca.pem` file exists in project root
- [ ] File is committed to Git

### 2. Set Render Environment Variables
Go to Render Dashboard → Your Service → Environment:

- [ ] `DB_HOST` = your database host
- [ ] `DB_PORT` = 3306 (or your port)
- [ ] `DB_USER` = your database username
- [ ] `DB_PASSWORD` = your database password
- [ ] `DB_NAME` = medical_store_billing
- [ ] `DB_SSL_CA` = ca.pem
- [ ] `NODE_ENV` = production
- [ ] `JWT_SECRET` = (random secret key)
- [ ] `CLIENT_URL` = https://your-vercel-app.vercel.app

### 3. Commit All Changes
```bash
git add .
git commit -m "Add comprehensive logging and fix database connection"
git status  # Make sure everything is committed
```

## Deployment Steps

### Step 1: Deploy Backend (Render)

```bash
# Push to trigger auto-deploy
git push origin main
```

Or manually:
1. Go to Render Dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

**Wait for deployment to complete** (2-5 minutes)

### Step 2: Check Render Logs

Look for:
```
✅ Database connection test completed successfully
✅ Merchants table exists
```

If you see errors, fix them before deploying frontend.

### Step 3: Run Database Setup (if needed)

If logs show "Merchants table does NOT exist":
```bash
curl https://your-backend.onrender.com/run-db-setup
```

### Step 4: Deploy Frontend (Vercel)

```bash
cd client
npm install  # Make sure dependencies are up to date
npm run build
vercel --prod
```

Or if auto-deploy is enabled:
```bash
git push origin main
```

## Post-Deployment Testing

### Test 1: Check Backend Health
```bash
curl https://your-backend.onrender.com/run-db-setup
```

Expected: `✔ Tables created successfully!`

### Test 2: Test Registration Page
1. Go to: `https://your-app.vercel.app/test-registration`
2. Click "Test Registration"
3. Check result

**Expected Success:**
```json
{
  "message": "Merchant registered successfully",
  "merchantId": "MERCH..."
}
```

**If Error:** Check Render logs for details

### Test 3: Try Real Registration
1. Go to: `https://your-app.vercel.app/register`
2. Fill the form with valid data:
   - Store Name: ABC Pharmacy
   - Owner Name: John Doe
   - Email: test@example.com
   - Password: password123
   - Phone: 1234567890
   - Address: 123 Test St
3. Click Register
4. Check for success message

### Test 4: Try Login
1. Go to: `https://your-app.vercel.app/login`
2. Use the credentials from registration
3. Should redirect to dashboard

## Troubleshooting

### Backend Issues

**Database connection failed:**
1. Check Render environment variables
2. Verify database is running
3. Check SSL certificate path
4. Review Render logs

**Tables don't exist:**
```bash
curl https://your-backend.onrender.com/run-db-setup
```

**500 errors:**
1. Check Render logs for detailed error
2. Verify all environment variables are set
3. Check database credentials

### Frontend Issues

**Can't reach backend:**
1. Verify backend URL in `client/src/config.js`
2. Check CORS settings in `server.js`
3. Verify backend is running on Render

**CORS errors:**
1. Check `CLIENT_URL` in Render environment variables
2. Verify it matches your Vercel URL exactly
3. Redeploy backend after changing

## Verification Checklist

After deployment, verify:

- [ ] Backend is running on Render
- [ ] Frontend is running on Vercel
- [ ] Database connection works (check Render logs)
- [ ] Tables exist in database
- [ ] Test registration works
- [ ] Real registration works
- [ ] Login works
- [ ] No CORS errors in browser console
- [ ] Debug Console shows proper logs

## Quick Commands Reference

```bash
# Deploy backend (if auto-deploy)
git push origin main

# Deploy frontend
cd client
npm run build
vercel --prod

# Test database setup
curl https://your-backend.onrender.com/run-db-setup

# Check backend logs
# Go to: https://dashboard.render.com → Your Service → Logs

# Test registration
# Go to: https://your-app.vercel.app/test-registration
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Database connection failed | Check environment variables on Render |
| SSL certificate not found | Verify `ca.pem` is in repository |
| Tables don't exist | Run `/run-db-setup` endpoint |
| 500 error on registration | Check Render logs for detailed error |
| CORS error | Update `CLIENT_URL` on Render |
| Can't login after registration | Check JWT_SECRET is set |

## Success Indicators

You'll know everything is working when:

1. ✅ Render logs show: "Database connection test completed successfully"
2. ✅ Test registration returns success with merchantId
3. ✅ Real registration shows "Registration successful!"
4. ✅ Login redirects to dashboard
5. ✅ No errors in browser console
6. ✅ Debug Console shows all API calls succeeding

## Need Help?

If issues persist:
1. Download logs from Debug Console (💾 button)
2. Copy Render logs (from when error occurs)
3. Share both logs for debugging

The detailed logs will show exactly what's wrong! 🎯
