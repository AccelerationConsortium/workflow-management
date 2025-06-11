# 创建 CI/CD 用户，用于 GitHub Actions 部署
resource "aws_iam_user" "cicd" {
  name = "${var.app_name}-${var.environment}-cicd-user"
  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-cicd-user"
  })
}

# 创建 S3 部署策略
resource "aws_iam_policy" "s3_deploy" {
  name        = "${var.app_name}-${var.environment}-s3-deploy-policy"
  description = "Policy for deploying to S3 and invalidating CloudFront cache"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.website.arn,
          "${aws_s3_bucket.website.arn}/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = aws_cloudfront_distribution.website.arn
      }
    ]
  })
}

# 将策略附加到 CI/CD 用户
resource "aws_iam_user_policy_attachment" "s3_deploy" {
  user       = aws_iam_user.cicd.name
  policy_arn = aws_iam_policy.s3_deploy.arn
}

# 创建访问密钥，用于 GitHub Actions
resource "aws_iam_access_key" "cicd" {
  user = aws_iam_user.cicd.name
} 
