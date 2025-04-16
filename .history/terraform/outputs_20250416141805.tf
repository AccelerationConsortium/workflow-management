output "s3_bucket_name" {
  description = "S3 存储桶名称"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_website_endpoint" {
  description = "S3 网站终端节点"
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
}

output "cloudfront_distribution_id" {
  description = "CloudFront 分配 ID"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront 域名"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "网站 URL"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "cicd_user_access_key_id" {
  description = "CI/CD 部署用户的访问密钥 ID"
  value       = aws_iam_access_key.cicd.id
}

output "cicd_user_secret_access_key" {
  description = "CI/CD 部署用户的秘密访问密钥"
  value       = aws_iam_access_key.cicd.secret
  sensitive   = true
}

output "cognito_user_pool_id" {
  description = "Cognito 用户池 ID"
  value       = var.create_cognito_user_pool ? aws_cognito_user_pool.main[0].id : null
}

output "cognito_user_pool_client_id" {
  description = "Cognito 用户池客户端 ID"
  value       = var.create_cognito_user_pool ? aws_cognito_user_pool_client.main[0].id : null
}

output "cognito_hosted_ui_url" {
  description = "Cognito 托管 UI URL"
  value       = var.create_cognito_user_pool ? "https://${aws_cognito_user_pool_domain.main[0].domain}.auth.${var.aws_region}.amazoncognito.com" : null
} 

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.website.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.website.id
}
