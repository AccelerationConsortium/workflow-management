"""
BO 推荐系统 API 接口

提供 REST API 接口用于：
- 启动/停止监听器
- 手动触发推荐处理
- 查看监听器状态
- 管理实验任务
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

try:
    from .recommendationListener import get_listener, start_bo_listener, stop_bo_listener
    from .createExperimentTask import get_task_creator
except ImportError:
    # 如果相对导入失败，尝试绝对导入
    import sys
    import os
    sys.path.append(os.path.dirname(__file__))
    from recommendationListener import get_listener, start_bo_listener, stop_bo_listener
    from createExperimentTask import get_task_creator

logger = logging.getLogger(__name__)

# 创建路由器
router = APIRouter(prefix="/api/bo", tags=["BO Integration"])


# 请求/响应模型
class ListenerConfig(BaseModel):
    """监听器配置"""
    db_path: str = "bo_recommendations.duckdb"
    polling_interval: int = 30


class ListenerStatusResponse(BaseModel):
    """监听器状态响应"""
    is_running: bool
    db_path: str
    polling_interval: int
    pending_count: int


class ManualTriggerResponse(BaseModel):
    """手动触发响应"""
    success: bool
    message: str
    timestamp: str
    error: Optional[str] = None


class ExperimentStatusResponse(BaseModel):
    """实验状态响应"""
    experiment_id: str
    experiment_name: str
    status: str
    origin: str
    created_at: Optional[str]
    bo_recommendation_id: Optional[str]
    bo_round: Optional[int]


class CreateRecommendationRequest(BaseModel):
    """创建推荐请求"""
    round: int
    flow_rate: float
    powder_type: str
    volume: float
    temperature: Optional[float] = None
    pressure: Optional[float] = None


# API 端点
@router.get("/status", response_model=ListenerStatusResponse)
async def get_listener_status():
    """获取监听器状态"""
    try:
        listener = get_listener()
        status = listener.get_status()
        return ListenerStatusResponse(**status)
    except Exception as e:
        logger.error(f"Failed to get listener status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/start")
async def start_listener(
    config: ListenerConfig,
    background_tasks: BackgroundTasks
):
    """启动监听器"""
    try:
        listener = get_listener()

        if listener.is_running:
            raise HTTPException(status_code=400, detail="Listener is already running")

        # 在后台启动监听器
        background_tasks.add_task(
            start_bo_listener,
            config.db_path,
            config.polling_interval
        )

        return {
            "success": True,
            "message": "BO listener started successfully",
            "config": config.dict()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start listener: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop")
async def stop_listener():
    """停止监听器"""
    try:
        listener = get_listener()

        if not listener.is_running:
            raise HTTPException(status_code=400, detail="Listener is not running")

        await stop_bo_listener()

        return {
            "success": True,
            "message": "BO listener stopped successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to stop listener: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/trigger", response_model=ManualTriggerResponse)
async def manual_trigger():
    """手动触发推荐处理"""
    try:
        listener = get_listener()
        result = await listener.manual_trigger()

        if result["success"]:
            return ManualTriggerResponse(**result)
        else:
            return ManualTriggerResponse(
                success=False,
                message="Manual trigger failed",
                timestamp=result["timestamp"],
                error=result.get("error")
            )

    except Exception as e:
        logger.error(f"Manual trigger failed: {e}")
        return ManualTriggerResponse(
            success=False,
            message="Manual trigger failed",
            timestamp=datetime.now().isoformat(),
            error=str(e)
        )


@router.get("/experiments", response_model=List[ExperimentStatusResponse])
async def list_experiments():
    """列出所有 BO 生成的实验"""
    try:
        task_creator = get_task_creator()
        experiments = task_creator.list_active_experiments()

        return [ExperimentStatusResponse(**exp) for exp in experiments]

    except Exception as e:
        logger.error(f"Failed to list experiments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/experiments/{experiment_id}", response_model=ExperimentStatusResponse)
async def get_experiment_status(experiment_id: str):
    """获取特定实验的状态"""
    try:
        task_creator = get_task_creator()
        experiment = task_creator.get_experiment_status(experiment_id)

        if not experiment:
            raise HTTPException(status_code=404, detail="Experiment not found")

        return ExperimentStatusResponse(**experiment)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get experiment status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/experiments/{experiment_id}")
async def cancel_experiment(experiment_id: str):
    """取消实验"""
    try:
        task_creator = get_task_creator()
        success = task_creator.cancel_experiment(experiment_id)

        if not success:
            raise HTTPException(status_code=404, detail="Experiment not found or cannot be cancelled")

        return {
            "success": True,
            "message": f"Experiment {experiment_id} cancelled successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommendations")
async def create_test_recommendation(request: CreateRecommendationRequest):
    """创建测试推荐（用于开发和测试）"""
    try:
        import duckdb
        import uuid

        listener = get_listener()

        # 插入测试推荐到数据库
        conn = duckdb.connect(listener.db_path)

        recommendation_id = str(uuid.uuid4())

        conn.execute("""
            INSERT INTO recommendations (
                id, round, flow_rate, powder_type, volume,
                temperature, pressure, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
        """, [
            recommendation_id,
            request.round,
            request.flow_rate,
            request.powder_type,
            request.volume,
            request.temperature,
            request.pressure
        ])

        conn.close()

        return {
            "success": True,
            "message": "Test recommendation created successfully",
            "recommendation_id": recommendation_id,
            "data": request.dict()
        }

    except Exception as e:
        logger.error(f"Failed to create test recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def list_recommendations(status: Optional[str] = None, limit: int = 50):
    """列出推荐记录"""
    try:
        import duckdb

        listener = get_listener()
        conn = duckdb.connect(listener.db_path)

        if status:
            query = """
                SELECT id, round, flow_rate, powder_type, volume,
                       temperature, pressure, status, created_at, processed_at
                FROM recommendations
                WHERE status = ?
                ORDER BY created_at DESC
                LIMIT ?
            """
            result = conn.execute(query, [status, limit]).fetchall()
        else:
            query = """
                SELECT id, round, flow_rate, powder_type, volume,
                       temperature, pressure, status, created_at, processed_at
                FROM recommendations
                ORDER BY created_at DESC
                LIMIT ?
            """
            result = conn.execute(query, [limit]).fetchall()

        conn.close()

        recommendations = []
        for row in result:
            recommendations.append({
                "id": row[0],
                "round": row[1],
                "flow_rate": row[2],
                "powder_type": row[3],
                "volume": row[4],
                "temperature": row[5],
                "pressure": row[6],
                "status": row[7],
                "created_at": row[8].isoformat() if row[8] else None,
                "processed_at": row[9].isoformat() if row[9] else None
            })

        return {
            "success": True,
            "count": len(recommendations),
            "recommendations": recommendations
        }

    except Exception as e:
        logger.error(f"Failed to list recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """健康检查"""
    try:
        listener = get_listener()
        task_creator = get_task_creator()

        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "listener": {
                    "status": "running" if listener.is_running else "stopped",
                    "pending_count": len(listener._get_pending_recommendations())
                },
                "task_creator": {
                    "status": "ready",
                    "active_experiments": len(task_creator.list_active_experiments())
                }
            }
        }

    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }
