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

# AutoEIS Analysis Endpoint
from fastapi import File, UploadFile, Form
import pandas as pd
from io import StringIO
import json

class AutoEISRequest(BaseModel):
    """AutoEIS analysis request model"""
    frequency_column: str = "frequency"
    z_real_column: str = "z_real"
    z_imag_column: str = "z_imag"
    circuit_initial_guess: str = "auto"
    fitting_algorithm: str = "lm"
    max_iterations: int = 1000
    tolerance: float = 1e-8
    output_format: str = "json"
    generate_plots: bool = True
    save_circuit_diagram: bool = False

class AutoEISResponse(BaseModel):
    """AutoEIS analysis response model"""
    circuit_model: str
    fit_parameters: Dict[str, float]
    fit_error: float
    chi_squared: float
    plots: Optional[Dict[str, str]]  # Base64 encoded plot images
    circuit_diagram: Optional[str]  # Base64 encoded circuit diagram

@app.post("/analyze/eis", response_model=AutoEISResponse)
async def analyze_eis(
    csv_file: UploadFile = File(...),
    frequency_column: str = Form("frequency"),
    z_real_column: str = Form("z_real"),
    z_imag_column: str = Form("z_imag"),
    circuit_initial_guess: str = Form("auto"),
    fitting_algorithm: str = Form("lm"),
    max_iterations: int = Form(1000),
    tolerance: float = Form(1e-8),
    output_format: str = Form("json"),
    generate_plots: bool = Form(True),
    save_circuit_diagram: bool = Form(False)
):
    """Analyze EIS data using AutoEIS"""
    try:
        # Read CSV file
        contents = await csv_file.read()
        df = pd.read_csv(StringIO(contents.decode('utf-8')))
        
        # Validate columns exist
        required_columns = [frequency_column, z_real_column, z_imag_column]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing columns in CSV: {missing_columns}"
            )
        
        # Extract data
        frequencies = df[frequency_column].values
        z_real = df[z_real_column].values
        z_imag = df[z_imag_column].values
        
        # TODO: Call actual AutoEIS library here
        # For now, return mock data
        logger.info(f"Analyzing EIS data with {len(frequencies)} frequency points")
        
        # Mock response
        return AutoEISResponse(
            circuit_model="R0-(R1||C1)",
            fit_parameters={
                "R0": 10.5,
                "R1": 45.3,
                "C1": 1.2e-6
            },
            fit_error=0.023,
            chi_squared=0.00054,
            plots={
                "nyquist": "base64_encoded_nyquist_plot",
                "bode": "base64_encoded_bode_plot"
            } if generate_plots else None,
            circuit_diagram="base64_encoded_circuit_diagram" if save_circuit_diagram else None
        )
        
    except Exception as e:
        logger.error(f"Failed to analyze EIS data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 
