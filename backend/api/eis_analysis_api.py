"""
EIS Analysis API Integration
与Hugging Face Spaces部署的EIS分析服务通信的API接口
"""

import logging
import aiohttp
import asyncio
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
import uuid
import json
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# 创建API路由器
router = APIRouter(prefix="/api/eis", tags=["EIS Analysis"])

# 分析任务状态
class TaskStatus(BaseModel):
    """任务状态模型"""
    task_id: str
    status: str  # 'pending', 'running', 'completed', 'failed'
    progress: int
    message: str
    created_at: datetime
    updated_at: datetime
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# 分析请求模型
class EISAnalysisRequest(BaseModel):
    """EIS分析请求模型"""
    node_id: str
    workflow_id: str
    api_endpoint: str
    api_key: Optional[str] = None
    circuit_model: str = "auto"
    fitting_algorithm: str = "lm"
    max_iterations: int = 1000
    auto_retry: bool = True

# 分析结果模型
class EISAnalysisResult(BaseModel):
    """EIS分析结果模型"""
    rct: float  # 电荷转移电阻
    coulombic_efficiency: float  # 库仑效率
    overall_score: float  # 综合评分
    circuit_model: str
    fit_quality: float
    visualization_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# 全局任务存储（生产环境应使用Redis或数据库）
tasks_storage: Dict[str, TaskStatus] = {}

class EISAnalysisService:
    """EIS分析服务类"""
    
    def __init__(self):
        self.default_timeout = aiohttp.ClientTimeout(total=300)  # 5分钟超时
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
    async def submit_analysis(
        self, 
        ac_file: UploadFile,
        dc_file: Optional[UploadFile],
        request: EISAnalysisRequest
    ) -> TaskStatus:
        """提交EIS分析任务"""
        
        task_id = str(uuid.uuid4())
        task = TaskStatus(
            task_id=task_id,
            status='pending',
            progress=0,
            message='Task created',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        tasks_storage[task_id] = task
        
        try:
            # 验证文件大小
            ac_content = await ac_file.read()
            if len(ac_content) > self.max_file_size:
                raise HTTPException(status_code=413, detail="AC file too large")
            
            dc_content = None
            if dc_file:
                dc_content = await dc_file.read()
                if len(dc_content) > self.max_file_size:
                    raise HTTPException(status_code=413, detail="DC file too large")
            
            # 更新任务状态
            task.status = 'running'
            task.progress = 10
            task.message = 'Uploading data to analysis service'
            task.updated_at = datetime.now()
            
            # 准备表单数据
            form_data = aiohttp.FormData()
            form_data.add_field('ac_file', ac_content, filename=ac_file.filename)
            if dc_content:
                form_data.add_field('dc_file', dc_content, filename=dc_file.filename)
            
            # 添加分析参数
            analysis_params = {
                'task_id': task_id,
                'node_id': request.node_id,
                'workflow_id': request.workflow_id,
                'circuit_model': request.circuit_model,
                'fitting_algorithm': request.fitting_algorithm,
                'max_iterations': request.max_iterations,
                'callback_url': f"{os.environ.get('API_BASE_URL', '')}/api/eis/callback/{task_id}"
            }
            form_data.add_field('parameters', json.dumps(analysis_params))
            
            # 发送到Hugging Face Space
            async with aiohttp.ClientSession(timeout=self.default_timeout) as session:
                headers = {}
                if request.api_key:
                    headers['Authorization'] = f'Bearer {request.api_key}'
                
                task.progress = 30
                task.message = 'Submitting to analysis service'
                task.updated_at = datetime.now()
                
                async with session.post(
                    f"{request.api_endpoint}/analyze",
                    data=form_data,
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"API request failed: {response.status} - {error_text}")
                    
                    api_response = await response.json()
                    remote_task_id = api_response.get('task_id', task_id)
                    
                    # 开始轮询结果
                    asyncio.create_task(
                        self._poll_analysis_results(
                            task_id, remote_task_id, request.api_endpoint, headers
                        )
                    )
            
            return task
            
        except Exception as e:
            task.status = 'failed'
            task.error = str(e)
            task.updated_at = datetime.now()
            logger.error(f"Failed to submit analysis task {task_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    async def _poll_analysis_results(
        self,
        task_id: str,
        remote_task_id: str,
        api_endpoint: str,
        headers: Dict[str, str]
    ):
        """轮询分析结果"""
        task = tasks_storage.get(task_id)
        if not task:
            return
        
        max_polls = 120  # 最多轮询2分钟
        poll_interval = 1  # 1秒间隔
        polls = 0
        
        try:
            async with aiohttp.ClientSession(timeout=self.default_timeout) as session:
                while polls < max_polls and task.status == 'running':
                    try:
                        async with session.get(
                            f"{api_endpoint}/status/{remote_task_id}",
                            headers=headers
                        ) as response:
                            if response.status == 200:
                                status_data = await response.json()
                                
                                # 更新进度
                                if 'progress' in status_data:
                                    task.progress = max(task.progress, status_data['progress'])
                                    task.message = status_data.get('message', 'Processing...')
                                    task.updated_at = datetime.now()
                                
                                # 检查完成状态
                                if status_data.get('status') == 'completed':
                                    task.status = 'completed'
                                    task.progress = 100
                                    task.message = 'Analysis completed'
                                    task.result = status_data.get('result', {})
                                    
                                    # 添加可视化URL
                                    if task.result:
                                        base_url = api_endpoint.replace('/api', '')
                                        task.result['visualization_url'] = f"{base_url}/visualize/{remote_task_id}"
                                    
                                    task.updated_at = datetime.now()
                                    break
                                    
                                elif status_data.get('status') == 'failed':
                                    task.status = 'failed'
                                    task.error = status_data.get('error', 'Remote analysis failed')
                                    task.updated_at = datetime.now()
                                    break
                            
                            await asyncio.sleep(poll_interval)
                            polls += 1
                            
                    except Exception as e:
                        logger.warning(f"Polling error for task {task_id}: {e}")
                        await asyncio.sleep(poll_interval)
                        polls += 1
                
                # 超时处理
                if polls >= max_polls and task.status == 'running':
                    task.status = 'failed'
                    task.error = 'Analysis timeout'
                    task.updated_at = datetime.now()
                    
        except Exception as e:
            task.status = 'failed'
            task.error = f"Polling failed: {str(e)}"
            task.updated_at = datetime.now()
            logger.error(f"Polling failed for task {task_id}: {e}")

# 创建服务实例
eis_service = EISAnalysisService()

# API端点

@router.post("/analyze", response_model=TaskStatus)
async def analyze_eis_data(
    background_tasks: BackgroundTasks,
    ac_file: UploadFile = File(..., description="AC impedance data file"),
    dc_file: Optional[UploadFile] = File(None, description="DC impedance data file (optional)"),
    node_id: str = Form(...),
    workflow_id: str = Form(...),
    api_endpoint: str = Form(...),
    api_key: Optional[str] = Form(None),
    circuit_model: str = Form("auto"),
    fitting_algorithm: str = Form("lm"),
    max_iterations: int = Form(1000)
):
    """提交EIS数据分析任务"""
    
    logger.info(f"Received EIS analysis request for workflow {workflow_id}, node {node_id}")
    
    # 验证文件类型
    if not ac_file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="AC file must be CSV format")
    
    if dc_file and not dc_file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="DC file must be CSV format")
    
    # 创建请求对象
    request = EISAnalysisRequest(
        node_id=node_id,
        workflow_id=workflow_id,
        api_endpoint=api_endpoint,
        api_key=api_key,
        circuit_model=circuit_model,
        fitting_algorithm=fitting_algorithm,
        max_iterations=max_iterations
    )
    
    # 提交分析任务
    task = await eis_service.submit_analysis(ac_file, dc_file, request)
    
    return task

@router.get("/status/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """获取分析任务状态"""
    
    task = tasks_storage.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task

@router.get("/tasks", response_model=List[TaskStatus])
async def list_tasks(workflow_id: Optional[str] = None):
    """列出所有任务"""
    
    tasks = list(tasks_storage.values())
    
    if workflow_id:
        # 如果指定了workflow_id，需要从任务中过滤
        # 这里简化处理，实际应该在任务中存储workflow_id
        pass
    
    return tasks

@router.delete("/tasks/{task_id}")
async def cancel_task(task_id: str):
    """取消分析任务"""
    
    task = tasks_storage.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status in ['completed', 'failed']:
        raise HTTPException(status_code=400, detail="Task cannot be cancelled")
    
    task.status = 'failed'
    task.error = 'Cancelled by user'
    task.updated_at = datetime.now()
    
    return {"message": "Task cancelled"}

@router.post("/callback/{task_id}")
async def receive_callback(task_id: str, callback_data: Dict[str, Any]):
    """接收来自Hugging Face Space的回调"""
    
    task = tasks_storage.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    logger.info(f"Received callback for task {task_id}: {callback_data}")
    
    # 更新任务状态
    if callback_data.get('status') == 'completed':
        task.status = 'completed'
        task.progress = 100
        task.result = callback_data.get('result', {})
        task.message = 'Analysis completed'
    elif callback_data.get('status') == 'failed':
        task.status = 'failed'
        task.error = callback_data.get('error', 'Analysis failed')
    else:
        # 进度更新
        if 'progress' in callback_data:
            task.progress = callback_data['progress']
        if 'message' in callback_data:
            task.message = callback_data['message']
    
    task.updated_at = datetime.now()
    
    return {"message": "Callback received"}

@router.get("/download/{task_id}")
async def download_results(task_id: str, format: str = "json"):
    """下载分析结果"""
    
    task = tasks_storage.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status != 'completed' or not task.result:
        raise HTTPException(status_code=400, detail="No results available")
    
    if format == "json":
        return task.result
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

# 清理任务的后台任务
async def cleanup_old_tasks():
    """清理旧任务"""
    max_age_hours = 24
    cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
    
    tasks_to_remove = []
    for task_id, task in tasks_storage.items():
        if task.updated_at.timestamp() < cutoff_time:
            tasks_to_remove.append(task_id)
    
    for task_id in tasks_to_remove:
        del tasks_storage[task_id]
    
    logger.info(f"Cleaned up {len(tasks_to_remove)} old tasks")

# 启动清理任务（需要在主应用中调用）
async def start_cleanup_scheduler():
    """启动清理调度器"""
    while True:
        try:
            await cleanup_old_tasks()
            await asyncio.sleep(3600)  # 每小时清理一次
        except Exception as e:
            logger.error(f"Cleanup task failed: {e}")
            await asyncio.sleep(3600)