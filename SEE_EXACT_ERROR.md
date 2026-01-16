# How to See the Exact Error

## Quick Fix - The logs are now improved!

I've fixed the logging to show actual data instead of `[object Object]`.

## Method 1: Use Test Registration Page (EASIEST!)

### Step 1: Deploy
```bash
cd client
npm run build
vercel --prod
```

### Step 2: Go to Test Page
Open: `https://your-app.vercel.app/test-registration`

### Step 3: Click "Test Registration"
This will:
- Show you the exact test data being sent
- Display the exact error response
- List all validation errors with field names
- Show in a nice formatted view

### Step 4: See the Error
The page will show:
```
❌ Error
Status Code: 400

{
  "error": "Validation failed",
  "details": [
    {
      "field": "phone",
      "message": "Invalid phone number format",
      "value": "1234567890"
    }
  ]
}

Validation Errors:
• phone: Invalid phone number format
```

## Method 2: Use Debug Console

### Step 1: Go to Register Page
`https://your-app.vercel.app/register`

### Step 2: Open Debug Console
Click "🔍 Show Debug Console" button

### Step 3: Fill Form and Submit

### Step 4: Check Logs
You'll now see properly formatted logs:
```
=== REGISTRATION ATTEMPT ===
Form Data: {
  "storeName": "ABC Pharmacy",
  "ownerName": "John Doe",
  "email": "test@example.com",
  ...
}

❌ API Error Response: {
  "status": 400,
  "statusText": "Bad Request",
  "errorData": {
    "error": "Validation failed",
    "details": [...]
  }
}

Error response data: {
  "error": "Validation failed",
  "details": [
    {
      "path": "phone",
      "msg": "Invalid phone number format"
    }
  ]
}
```

### Step 5: Download Logs
Click "💾 Download" to save the logs

## What the Error Means

### Status 400 = Validation Error
The server is rejecting your data because it doesn't meet validation rules.

### Common Validation Errors:

**storeName:**
- Must be 2-255 characters
- Only letters, numbers, spaces, hyphens, &, ., ', and commas
- Example: "ABC Pharmacy & Store"

**ownerName:**
- Must be 2-255 characters
- Only letters, spaces, and dots
- Example: "John Doe"

**email:**
- Must be valid email format
- Example: "user@example.com"

**password:**
- Must be at least 6 characters
- Example: "password123"

**phone:**
- Must be digits only (and +, -, spaces, parentheses)
- Example: "1234567890" or "+1 (123) 456-7890"

**gstNumber:**
- Optional
- Only uppercase letters and numbers
- Example: "GST123456"

**licenseNumber:**
- Optional
- Any alphanumeric
- Example: "LIC123456"

## Backend Logs (Render)

To see backend validation logs:

1. Go to Render Dashboard
2. Select your service
3. Click "Logs"
4. Look for:
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

## Quick Test

Try the test page first! It will show you:
1. ✅ If the backend is reachable
2. ✅ If the API endpoint works
3. ✅ Exact validation errors
4. ✅ Which fields are failing

Then you can fix the validation rules or adjust the form accordingly.

## Next Steps

1. **Deploy** the updated code
2. **Go to** `/test-registration` page
3. **Click** "Test Registration"
4. **See** the exact error
5. **Fix** the validation issue
6. **Try** the real registration form

The test page will tell you EXACTLY what's wrong! 🎯
