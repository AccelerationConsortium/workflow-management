"""
N8N Connector Configuration

Handles configuration settings for n8n integration including endpoints,
authentication, and webhook settings.
"""

import os
from typing import Optional, Dict, Any
from dataclasses import dataclass
from pathlib import Path


@dataclass
class N8NEndpoints:
    """N8N endpoint configuration"""
    notify_status: str = "notify-experiment-status"
    alert_intervention: str = "alert-human-intervention" 
    report_ready: str = "report-ready"
    error_notification: str = "error-notification"


@dataclass
class N8NWebhookConfig:
    """Webhook configuration for receiving n8n requests"""
    base_path: str = "/api/v1/n8n"
    trigger_experiment: str = "/trigger-experiment"
    pause_experiment: str = "/pause-experiment"
    resume_experiment: str = "/resume-experiment"
    get_status: str = "/get-status"
    inject_user_input: str = "/inject-user-input"


class N8NConfig:
    """Main configuration class for N8N connector"""
    
    def __init__(self):
        self.base_url = os.getenv("N8N_BASE_URL", "https://n8n.localhost/webhook/")
        self.auth_token = os.getenv("N8N_AUTH_TOKEN", "")
        self.webhook_secret = os.getenv("N8N_WEBHOOK_SECRET", "")
        self.timeout = int(os.getenv("N8N_TIMEOUT", "30"))
        self.retry_attempts = int(os.getenv("N8N_RETRY_ATTEMPTS", "3"))
        self.retry_delay = int(os.getenv("N8N_RETRY_DELAY", "5"))
        
        # Endpoint configurations
        self.endpoints = N8NEndpoints(
            notify_status=os.getenv("N8N_NOTIFY_ENDPOINT", "notify-experiment-status"),
            alert_intervention=os.getenv("N8N_ALERT_ENDPOINT", "alert-human-intervention"),
            report_ready=os.getenv("N8N_REPORT_ENDPOINT", "report-ready"),
            error_notification=os.getenv("N8N_ERROR_ENDPOINT", "error-notification")
        )
        
        # Webhook configuration
        self.webhook = N8NWebhookConfig(
            base_path=os.getenv("N8N_WEBHOOK_BASE_PATH", "/api/v1/n8n"),
            trigger_experiment=os.getenv("N8N_WEBHOOK_TRIGGER", "/trigger-experiment"),
            pause_experiment=os.getenv("N8N_WEBHOOK_PAUSE", "/pause-experiment"),
            resume_experiment=os.getenv("N8N_WEBHOOK_RESUME", "/resume-experiment"),
            get_status=os.getenv("N8N_WEBHOOK_STATUS", "/get-status"),
            inject_user_input=os.getenv("N8N_WEBHOOK_INPUT", "/inject-user-input")
        )
        
        # Logging and debugging
        self.enable_logging = os.getenv("N8N_ENABLE_LOGGING", "true").lower() == "true"
        self.log_level = os.getenv("N8N_LOG_LEVEL", "INFO")
        self.debug_mode = os.getenv("N8N_DEBUG_MODE", "false").lower() == "true"
        
        # Template directory
        self.template_dir = Path(__file__).parent / "templates"
        
    def get_webhook_url(self, endpoint: str) -> str:
        """Get full webhook URL for n8n endpoint"""
        return f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}"
    
    def get_canvas_webhook_path(self, endpoint: str) -> str:
        """Get full webhook path for Canvas to receive n8n requests"""
        return f"{self.webhook.base_path.rstrip('/')}{endpoint}"
    
    def get_headers(self) -> Dict[str, str]:
        """Get headers for n8n requests"""
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Canvas-N8N-Connector/1.0.0"
        }
        
        if self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        return headers
    
    def is_configured(self) -> bool:
        """Check if n8n connector is properly configured"""
        return bool(self.base_url and (self.auth_token or not self.require_auth()))
    
    def require_auth(self) -> bool:
        """Check if authentication is required"""
        return not self.base_url.startswith("http://localhost")
    
    def validate_config(self) -> Dict[str, Any]:
        """Validate configuration and return status"""
        issues = []
        
        if not self.base_url:
            issues.append("N8N_BASE_URL is required")
            
        if self.require_auth() and not self.auth_token:
            issues.append("N8N_AUTH_TOKEN is required for non-localhost URLs")
            
        if not self.webhook_secret and not self.debug_mode:
            issues.append("N8N_WEBHOOK_SECRET is recommended for security")
            
        if self.timeout < 5:
            issues.append("N8N_TIMEOUT should be at least 5 seconds")
            
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "config": {
                "base_url": self.base_url,
                "has_auth_token": bool(self.auth_token),
                "has_webhook_secret": bool(self.webhook_secret),
                "timeout": self.timeout,
                "retry_attempts": self.retry_attempts,
                "endpoints": self.endpoints.__dict__,
                "webhook_paths": self.webhook.__dict__
            }
        }


# Global configuration instance
config = N8NConfig()