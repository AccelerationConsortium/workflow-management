"""
N8N Router

FastAPI router for handling inbound webhooks from n8n.
Processes experiment triggers, pause/resume commands, and user interactions.
"""

from fastapi import APIRouter, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional, Callable
import json
import logging
from datetime import datetime

from .config import config
from .utils import (
    N8NUtils, 
    TriggerRequest, 
    ExperimentStatus,
    NotificationLevel
)

logger = logging.getLogger(__name__)


class N8NRouter:
    """Router for handling n8n webhook requests"""
    
    def __init__(self, 
                 experiment_service: Optional[Callable] = None,
                 status_service: Optional[Callable] = None):
        """
        Initialize router with Canvas services
        
        Args:
            experiment_service: Service for managing experiments
            status_service: Service for querying experiment status
        """
        self.router = APIRouter(prefix=config.webhook.base_path, tags=["n8n"])
        self.experiment_service = experiment_service
        self.status_service = status_service
        
        # Register webhook endpoints
        self._register_routes()
    
    def _register_routes(self):
        """Register all webhook routes"""
        
        @self.router.post(config.webhook.trigger_experiment)
        async def trigger_experiment(
            request: Request,
            payload: Dict[str, Any],
            signature: Optional[str] = Header(None, alias="x-n8n-signature")
        ):
            """Trigger experiment from n8n"""
            return await self._handle_trigger_experiment(request, payload, signature)
        
        @self.router.post(config.webhook.pause_experiment)
        async def pause_experiment(
            request: Request,
            payload: Dict[str, Any],
            signature: Optional[str] = Header(None, alias="x-n8n-signature")
        ):
            """Pause running experiment"""
            return await self._handle_pause_experiment(request, payload, signature)
        
        @self.router.post(config.webhook.resume_experiment)
        async def resume_experiment(
            request: Request,
            payload: Dict[str, Any],
            signature: Optional[str] = Header(None, alias="x-n8n-signature")
        ):
            """Resume paused experiment"""
            return await self._handle_resume_experiment(request, payload, signature)
        
        @self.router.get(config.webhook.get_status)
        async def get_experiment_status(
            experiment_id: str,
            include_details: bool = False
        ):
            """Get experiment status"""
            return await self._handle_get_status(experiment_id, include_details)
        
        @self.router.post(config.webhook.inject_user_input)
        async def inject_user_input(
            request: Request,
            payload: Dict[str, Any],
            signature: Optional[str] = Header(None, alias="x-n8n-signature")
        ):
            """Inject user input into running experiment"""
            return await self._handle_user_input(request, payload, signature)
        
        @self.router.get("/health")
        async def health_check():
            """Health check endpoint"""
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "config_valid": config.is_configured()
            }
    
    async def _verify_signature(self, request: Request, signature: Optional[str]) -> bool:
        """Verify webhook signature for security"""
        
        if config.debug_mode:
            logger.warning("Debug mode: Skipping signature verification")
            return True
            
        if not config.webhook_secret:
            logger.warning("No webhook secret configured - skipping verification")
            return True
            
        if not signature:
            logger.warning("No signature provided in webhook request")
            return False
        
        body = await request.body()
        return N8NUtils.validate_webhook_signature(body, signature, config.webhook_secret)
    
    async def _handle_trigger_experiment(
        self, 
        request: Request, 
        payload: Dict[str, Any], 
        signature: Optional[str]
    ) -> JSONResponse:
        """Handle experiment trigger request"""
        
        try:
            # Verify signature
            if not await self._verify_signature(request, signature):
                raise HTTPException(status_code=401, detail="Invalid signature")
            
            # Parse trigger request
            trigger_request = N8NUtils.parse_trigger_request(payload)
            
            # Log inbound event
            N8NUtils.log_event(
                "trigger_experiment",
                f"template_{trigger_request.template_id}",
                payload,
                "inbound"
            )
            
            # Validate template exists (if service available)
            if self.experiment_service:
                if not await self._validate_template(trigger_request.template_id):
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Template not found: {trigger_request.template_id}"
                    )
            
            # Start experiment
            experiment_id = await self._start_experiment(trigger_request)
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "experiment_id": experiment_id,
                    "status": "started",
                    "message": f"Experiment started with template {trigger_request.template_id}",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling trigger experiment: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _handle_pause_experiment(
        self, 
        request: Request, 
        payload: Dict[str, Any], 
        signature: Optional[str]
    ) -> JSONResponse:
        """Handle experiment pause request"""
        
        try:
            # Verify signature
            if not await self._verify_signature(request, signature):
                raise HTTPException(status_code=401, detail="Invalid signature")
            
            experiment_id = payload.get("experiment_id")
            if not experiment_id:
                raise HTTPException(status_code=400, detail="experiment_id is required")
            
            # Log inbound event
            N8NUtils.log_event("pause_experiment", experiment_id, payload, "inbound")
            
            # Pause experiment
            success = await self._pause_experiment(experiment_id, payload.get("reason"))
            
            if not success:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Could not pause experiment {experiment_id}"
                )
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "experiment_id": experiment_id,
                    "status": "paused",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling pause experiment: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _handle_resume_experiment(
        self, 
        request: Request, 
        payload: Dict[str, Any], 
        signature: Optional[str]
    ) -> JSONResponse:
        """Handle experiment resume request"""
        
        try:
            # Verify signature
            if not await self._verify_signature(request, signature):
                raise HTTPException(status_code=401, detail="Invalid signature")
            
            experiment_id = payload.get("experiment_id")
            if not experiment_id:
                raise HTTPException(status_code=400, detail="experiment_id is required")
            
            # Log inbound event
            N8NUtils.log_event("resume_experiment", experiment_id, payload, "inbound")
            
            # Resume experiment
            success = await self._resume_experiment(experiment_id, payload.get("parameters"))
            
            if not success:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Could not resume experiment {experiment_id}"
                )
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "experiment_id": experiment_id,
                    "status": "resumed",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling resume experiment: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _handle_get_status(
        self, 
        experiment_id: str, 
        include_details: bool = False
    ) -> JSONResponse:
        """Handle experiment status query"""
        
        try:
            # Get experiment status
            experiment = await self._get_experiment_status(experiment_id)
            
            if not experiment:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Experiment not found: {experiment_id}"
                )
            
            # Log query event
            N8NUtils.log_event(
                "get_status",
                experiment_id,
                {"include_details": include_details},
                "inbound"
            )
            
            # Create response
            response = N8NUtils.create_status_response(experiment, include_details)
            
            return JSONResponse(status_code=200, content=response)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling get status: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _handle_user_input(
        self, 
        request: Request, 
        payload: Dict[str, Any], 
        signature: Optional[str]
    ) -> JSONResponse:
        """Handle user input injection"""
        
        try:
            # Verify signature
            if not await self._verify_signature(request, signature):
                raise HTTPException(status_code=401, detail="Invalid signature")
            
            experiment_id = payload.get("experiment_id")
            user_input = payload.get("user_input")
            
            if not experiment_id or not user_input:
                raise HTTPException(
                    status_code=400, 
                    detail="experiment_id and user_input are required"
                )
            
            # Log inbound event
            N8NUtils.log_event("inject_user_input", experiment_id, payload, "inbound")
            
            # Inject user input
            success = await self._inject_user_input(experiment_id, user_input)
            
            if not success:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Could not inject user input for experiment {experiment_id}"
                )
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "experiment_id": experiment_id,
                    "message": "User input injected successfully",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error handling user input injection: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Service integration methods (to be implemented based on Canvas services)
    
    async def _validate_template(self, template_id: str) -> bool:
        """Validate that experiment template exists"""
        if self.experiment_service:
            # Call your experiment service to validate template
            return await self.experiment_service.template_exists(template_id)
        return True  # Default to True if no service configured
    
    async def _start_experiment(self, trigger_request: TriggerRequest) -> str:
        """Start experiment and return experiment ID"""
        if self.experiment_service:
            # Call your experiment service to start experiment
            return await self.experiment_service.start_experiment(
                template_id=trigger_request.template_id,
                parameters=trigger_request.parameters,
                triggered_by=trigger_request.triggered_by,
                metadata=trigger_request.metadata
            )
        
        # Mock implementation - replace with actual service call
        return f"exp_{int(datetime.utcnow().timestamp())}"
    
    async def _pause_experiment(self, experiment_id: str, reason: Optional[str] = None) -> bool:
        """Pause running experiment"""
        if self.experiment_service:
            return await self.experiment_service.pause_experiment(experiment_id, reason)
        return True  # Mock success
    
    async def _resume_experiment(self, experiment_id: str, parameters: Optional[Dict[str, Any]] = None) -> bool:
        """Resume paused experiment"""
        if self.experiment_service:
            return await self.experiment_service.resume_experiment(experiment_id, parameters)
        return True  # Mock success
    
    async def _get_experiment_status(self, experiment_id: str):
        """Get experiment status information"""
        if self.status_service:
            return await self.status_service.get_experiment_status(experiment_id)
        
        # Mock implementation - replace with actual service call
        from .utils import ExperimentInfo
        return ExperimentInfo(
            experiment_id=experiment_id,
            status=ExperimentStatus.RUNNING,
            progress=50.0,
            current_step="mock_step",
            total_steps=10
        )
    
    async def _inject_user_input(self, experiment_id: str, user_input: Dict[str, Any]) -> bool:
        """Inject user input into running experiment"""
        if self.experiment_service:
            return await self.experiment_service.inject_user_input(experiment_id, user_input)
        return True  # Mock success


def create_n8n_router(
    experiment_service: Optional[Callable] = None,
    status_service: Optional[Callable] = None
) -> APIRouter:
    """Factory function to create configured N8N router"""
    
    n8n_router = N8NRouter(experiment_service, status_service)
    return n8n_router.router