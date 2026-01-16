#!/bin/bash

echo "🔧 Deploying Registration Fix..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the client
echo "📦 Building client..."
cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Client build failed"
    exit 1
fi

echo "✅ Client build successful"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Vercel deployment failed"
    exit 1
fi

echo "✅ Vercel deployment successful"
echo ""

# Remind about backend
echo "⚠️  IMPORTANT: Don't forget to deploy the backend!"
echo ""
echo "Backend deployment options:"
echo "1. Push to your Git repository (if auto-deploy is enabled on Render)"
echo "2. Manually trigger deployment from Render dashboard"
echo ""
echo "✅ All done! Test your registration at your Vercel URL"
