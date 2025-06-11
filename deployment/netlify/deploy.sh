#!/bin/bash

# Netlify Deployment Script for Workflow Management System

set -e

echo "🚀 Starting Netlify deployment for Workflow Management System..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Copy netlify.toml to root directory
echo "📋 Copying Netlify configuration..."
cp deployment/netlify/netlify.toml ./netlify.toml

# Set environment variables for production build
echo "🔧 Setting environment variables..."
export NODE_ENV=production
export VITE_API_URL=${VITE_API_URL:-https://api.workflow-management.com}
export VITE_FILE_SERVER_URL=${VITE_FILE_SERVER_URL:-https://files.workflow-management.com}

# Install dependencies and build
echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building the project..."
npm run build

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please login to Netlify:"
    netlify login
fi

# Deploy based on argument
if [ "$1" = "prod" ]; then
    echo "🏭 Deploying to production..."
    netlify deploy --prod --dir=dist
elif [ "$1" = "init" ]; then
    echo "🆕 Initializing new Netlify site..."
    netlify init
else
    echo "🧪 Deploying to preview..."
    netlify deploy --dir=dist
fi

# Clean up
echo "🧹 Cleaning up..."
rm -f ./netlify.toml

echo "✅ Deployment completed successfully!"

if [ "$1" = "prod" ]; then
    echo "🌐 Your site is live! Check your Netlify dashboard for the URL."
else
    echo "🔗 Preview URL will be shown above."
fi

echo ""
echo "📝 Next steps:"
echo "   1. Set up custom domain in Netlify dashboard"
echo "   2. Configure environment variables in Netlify"
echo "   3. Set up branch deploys for staging"
echo "   4. Configure form handling if needed"
echo ""
echo "🔧 Useful commands:"
echo "   netlify open          - Open site dashboard"
echo "   netlify env:list      - List environment variables"
echo "   netlify logs          - View deployment logs"