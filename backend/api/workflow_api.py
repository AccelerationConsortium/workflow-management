from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
import logging
from datetime import datetime

from backend.executors.sdl_catalyst_executor import SDLCatalystExecutor
from backend.executors.base_executor import TaskConfig, TaskStatus
from backend.api.websocket_service import ws_manager, handle_workflow_subscription, handle_broadcast_subscription
from backend.api.experiment_runs_api import router as experiment_runs_router

# configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('workflow.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Workflow Management API")

# Include experiment runs router
app.include_router(experiment_runs_router)

# global executor instance
executor = SDLCatalystExecutor()

class WorkflowRequest(BaseModel):
    """workflow request model"""
    workflow_type: str
    workflow_config: Dict[str, Any]

class WorkflowResponse(BaseModel):
    """workflow response model"""
    run_id: str
    status: str
    message: str

class WorkflowStatus(BaseModel):
    """workflow status model"""
    run_id: str
    status: str
    progress: float
    current_step: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    error: Optional[str]
    results: Optional[Dict[str, Any]]

@app.on_event("startup")
async def startup_event():
    """initialize executor on startup"""
    await executor.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """clean up executor on shutdown"""
    await executor.cleanup()

@app.post("/run", response_model=WorkflowResponse)
async def run_workflow(request: WorkflowRequest, background_tasks: BackgroundTasks):
    """start workflow execution"""
    run_id = str(uuid.uuid4())
    
    try:
        # create task config
        config = TaskConfig(
            task_id=run_id,
            task_type=request.workflow_type,
            parameters={"workflow_config": request.workflow_config}
        )
        
        # execute task in background
        background_tasks.add_task(executor.execute_task, config)
        
        logger.info(f"Started workflow execution: {run_id}")
        return WorkflowResponse(
            run_id=run_id,
            status="accepted",
            message="Workflow execution started"
        )
        
    except Exception as e:
        logger.error(f"Failed to start workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{run_id}", response_model=WorkflowStatus)
async def get_workflow_status(run_id: str):
    """get workflow status"""
    try:
        # get task status
        status = await executor.get_status(run_id)
        
        # get workflow state
        workflow_state = executor.get_workflow_state(f"sdl_wf_{run_id}")
        
        if workflow_state is None:
            raise HTTPException(status_code=404, detail=f"Workflow {run_id} not found")
        
        return WorkflowStatus(
            run_id=run_id,
            status=workflow_state.status,
            progress=workflow_state.progress,
            current_step=workflow_state.current_step,
            start_time=workflow_state.start_time,
            end_time=workflow_state.end_time,
            error=workflow_state.error,
            results=workflow_state.results
        )
        
    except Exception as e:
        logger.error(f"Failed to get workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs/{run_id}")
async def get_workflow_logs(run_id: str):
    """get workflow logs"""
    try:
        workflow_state = executor.get_workflow_state(f"sdl_wf_{run_id}")
        if workflow_state is None:
            raise HTTPException(status_code=404, detail=f"Workflow {run_id} not found")
            
        return {
            "run_id": run_id,
            "logs": executor._task_logs.get(run_id, [])
        }
        
    except Exception as e:
        logger.error(f"Failed to get workflow logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_broadcast_endpoint(websocket: WebSocket):
    """broadcast endpoint"""
    await handle_broadcast_subscription(websocket)

@app.websocket("/ws/{run_id}")
async def websocket_workflow_endpoint(websocket: WebSocket, run_id: str):
    """subscribe to workflow updates"""
    await handle_workflow_subscription(websocket, run_id) 
