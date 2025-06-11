variable "aws_region" {
  description = "AWS 区域"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "环境名称 (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "domain_name" {
  description = "网站的主域名（可选，仅用于标识）"
  type        = string
  default     = "example.com"
}

variable "app_name" {
  description = "应用名称"
  type        = string
  default     = "canvas"
}

variable "create_cognito_user_pool" {
  description = "是否创建 Cognito 用户池"
  type        = bool
  default     = false
}

variable "alternative_domain_names" {
  description = "CloudFront 分配的备用域名列表（已废弃，仅保留兼容性）"
  type        = list(string)
  default     = []
}

variable "single_page_application" {
  description = "是否为单页应用，启用特殊的 CloudFront 错误页面设置"
  type        = bool
  default     = true
}

variable "default_root_object" {
  description = "CloudFront 默认根对象"
  type        = string
  default     = "index.html"
}

variable "tags" {
  description = "资源标签"
  type        = map(string)
  default     = {}
} 
