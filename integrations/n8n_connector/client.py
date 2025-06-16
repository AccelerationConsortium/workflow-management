"""
N8N Client

Handles outbound communication from Canvas to n8n.
Sends notifications, alerts, and status updates to n8n webhooks.
"""

import json
import asyncio
import aiohttp
from typing import Dict, Any, Optional
from datetime import datetime
import logging

from .config import config
from .utils import (
    N8NUtils, 
    ExperimentInfo, 
    NotificationLevel,
    ExperimentStatus
)

logger = logging.getLogger(__name__)


class N8NClient:
    """Client for sending data from Canvas to n8n"""
    
    def __init__(self, custom_config: Optional[Dict[str, Any]] = None):
        """Initialize N8N client with configuration"""
        self.config = config
        if custom_config:
            # Override config values if provided
            for key, value in custom_config.items():
                if hasattr(self.config, key):
                    setattr(self.config, key, value)
                    
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.config.timeout),
            headers=self.config.get_headers()
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def notify_experiment_status(
        self,
        experiment: ExperimentInfo,
        custom_summary: Optional[str] = None
    ) -> bool:
        """Send experiment status notification to n8n"""
        
        payload = N8NUtils.create_experiment_notification(experiment, custom_summary)
        
        return await self._send_notification(
            endpoint=self.config.endpoints.notify_status,
            payload=payload,
            event_type="experiment_status"
        )
    
    async def send_alert(
        self,
        experiment_id: str,
        alert_type: str,
        message: str,
        level: NotificationLevel = NotificationLevel.WARNING,
        requires_action: bool = True,
        suggested_actions: Optional[list] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send alert requiring human intervention"""
        
        payload = N8NUtils.create_alert_payload(
            experiment_id=experiment_id,
            alert_type=alert_type,
            message=message,
            level=level,
            requires_action=requires_action,
            suggested_actions=suggested_actions,
            metadata=metadata
        )
        
        return await self._send_notification(
            endpoint=self.config.endpoints.alert_intervention,
            payload=payload,
            event_type="human_intervention_alert"
        )
    
    async def notify_report_ready(
        self,
        experiment_id: str,
        report_url: str,
        report_type: str = "pdf",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Notify that experiment report is ready"""
        
        payload = N8NUtils.create_report_payload(
            experiment_id=experiment_id,
            report_url=report_url,
            report_type=report_type,
            metadata=metadata
        )
        
        return await self._send_notification(
            endpoint=self.config.endpoints.report_ready,
            payload=payload,
            event_type="report_ready"
        )
    
    async def send_error_notification(
        self,
        experiment_id: str,
        error: Exception,
        context: Optional[str] = None
    ) -> bool:
        """Send error notification to n8n"""
        
        payload = N8NUtils.format_error_payload(
            experiment_id=experiment_id,
            error=error,
            context=context
        )
        
        return await self._send_notification(
            endpoint=self.config.endpoints.error_notification,
            payload=payload,
            event_type="error_notification"
        )
    
    async def send_custom_notification(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        event_type: str = "custom"
    ) -> bool:
        """Send custom notification to specified n8n endpoint"""
        
        return await self._send_notification(
            endpoint=endpoint,
            payload=payload,
            event_type=event_type
        )
    
    async def _send_notification(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        event_type: str
    ) -> bool:
        """Internal method to send notification with retry logic"""
        
        url = self.config.get_webhook_url(endpoint)
        experiment_id = payload.get("experiment_id", "unknown")
        
        # Log outbound event
        N8NUtils.log_event(event_type, experiment_id, payload, "outbound")
        
        for attempt in range(self.config.retry_attempts):
            try:
                if not self.session:
                    self.session = aiohttp.ClientSession(
                        timeout=aiohttp.ClientTimeout(total=self.config.timeout),
                        headers=self.config.get_headers()
                    )
                
                async with self.session.post(url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"Successfully sent {event_type} to n8n: {experiment_id}")
                        return True
                    else:
                        error_text = await response.text()
                        logger.warning(
                            f"N8N webhook returned {response.status} for {event_type}: {error_text}"
                        )
                        
            except asyncio.TimeoutError:
                logger.warning(f"Timeout sending {event_type} to n8n (attempt {attempt + 1})")
                
            except aiohttp.ClientError as e:
                logger.warning(f"Client error sending {event_type} to n8n: {e} (attempt {attempt + 1})")
                
            except Exception as e:
                logger.error(f"Unexpected error sending {event_type} to n8n: {e}")
                break
            
            # Wait before retry (except on last attempt)
            if attempt < self.config.retry_attempts - 1:
                await asyncio.sleep(self.config.retry_delay)
        
        logger.error(f"Failed to send {event_type} to n8n after {self.config.retry_attempts} attempts")
        return False
    
    def send_notification_sync(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        event_type: str = "sync_notification"
    ) -> bool:
        """Synchronous wrapper for sending notifications"""
        
        async def _send():
            async with self:
                return await self._send_notification(endpoint, payload, event_type)
        
        try:
            return asyncio.run(_send())
        except Exception as e:
            logger.error(f"Error in synchronous notification send: {e}")
            return False


class N8NNotificationBuilder:
    """Builder class for creating complex notifications"""
    
    def __init__(self):
        self.payload = {}
        
    def experiment(self, experiment_id: str) -> "N8NNotificationBuilder":
        """Set experiment ID"""
        self.payload["experiment_id"] = experiment_id
        return self
    
    def status(self, status: ExperimentStatus) -> "N8NNotificationBuilder":
        """Set experiment status"""
        self.payload["status"] = status.value
        return self
    
    def summary(self, summary: str) -> "N8NNotificationBuilder":
        """Set notification summary"""
        self.payload["summary"] = summary
        return self
    
    def level(self, level: NotificationLevel) -> "N8NNotificationBuilder":
        """Set notification level"""
        self.payload["level"] = level.value
        return self
    
    def metadata(self, metadata: Dict[str, Any]) -> "N8NNotificationBuilder":
        """Add metadata"""
        self.payload["metadata"] = metadata
        return self
    
    def add_metadata(self, key: str, value: Any) -> "N8NNotificationBuilder":
        """Add single metadata field"""
        if "metadata" not in self.payload:
            self.payload["metadata"] = {}
        self.payload["metadata"][key] = value
        return self
    
    def timestamp(self, timestamp: Optional[datetime] = None) -> "N8NNotificationBuilder":
        """Set timestamp (defaults to current time)"""
        ts = timestamp or datetime.utcnow()
        self.payload["timestamp"] = ts.isoformat() + "Z"
        return self
    
    def build(self) -> Dict[str, Any]:
        """Build the final payload"""
        if "timestamp" not in self.payload:
            self.timestamp()
        return self.payload.copy()
    
    async def send_to(self, client: N8NClient, endpoint: str, event_type: str = "custom") -> bool:
        """Build and send notification"""
        payload = self.build()
        return await client._send_notification(endpoint, payload, event_type)