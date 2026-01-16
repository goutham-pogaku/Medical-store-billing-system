#!/bin/bash

# Medical Store Billing System - Deployment Script
# This script prepares your application for GoDaddy deployment

echo "🚀 Starting deployment preparation..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Step 2: Build frontend
echo "🔨 Building frontend..."
cd client
npm run build
cd ..

# Step 3: Create deployment folder
echo "📁 Creating deployment folder..."
rm -rf deployment
mkdir -p deployment
mkdir -p deployment/config
mkdir -p deployment/middleware
mkdir -p deployment/uploads
mkdir -p deployment/public

# Step 4: Copy backend files
echo "📋 Copying backend files..."
cp server.js deployment/
cp package.json deployment/
cp .env deployment/.env.production
cp config/database.js deployment/config/
cp middleware/auth.js deployment/middleware/

# Step 5: Copy frontend build
echo "📋 Copying frontend build..."
cp -r client/build/* deployment/public/

# Step 6: Create production package.json
echo "📝 Creating production package.json..."
cat > deployment/package.json << 'EOF'
{
  "name": "medical-store-billing",
  "version": "1.0.0",
  "description": "Medical Store Billing System",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5",
    "uuid": "^9.0.0",
    "body-parser": "^1.20.2",
    "mysql2": "^3.6.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1"
  }
}
EOF

# Step 7: Create .htaccess for Apache
echo "📝 Creating .htaccess..."
cat > deployment/public/.htaccess << 'EOF'
# Enable Rewrite Engine
RewriteEngine On

# Force HTTPS (uncomment after SSL is installed)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API requests go to Node.js backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# All other requests serve React app
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

# Step 8: Create README for deployment
echo "📝 Creating deployment README..."
cat > deployment/README.md << 'EOF'
# Deployment Files

## Upload Instructions

1. Upload all files in this folder to your GoDaddy server
2. Update .env.production with your database credentials
3. Run: npm install --production
4. Configure Node.js app in cPanel
5. Start the application

## File Structure

- server.js - Main application file
- package.json - Dependencies
- .env.production - Environment variables (UPDATE THIS!)
- config/ - Configuration files
- middleware/ - Authentication middleware
- public/ - Frontend build files (upload to public_html)
- uploads/ - File upload directory

## Important

- Update .env.production with your actual database credentials
- Update API URLs in the frontend if needed
- Ensure MySQL database is created and schema is imported
EOF

echo "✅ Deployment preparation complete!"
echo ""
echo "📦 Deployment files are in the 'deployment' folder"
echo ""
echo "Next steps:"
echo "1. Update deployment/.env.production with your GoDaddy database credentials"
echo "2. Upload files to your GoDaddy server via FTP"
echo "3. Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "🎉 Good luck with your deployment!"