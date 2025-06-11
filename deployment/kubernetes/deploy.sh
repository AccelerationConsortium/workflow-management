#!/bin/bash

# Kubernetes Deployment Script for Workflow Management System

set -e

# Configuration
NAMESPACE="workflow-management"
KUBECTL_CONTEXT=${KUBECTL_CONTEXT:-""}

echo "🚀 Starting Kubernetes deployment for Workflow Management System..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl not found. Please install kubectl first."
    exit 1
fi

# Set kubectl context if provided
if [ -n "$KUBECTL_CONTEXT" ]; then
    echo "🔧 Setting kubectl context to: $KUBECTL_CONTEXT"
    kubectl config use-context "$KUBECTL_CONTEXT"
fi

# Function to wait for deployment
wait_for_deployment() {
    local deployment=$1
    echo "⏳ Waiting for $deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n $NAMESPACE
}

# Function to wait for pod
wait_for_pod() {
    local label=$1
    echo "⏳ Waiting for pods with label $label to be ready..."
    kubectl wait --for=condition=ready --timeout=300s pod -l $label -n $NAMESPACE
}

# Create namespace
echo "📋 Creating namespace..."
kubectl apply -f deployment/kubernetes/namespace.yaml

# Apply ConfigMap and Secrets
echo "🔧 Applying configuration..."
kubectl apply -f deployment/kubernetes/configmap.yaml
kubectl apply -f deployment/kubernetes/secrets.yaml

# Deploy PostgreSQL
echo "🗄️ Deploying PostgreSQL..."
kubectl apply -f deployment/kubernetes/postgresql.yaml
wait_for_pod "app=postgres"

# Deploy Redis
echo "📦 Deploying Redis..."
kubectl apply -f deployment/kubernetes/redis.yaml
wait_for_pod "app=redis"

# Deploy Backend
echo "🖥️ Deploying Backend..."
kubectl apply -f deployment/kubernetes/backend.yaml
wait_for_deployment "workflow-backend"

# Deploy Frontend
echo "🌐 Deploying Frontend..."
kubectl apply -f deployment/kubernetes/frontend.yaml
wait_for_deployment "workflow-frontend"

# Deploy Ingress
echo "🌍 Setting up Ingress..."
kubectl apply -f deployment/kubernetes/ingress.yaml

# Show deployment status
echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Deployment Status:"
kubectl get pods -n $NAMESPACE
echo ""
echo "🌐 Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "🔗 Ingress:"
kubectl get ingress -n $NAMESPACE

# Get external IP
EXTERNAL_IP=$(kubectl get ingress workflow-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")
if [ "$EXTERNAL_IP" != "Pending..." ] && [ -n "$EXTERNAL_IP" ]; then
    echo ""
    echo "🎉 Application is accessible at:"
    echo "   Frontend: https://workflow-management.com"
    echo "   API: https://api.workflow-management.com"
    echo "   Files: https://files.workflow-management.com"
    echo ""
    echo "📝 Make sure to point your domain to: $EXTERNAL_IP"
else
    echo ""
    echo "⏳ Waiting for external IP assignment..."
    echo "   Check status with: kubectl get ingress workflow-ingress -n $NAMESPACE"
fi

echo ""
echo "🔧 Useful commands:"
echo "   View logs: kubectl logs -f deployment/workflow-backend -n $NAMESPACE"
echo "   Scale up: kubectl scale deployment workflow-backend --replicas=5 -n $NAMESPACE"
echo "   Port forward: kubectl port-forward service/frontend-service 8080:80 -n $NAMESPACE"