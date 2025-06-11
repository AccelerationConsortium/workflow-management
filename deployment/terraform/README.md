# Terraform Infrastructure for Canvas Frontend

This folder contains the Terraform scripts to deploy the **Canvas Frontend** as a static website on AWS.

## 🧱 Services Used
- Amazon S3 (for static hosting)
- CloudFront (for global CDN + HTTPS)
- IAM (for CI/CD access)
- Cognito (optional, currently disabled)

## 🚀 Deployment Instructions

### 1. Setup Terraform CLI
```bash
brew install terraform

## 🔧 Terraform deployment

```bash
cd terraform
terraform init
terraform apply
