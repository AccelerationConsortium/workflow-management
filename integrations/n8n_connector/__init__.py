"""
N8N Connector Module

A bidirectional bridge between Canvas workflow system and n8n automation platform.
Provides event pushing from Canvas to n8n and webhook handling for n8n triggers.

Features:
- Task completion notifications
- Status updates and alerts  
- Experiment triggering from external sources
- User interaction injection
- Secure webhook handling with signature verification
"""

from .client import N8NClient
from .router import N8NRouter
from .config import N8NConfig
from .utils import N8NUtils, ExperimentStatus, NotificationLevel

__version__ = "1.0.0"
__author__ = "Canvas Team"

__all__ = [
    "N8NClient",
    "N8NRouter", 
    "N8NConfig",
    "N8NUtils",
    "ExperimentStatus",
    "NotificationLevel"
]