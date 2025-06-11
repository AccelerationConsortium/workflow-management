#!/bin/bash

# Cloudflare Deployment Script for Workflow Management System
# Deploys both frontend (Pages) and backend (Workers) with full-stack capabilities

set -e

echo "🚀 Starting Cloudflare full-stack deployment for Workflow Management System..."

# Configuration
PROJECT_NAME="workflow-management"
WORKER_NAME="workflow-management-api"

# Check if Wrangler CLI is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check authentication
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Please login to Cloudflare:"
    wrangler login
fi

# Function to setup D1 database
setup_database() {
    echo "🗄️ Setting up D1 database..."
    
    # Create D1 database if it doesn't exist
    if ! wrangler d1 list | grep -q "$PROJECT_NAME"; then
        echo "Creating new D1 database: $PROJECT_NAME"
        wrangler d1 create $PROJECT_NAME
        echo "⚠️  Please update the database_id in wrangler.toml with the ID shown above"
        read -p "Press Enter after updating wrangler.toml..."
    fi
    
    # Execute schema
    echo "📋 Applying database schema..."
    wrangler d1 execute $PROJECT_NAME --file=deployment/cloudflare/schema.sql
    
    echo "✅ Database setup completed"
}

# Function to setup KV namespaces
setup_kv() {
    echo "📦 Setting up KV namespaces..."
    
    # Create KV namespace for caching
    if ! wrangler kv:namespace list | grep -q "WORKFLOW_CACHE"; then
        echo "Creating KV namespace: WORKFLOW_CACHE"
        wrangler kv:namespace create "WORKFLOW_CACHE"
        echo "⚠️  Please update the KV namespace ID in wrangler.toml"
        read -p "Press Enter after updating wrangler.toml..."
    fi
    
    echo "✅ KV setup completed"
}

# Function to setup R2 buckets
setup_r2() {
    echo "🪣 Setting up R2 object storage..."
    
    # Create R2 bucket for file storage
    if ! wrangler r2 bucket list | grep -q "workflow-files"; then
        echo "Creating R2 bucket: workflow-files"
        wrangler r2 bucket create workflow-files
    fi
    
    echo "✅ R2 setup completed"
}

# Function to deploy Workers
deploy_workers() {
    echo "⚙️ Deploying Cloudflare Workers..."
    
    cd deployment/cloudflare
    
    # Deploy the main API worker
    echo "📡 Deploying API Worker..."
    wrangler deploy --name $WORKER_NAME
    
    cd ../..
    
    echo "✅ Workers deployment completed"
}

# Function to deploy Pages
deploy_pages() {
    echo "🌐 Deploying Cloudflare Pages..."
    
    # Copy necessary files to root
    cp deployment/cloudflare/pages.toml ./wrangler.toml
    cp -r deployment/cloudflare/functions ./functions
    
    # Set environment variables for build
    export NODE_ENV=production
    export VITE_API_URL="https://api.workflow-management.com"
    export VITE_FILE_SERVER_URL="https://files.workflow-management.com"
    export VITE_WS_URL="wss://api.workflow-management.com/ws"
    
    # Install dependencies and build
    echo "📦 Installing dependencies..."
    npm ci
    
    echo "🔨 Building frontend..."
    npm run build
    
    # Deploy to Pages
    if [ "$1" = "init" ]; then
        echo "🆕 Initializing new Pages project..."
        wrangler pages project create $PROJECT_NAME --production-branch main
    fi
    
    if [ "$1" = "prod" ]; then
        echo "🏭 Deploying to production..."
        wrangler pages deploy dist --project-name $PROJECT_NAME --branch main
    else
        echo "🧪 Deploying to preview..."
        wrangler pages deploy dist --project-name $PROJECT_NAME
    fi
    
    # Clean up
    rm -f ./wrangler.toml
    rm -rf ./functions
    
    echo "✅ Pages deployment completed"
}

# Function to setup custom domains
setup_domains() {
    echo "🌍 Setting up custom domains..."
    
    echo "📝 To setup custom domains:"
    echo "   1. Add your domain to Cloudflare DNS"
    echo "   2. Update the zone_id in wrangler.toml"
    echo "   3. Run: wrangler pages project create $PROJECT_NAME --production-branch main"
    echo "   4. Add custom domain in Cloudflare dashboard"
    
    echo "💡 Recommended domain structure:"
    echo "   - Frontend: https://workflow-management.com"
    echo "   - API: https://api.workflow-management.com"
    echo "   - Files: https://files.workflow-management.com"
}

# Function to show deployment status
show_status() {
    echo ""
    echo "✅ Cloudflare deployment completed successfully!"
    echo ""
    echo "📊 Deployment Status:"
    echo "   🌐 Pages Project: $PROJECT_NAME"
    echo "   ⚙️  Worker: $WORKER_NAME"
    echo "   🗄️  Database: $PROJECT_NAME (D1)"
    echo "   📦 Cache: WORKFLOW_CACHE (KV)"
    echo "   🪣 Storage: workflow-files (R2)"
    echo ""
    echo "🔗 Next Steps:"
    echo "   1. Configure custom domains in Cloudflare dashboard"
    echo "   2. Set up environment variables for production"
    echo "   3. Test the deployment"
    echo "   4. Set up monitoring and analytics"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   wrangler pages deployment list --project-name $PROJECT_NAME"
    echo "   wrangler tail $WORKER_NAME"
    echo "   wrangler d1 execute $PROJECT_NAME --command 'SELECT * FROM workflows;'"
    echo "   wrangler r2 object list workflow-files"
}

# Main deployment process
main() {
    case "$1" in
        "init")
            echo "🆕 Initializing full Cloudflare deployment..."
            setup_database
            setup_kv
            setup_r2
            deploy_workers
            deploy_pages init
            setup_domains
            show_status
            ;;
        "workers")
            echo "⚙️ Deploying only Workers..."
            deploy_workers
            ;;
        "pages")
            echo "🌐 Deploying only Pages..."
            deploy_pages "$2"
            ;;
        "prod")
            echo "🏭 Deploying to production..."
            deploy_workers
            deploy_pages prod
            show_status
            ;;
        "setup")
            echo "🛠️ Setting up infrastructure only..."
            setup_database
            setup_kv
            setup_r2
            ;;
        *)
            echo "🧪 Deploying to preview..."
            deploy_workers
            deploy_pages
            show_status
            ;;
    esac
}

# Run main function with arguments
main "$@"