resource "aws_cognito_user_pool" "main" {
  count = var.create_cognito_user_pool ? 1 : 0
  
  name = "${var.app_name}-${var.environment}-user-pool"
  
  username_attributes      = ["email"]
  
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }
  
  auto_verified_attributes = ["email"]
  
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
  }
  
  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = false
  }
  
  admin_create_user_config {
    allow_admin_create_user_only = false
  }
  
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-user-pool"
  })
}

resource "aws_cognito_user_pool_client" "main" {
  count = var.create_cognito_user_pool ? 1 : 0
  
  name                         = "${var.app_name}-${var.environment}-client"
  user_pool_id                 = aws_cognito_user_pool.main[0].id
  generate_secret              = false
  refresh_token_validity       = 30
  prevent_user_existence_errors = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
  
  callback_urls = ["https://${aws_cloudfront_distribution.website.domain_name}/callback"]
  logout_urls   = ["https://${aws_cloudfront_distribution.website.domain_name}/logout"]
  
  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  supported_identity_providers = ["COGNITO"]
}

resource "aws_cognito_user_pool_domain" "main" {
  count = var.create_cognito_user_pool ? 1 : 0
  
  domain       = "${var.app_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main[0].id
} 
