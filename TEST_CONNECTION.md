# Test Connection from Your Browser

## Quick Test

Open your browser console (F12) on your Vercel app and run:

```javascript
fetch('https://medical-store-billing-system.onrender.com/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ Backend reachable:', data))
.catch(err => console.error('❌ Backend not reachable:', err));
```

## Test Registration Endpoint

```javascript
fetch('https://medical-store-billing-system.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    storeName: 'Test',
    ownerName: 'Test',
    email: 'test@test.com',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

## What to Look For

### If you see CORS error:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solution:** Backend needs to be deployed with updated CORS

### If you see "Failed to fetch":
```
TypeError: Failed to fetch
```
**Possible causes:**
1. Backend is down
2. Network issue
3. SSL certificate problem

### If you see response:
```
✅ Backend reachable: { status: 'ok', ... }
```
**Good!** Backend is reachable, CORS might still need fixing

## Deploy Backend Now

```bash
git add .
git commit -m "Allow all Vercel preview URLs in CORS"
git push
```

This will allow ANY `.vercel.app` URL to access your backend, including preview deployments.

## After Deployment

1. Wait 2-3 minutes for Render to deploy
2. Run the browser tests above
3. Try registration again
4. Check Debug Console for detailed logs

## Alternative: Use Production Vercel URL

Instead of using preview URL, deploy to production:

```bash
cd client
vercel --prod
```

This will give you a stable URL like:
`https://medical-store-billing-system.vercel.app`

Which is already in the CORS whitelist!
