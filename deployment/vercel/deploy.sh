#!/bin/bash

# Vercel Deployment Script for Workflow Management System

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment for Workflow Management System..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Copy vercel.json to root directory
echo "📋 Copying Vercel configuration..."
cp deployment/vercel/vercel.json ./vercel.json

# Set environment variables for production build
echo "🔧 Setting environment variables..."
export NODE_ENV=production
export VITE_API_URL=${VITE_API_URL:-https://your-backend-api.com}
export VITE_FILE_SERVER_URL=${VITE_FILE_SERVER_URL:-https://your-file-server.com}

# Build the project
echo "🔨 Building the project..."
npm ci
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if [ "$1" = "prod" ]; then
    echo "🏭 Deploying to production..."
    vercel --prod --yes
else
    echo "🧪 Deploying to preview..."
    vercel --yes
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f ./vercel.json

echo "✅ Deployment completed successfully!"
echo "📝 Don't forget to:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure your backend API URL"
echo "   3. Set up custom domain if needed"