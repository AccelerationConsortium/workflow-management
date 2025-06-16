"""
FastAPI Integration Example

Demonstrates how to integrate the n8n connector with a FastAPI application.
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

from integrations.n8n_connector import (
    create_n8n_router,
    N8NClient,
    ExperimentInfo,
    ExperimentStatus,
    NotificationLevel
)


# Mock services for demonstration
class MockExperimentService:
    """Mock experiment service for demonstration"""
    
    def __init__(self):
        self.experiments: Dict[str, Dict[str, Any]] = {}
        self.templates = {
            "catalyst_test_basic": {
                "name": "Basic Catalyst Test",
                "parameters": ["temperature", "duration", "scan_rate"],
                "estimated_duration": 1800
            },
            "cv_characterization": {
                "name": "CV Characterization",
                "parameters": ["start_voltage", "end_voltage", "scan_rate", "cycles"],
                "estimated_duration": 900
            }
        }
    
    async def template_exists(self, template_id: str) -> bool:
        """Check if template exists"""
        return template_id in self.templates
    
    async def start_experiment(
        self, 
        template_id: str, 
        parameters: Dict[str, Any], 
        triggered_by: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Start a new experiment"""
        
        if not await self.template_exists(template_id):
            raise ValueError(f"Template not found: {template_id}")
        
        experiment_id = f"exp_{int(datetime.utcnow().timestamp())}"
        
        self.experiments[experiment_id] = {
            "experiment_id": experiment_id,
            "template_id": template_id,
            "status": "running",
            "parameters": parameters,
            "triggered_by": triggered_by,
            "metadata": metadata or {},
            "started_at": datetime.utcnow(),
            "progress": 0.0,
            "current_step": "initialization",
            "total_steps": 5
        }
        
        # Simulate experiment progress
        asyncio.create_task(self._simulate_experiment_progress(experiment_id))
        
        return experiment_id
    
    async def pause_experiment(self, experiment_id: str, reason: Optional[str] = None) -> bool:
        """Pause an experiment"""
        
        if experiment_id not in self.experiments:
            return False
        
        exp = self.experiments[experiment_id]
        if exp["status"] == "running":
            exp["status"] = "paused"
            exp["pause_reason"] = reason
            return True
        
        return False
    
    async def resume_experiment(
        self, 
        experiment_id: str, 
        parameters: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Resume a paused experiment"""
        
        if experiment_id not in self.experiments:
            return False
        
        exp = self.experiments[experiment_id]
        if exp["status"] == "paused":
            exp["status"] = "running"
            if parameters:
                exp["parameters"].update(parameters)
            return True
        
        return False
    
    async def inject_user_input(
        self, 
        experiment_id: str, 
        user_input: Dict[str, Any]
    ) -> bool:
        """Inject user input into experiment"""
        
        if experiment_id not in self.experiments:
            return False
        
        exp = self.experiments[experiment_id]
        if "user_inputs" not in exp:
            exp["user_inputs"] = []
        
        exp["user_inputs"].append({
            "timestamp": datetime.utcnow(),
            "input": user_input
        })
        
        return True
    
    async def _simulate_experiment_progress(self, experiment_id: str):
        """Simulate experiment progress"""
        
        exp = self.experiments[experiment_id]
        steps = ["initialization", "setup", "measurement", "analysis", "cleanup"]
        
        for i, step in enumerate(steps):
            if exp["status"] != "running":
                break
            
            exp["current_step"] = step
            exp["progress"] = (i + 1) / len(steps) * 100
            
            # Send progress update
            await self._send_progress_notification(experiment_id)
            
            # Simulate step duration
            await asyncio.sleep(10)  # 10 seconds per step for demo
        
        # Complete experiment
        if exp["status"] == "running":
            exp["status"] = "completed"
            exp["completed_at"] = datetime.utcnow()
            exp["progress"] = 100.0
            exp["results"] = {
                "peak_current": 1.2,
                "cycles_completed": exp["parameters"].get("cycles", 3)
            }
            
            await self._send_completion_notification(experiment_id)
    
    async def _send_progress_notification(self, experiment_id: str):
        """Send progress notification to n8n"""
        
        exp = self.experiments[experiment_id]
        
        async with N8NClient() as client:
            await client.send_custom_notification(
                "experiment-progress",
                {
                    "experiment_id": experiment_id,
                    "progress": exp["progress"],
                    "current_step": exp["current_step"],
                    "timestamp": datetime.utcnow().isoformat()
                },
                "experiment_progress"
            )
    
    async def _send_completion_notification(self, experiment_id: str):
        """Send completion notification to n8n"""
        
        exp = self.experiments[experiment_id]
        
        experiment_info = ExperimentInfo(
            experiment_id=experiment_id,
            status=ExperimentStatus.COMPLETED,
            template_id=exp["template_id"],
            started_by=exp["triggered_by"],
            started_at=exp["started_at"],
            completed_at=exp.get("completed_at"),
            progress=exp["progress"],
            current_step=exp["current_step"],
            total_steps=exp["total_steps"],
            parameters=exp["parameters"],
            results=exp.get("results")
        )
        
        async with N8NClient() as client:
            await client.notify_experiment_status(experiment_info)


class MockStatusService:
    """Mock status service for demonstration"""
    
    def __init__(self, experiment_service: MockExperimentService):
        self.experiment_service = experiment_service
    
    async def get_experiment_status(self, experiment_id: str) -> Optional[ExperimentInfo]:
        """Get experiment status"""
        
        if experiment_id not in self.experiment_service.experiments:
            return None
        
        exp = self.experiment_service.experiments[experiment_id]
        
        # Convert status string to ExperimentStatus enum
        status_mapping = {
            "running": ExperimentStatus.RUNNING,
            "paused": ExperimentStatus.PAUSED,
            "completed": ExperimentStatus.COMPLETED,
            "failed": ExperimentStatus.FAILED
        }
        
        return ExperimentInfo(
            experiment_id=experiment_id,
            status=status_mapping.get(exp["status"], ExperimentStatus.RUNNING),
            template_id=exp["template_id"],
            started_by=exp["triggered_by"],
            started_at=exp["started_at"],
            completed_at=exp.get("completed_at"),
            progress=exp["progress"],
            current_step=exp["current_step"],
            total_steps=exp["total_steps"],
            parameters=exp["parameters"],
            results=exp.get("results")
        )


# Application lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    
    print("Starting Canvas-N8N Integration Server...")
    print("N8N webhook endpoints available at: /api/v1/n8n/*")
    
    yield
    
    print("Shutting down Canvas-N8N Integration Server...")


# Create FastAPI application
app = FastAPI(
    title="Canvas N8N Integration",
    description="Integration between Canvas workflow system and n8n automation",
    version="1.0.0",
    lifespan=lifespan
)

# Create services
experiment_service = MockExperimentService()
status_service = MockStatusService(experiment_service)

# Add n8n router
n8n_router = create_n8n_router(experiment_service, status_service)
app.include_router(n8n_router)


# Additional Canvas API endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Canvas N8N Integration API",
        "version": "1.0.0",
        "endpoints": {
            "n8n_webhooks": "/api/v1/n8n/*",
            "experiments": "/experiments",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Application health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "experiment_service": "running",
            "status_service": "running",
            "n8n_connector": "active"
        }
    }


@app.get("/experiments")
async def list_experiments():
    """List all experiments"""
    return {
        "experiments": list(experiment_service.experiments.values()),
        "count": len(experiment_service.experiments)
    }


@app.get("/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    """Get specific experiment"""
    
    experiment_info = await status_service.get_experiment_status(experiment_id)
    
    if not experiment_info:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    return experiment_info


@app.post("/experiments/{experiment_id}/notify")
async def send_experiment_notification(
    experiment_id: str, 
    background_tasks: BackgroundTasks
):
    """Manually send experiment notification to n8n"""
    
    experiment_info = await status_service.get_experiment_status(experiment_id)
    
    if not experiment_info:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Send notification in background
    background_tasks.add_task(send_notification_background, experiment_info)
    
    return {"message": "Notification queued", "experiment_id": experiment_id}


@app.post("/experiments/{experiment_id}/alert")
async def send_experiment_alert(
    experiment_id: str,
    alert_data: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    """Send alert for experiment"""
    
    if experiment_id not in experiment_service.experiments:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Send alert in background
    background_tasks.add_task(
        send_alert_background,
        experiment_id,
        alert_data
    )
    
    return {"message": "Alert queued", "experiment_id": experiment_id}


@app.get("/templates")
async def list_templates():
    """List available experiment templates"""
    return {"templates": experiment_service.templates}


# Background tasks
async def send_notification_background(experiment_info: ExperimentInfo):
    """Background task to send notification"""
    
    try:
        async with N8NClient() as client:
            success = await client.notify_experiment_status(experiment_info)
            print(f"Notification sent for {experiment_info.experiment_id}: {success}")
    except Exception as e:
        print(f"Error sending notification: {e}")


async def send_alert_background(experiment_id: str, alert_data: Dict[str, Any]):
    """Background task to send alert"""
    
    try:
        async with N8NClient() as client:
            success = await client.send_alert(
                experiment_id=experiment_id,
                alert_type=alert_data.get("type", "general"),
                message=alert_data.get("message", "Alert from Canvas"),
                level=NotificationLevel(alert_data.get("level", "warning")),
                requires_action=alert_data.get("requires_action", False),
                suggested_actions=alert_data.get("suggested_actions", []),
                metadata=alert_data.get("metadata", {})
            )
            print(f"Alert sent for {experiment_id}: {success}")
    except Exception as e:
        print(f"Error sending alert: {e}")


# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": "The requested resource was not found",
            "path": str(request.url.path)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    print("Starting Canvas N8N Integration Server...")
    print("API Documentation: http://localhost:8000/docs")
    print("N8N Webhooks: http://localhost:8000/api/v1/n8n/")
    
    uvicorn.run(
        "fastapi_integration:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )