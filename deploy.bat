@echo off
REM Medical Store Billing System - Deployment Script for Windows
REM This script prepares your application for GoDaddy deployment

echo Starting deployment preparation...
echo.

REM Step 1: Install dependencies
echo Installing dependencies...
call npm install
cd client
call npm install
cd ..

REM Step 2: Build frontend
echo Building frontend...
cd client
call npm run build
cd ..

REM Step 3: Create deployment folder
echo Creating deployment folder...
if exist deployment rmdir /s /q deployment
mkdir deployment
mkdir deployment\config
mkdir deployment\middleware
mkdir deployment\uploads
mkdir deployment\public

REM Step 4: Copy backend files
echo Copying backend files...
copy server.js deployment\
copy package.json deployment\
copy .env deployment\.env.production
copy config\database.js deployment\config\
copy middleware\auth.js deployment\middleware\

REM Step 5: Copy frontend build
echo Copying frontend build...
xcopy /E /I /Y client\build deployment\public

REM Step 6: Create production package.json
echo Creating production package.json...
(
echo {
echo   "name": "medical-store-billing",
echo   "version": "1.0.0",
echo   "description": "Medical Store Billing System",
echo   "main": "server.js",
echo   "scripts": {
echo     "start": "node server.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "multer": "^1.4.5-lts.1",
echo     "xlsx": "^0.18.5",
echo     "uuid": "^9.0.0",
echo     "body-parser": "^1.20.2",
echo     "mysql2": "^3.6.0",
echo     "bcryptjs": "^2.4.3",
echo     "jsonwebtoken": "^9.0.2",
echo     "dotenv": "^16.3.1"
echo   }
echo }
) > deployment\package.json

REM Step 7: Create .htaccess
echo Creating .htaccess...
(
echo # Enable Rewrite Engine
echo RewriteEngine On
echo.
echo # Force HTTPS ^(uncomment after SSL is installed^)
echo # RewriteCond %%{HTTPS} off
echo # RewriteRule ^^^(.*^)$ https://%%{HTTP_HOST}%%{REQUEST_URI} [L,R=301]
echo.
echo # API requests go to Node.js backend
echo RewriteCond %%{REQUEST_URI} ^^/api/
echo RewriteRule ^^api/^(.*^)$ http://localhost:3000/api/$1 [P,L]
echo.
echo # All other requests serve React app
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule ^^ index.html [L]
) > deployment\public\.htaccess

REM Step 8: Create deployment README
echo Creating deployment README...
(
echo # Deployment Files
echo.
echo ## Upload Instructions
echo.
echo 1. Upload all files in this folder to your GoDaddy server
echo 2. Update .env.production with your database credentials
echo 3. Run: npm install --production
echo 4. Configure Node.js app in cPanel
echo 5. Start the application
echo.
echo ## File Structure
echo.
echo - server.js - Main application file
echo - package.json - Dependencies
echo - .env.production - Environment variables ^(UPDATE THIS!^)
echo - config/ - Configuration files
echo - middleware/ - Authentication middleware
echo - public/ - Frontend build files ^(upload to public_html^)
echo - uploads/ - File upload directory
echo.
echo ## Important
echo.
echo - Update .env.production with your actual database credentials
echo - Update API URLs in the frontend if needed
echo - Ensure MySQL database is created and schema is imported
) > deployment\README.md

echo.
echo ========================================
echo Deployment preparation complete!
echo ========================================
echo.
echo Deployment files are in the 'deployment' folder
echo.
echo Next steps:
echo 1. Update deployment\.env.production with your GoDaddy database credentials
echo 2. Upload files to your GoDaddy server via FTP
echo 3. Follow the DEPLOYMENT_GUIDE.md for detailed instructions
echo.
echo Good luck with your deployment!
echo.
pause