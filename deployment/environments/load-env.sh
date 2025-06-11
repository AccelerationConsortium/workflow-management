#!/bin/bash

# Environment Loading Script
# Usage: source deployment/environments/load-env.sh [environment]
# Example: source deployment/environments/load-env.sh development

set -e

# Default to development if no environment specified
ENV=${1:-development}

# Define environment file path
ENV_FILE="deployment/environments/.env.$ENV"

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    return 1 2>/dev/null || exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Environment file $ENV_FILE not found"
    echo "Available environments:"
    ls deployment/environments/.env.* 2>/dev/null | sed 's/.*\.env\./  - /' || echo "  No environment files found"
    return 1 2>/dev/null || exit 1
fi

echo "🔧 Loading environment: $ENV"

# Load environment variables
set -a  # automatically export all variables
source "$ENV_FILE"
set +a  # stop automatically exporting

# Validate required variables
validate_env() {
    local required_vars=(
        "NODE_ENV"
        "VITE_API_URL"
        "DATABASE_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Error: Missing required environment variables:"
        printf '  - %s\n' "${missing_vars[@]}"
        return 1
    fi
}

# Run validation
if ! validate_env; then
    return 1 2>/dev/null || exit 1
fi

echo "✅ Environment $ENV loaded successfully"
echo "📋 Key configuration:"
echo "   - NODE_ENV: $NODE_ENV"
echo "   - API URL: $VITE_API_URL"
echo "   - Database: ${DATABASE_URL%@*}@[HIDDEN]"

# Set useful aliases for this environment
alias start-frontend="npm run dev"
alias start-backend="cd backend && python main.py"
alias start-fileserver="cd server && npm run dev"
alias docker-up="docker-compose -f deployment/docker/docker-compose.yml --env-file $ENV_FILE up"
alias docker-down="docker-compose -f deployment/docker/docker-compose.yml down"

echo "🔨 Available aliases:"
echo "   - start-frontend: Start the frontend development server"
echo "   - start-backend: Start the backend API server"
echo "   - start-fileserver: Start the file server"
echo "   - docker-up: Start all services with Docker"
echo "   - docker-down: Stop all Docker services"