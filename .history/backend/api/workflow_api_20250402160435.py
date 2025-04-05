from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
import logging
from datetime import datetime

from ..executors.sdl_catalyst_executor import SDLCatalystExecutor
from ..executors.base_executor import TaskConfig, TaskStatus

# 配置日志
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

# 全局执行器实例
executor = SDLCatalystExecutor()

class WorkflowRequest(BaseModel):
    """工作流请求模型"""
    workflow_type: str
    workflow_config: Dict[str, Any]

class WorkflowResponse(BaseModel):
    """工作流响应模型"""
    run_id: str
    status: str
    message: str

class WorkflowStatus(BaseModel):
    """工作流状态模型"""
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
    """应用启动时初始化执行器"""
    await executor.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    await executor.cleanup()

@app.post("/run", response_model=WorkflowResponse)
async def run_workflow(request: WorkflowRequest, background_tasks: BackgroundTasks):
    """启动工作流执行"""
    run_id = str(uuid.uuid4())
    
    try:
        # 创建任务配置
        config = TaskConfig(
            task_id=run_id,
            task_type=request.workflow_type,
            parameters={"workflow_config": request.workflow_config}
        )
        
        # 在后台执行任务
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
    """获取工作流状态"""
    try:
        # 获取任务状态
        status = await executor.get_status(run_id)
        
        # 获取工作流状态
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
    """获取工作流日志"""
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
