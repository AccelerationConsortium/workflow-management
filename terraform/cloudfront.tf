resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${var.app_name}-${var.environment}-oac"
  description                       = "OAC for ${var.app_name} ${var.environment} website"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.default_root_object
  price_class         = "PriceClass_All"  # 全球分发
  
  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.website.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.website.id}"
    
    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
  
  # SPA 路由支持 - 所有 404 错误都返回 index.html
  dynamic "custom_error_response" {
    for_each = var.single_page_application ? [404] : []
    content {
      error_code         = custom_error_response.value
      response_code      = 200
      response_page_path = "/index.html"
    }
  }
  
  # 添加其他错误处理
  dynamic "custom_error_response" {
    for_each = var.single_page_application ? [403] : []
    content {
      error_code         = custom_error_response.value
      response_code      = 200
      response_page_path = "/index.html"
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  # 使用 CloudFront 默认证书
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  tags = merge(var.tags, {
    Name = "${var.app_name}-${var.environment}-cloudfront"
  })
} 
