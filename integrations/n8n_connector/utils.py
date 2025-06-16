"""
N8N Connector Utilities

Common utilities for payload formatting, status management,
and logging functions.
"""

import json
import time
import hashlib
import hmac
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)


class ExperimentStatus(Enum):
    """Experiment status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    ERROR = "error"


class NotificationLevel(Enum):
    """Notification level for alerts"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class ExperimentInfo:
    """Experiment information structure"""
    experiment_id: str
    status: ExperimentStatus
    template_id: Optional[str] = None
    started_by: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: float = 0.0
    current_step: Optional[str] = None
    total_steps: int = 0
    parameters: Optional[Dict[str, Any]] = None
    results: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


@dataclass
class NotificationPayload:
    """Base notification payload structure"""
    experiment_id: str
    status: str
    timestamp: str
    summary: str
    level: NotificationLevel = NotificationLevel.INFO
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class AlertPayload:
    """Alert payload for human intervention"""
    experiment_id: str
    alert_type: str
    message: str
    level: NotificationLevel
    timestamp: str
    requires_action: bool = True
    suggested_actions: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class TriggerRequest:
    """Experiment trigger request from n8n"""
    template_id: str
    parameters: Dict[str, Any]
    triggered_by: str
    priority: str = "normal"
    callback_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class N8NUtils:
    """Utility functions for N8N connector"""
    
    @staticmethod
    def create_experiment_notification(
        experiment: ExperimentInfo,
        custom_summary: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create experiment status notification payload"""
        
        summary = custom_summary or N8NUtils._generate_status_summary(experiment)
        
        # Determine notification level based on status
        level = NotificationLevel.INFO
        if experiment.status == ExperimentStatus.FAILED:
            level = NotificationLevel.ERROR
        elif experiment.status == ExperimentStatus.ERROR:
            level = NotificationLevel.CRITICAL
        elif experiment.status == ExperimentStatus.PAUSED:
            level = NotificationLevel.WARNING
            
        payload = NotificationPayload(
            experiment_id=experiment.experiment_id,
            status=experiment.status.value,
            timestamp=datetime.utcnow().isoformat() + "Z",
            summary=summary,
            level=level,
            metadata={
                "template_id": experiment.template_id,
                "started_by": experiment.started_by,
                "progress": experiment.progress,
                "current_step": experiment.current_step,
                "total_steps": experiment.total_steps,
                "duration": N8NUtils._calculate_duration(experiment)
            }
        )
        
        return asdict(payload)
    
    @staticmethod
    def create_alert_payload(
        experiment_id: str,
        alert_type: str,
        message: str,
        level: NotificationLevel = NotificationLevel.WARNING,
        requires_action: bool = True,
        suggested_actions: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create alert payload for human intervention"""
        
        payload = AlertPayload(
            experiment_id=experiment_id,
            alert_type=alert_type,
            message=message,
            level=level,
            timestamp=datetime.utcnow().isoformat() + "Z",
            requires_action=requires_action,
            suggested_actions=suggested_actions or [],
            metadata=metadata or {}
        )
        
        return asdict(payload)
    
    @staticmethod
    def create_report_payload(
        experiment_id: str,
        report_url: str,
        report_type: str = "pdf",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create report ready notification payload"""
        
        return {
            "experiment_id": experiment_id,
            "report_url": report_url,
            "report_type": report_type,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metadata": metadata or {}
        }
    
    @staticmethod
    def parse_trigger_request(payload: Dict[str, Any]) -> TriggerRequest:
        """Parse trigger request from n8n"""
        
        return TriggerRequest(
            template_id=payload["template_id"],
            parameters=payload.get("parameters", {}),
            triggered_by=payload["triggered_by"],
            priority=payload.get("priority", "normal"),
            callback_url=payload.get("callback_url"),
            metadata=payload.get("metadata", {})
        )
    
    @staticmethod
    def validate_webhook_signature(
        payload: bytes,
        signature: str,
        secret: str
    ) -> bool:
        """Validate webhook signature for security"""
        
        if not secret or not signature:
            return False
            
        # Calculate expected signature
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures (constant time comparison)
        return hmac.compare_digest(f"sha256={expected_signature}", signature)
    
    @staticmethod
    def format_error_payload(
        experiment_id: str,
        error: Exception,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Format error information for n8n notification"""
        
        return {
            "experiment_id": experiment_id,
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": NotificationLevel.ERROR.value
        }
    
    @staticmethod
    def log_event(
        event_type: str,
        experiment_id: str,
        payload: Dict[str, Any],
        direction: str = "outbound"  # "outbound" or "inbound"
    ) -> None:
        """Log n8n communication events"""
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "experiment_id": experiment_id,
            "direction": direction,
            "payload_size": len(json.dumps(payload)),
            "payload": payload if len(json.dumps(payload)) < 1000 else "payload_too_large"
        }
        
        logger.info(f"N8N Event: {event_type}", extra=log_entry)
    
    @staticmethod
    def _generate_status_summary(experiment: ExperimentInfo) -> str:
        """Generate human-readable status summary"""
        
        if experiment.status == ExperimentStatus.COMPLETED:
            duration = N8NUtils._calculate_duration(experiment)
            return f"Experiment {experiment.experiment_id} completed successfully in {duration}"
            
        elif experiment.status == ExperimentStatus.FAILED:
            return f"Experiment {experiment.experiment_id} failed: {experiment.error_message or 'Unknown error'}"
            
        elif experiment.status == ExperimentStatus.RUNNING:
            progress = f"{experiment.progress:.1f}%" if experiment.progress > 0 else "starting"
            return f"Experiment {experiment.experiment_id} is running ({progress})"
            
        elif experiment.status == ExperimentStatus.PAUSED:
            return f"Experiment {experiment.experiment_id} is paused at step: {experiment.current_step}"
            
        else:
            return f"Experiment {experiment.experiment_id} status: {experiment.status.value}"
    
    @staticmethod
    def _calculate_duration(experiment: ExperimentInfo) -> str:
        """Calculate experiment duration"""
        
        if not experiment.started_at:
            return "unknown"
            
        end_time = experiment.completed_at or datetime.utcnow()
        duration = end_time - experiment.started_at
        
        total_seconds = int(duration.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"
    
    @staticmethod
    def create_status_response(
        experiment: ExperimentInfo,
        include_details: bool = False
    ) -> Dict[str, Any]:
        """Create status response for n8n status queries"""
        
        response = {
            "experiment_id": experiment.experiment_id,
            "status": experiment.status.value,
            "progress": experiment.progress,
            "current_step": experiment.current_step,
            "total_steps": experiment.total_steps,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        if include_details:
            response.update({
                "template_id": experiment.template_id,
                "started_by": experiment.started_by,
                "started_at": experiment.started_at.isoformat() + "Z" if experiment.started_at else None,
                "completed_at": experiment.completed_at.isoformat() + "Z" if experiment.completed_at else None,
                "duration": N8NUtils._calculate_duration(experiment),
                "parameters": experiment.parameters,
                "results": experiment.results,
                "error_message": experiment.error_message
            })
            
        return response