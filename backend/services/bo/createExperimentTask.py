"""
自动实验任务创建模块

功能：
- 将映射后的 UO 配置插入到 Canvas 的任务队列中
- 生成新的实验工作流
- 与现有的工作流执行系统集成
"""

import uuid
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# 导入现有的执行器和配置
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../../..'))

try:
    from backend.executors.base_executor import TaskConfig, TaskStatus
    from backend.executors.sdl_catalyst_executor import SDLCatalystExecutor
    from backend.api.websocket_service import ws_manager
except ImportError:
    # 如果无法导入，创建模拟类用于测试
    from dataclasses import dataclass
    from enum import Enum

    class TaskStatus(Enum):
        PENDING = "pending"
        RUNNING = "running"
        SUCCESS = "success"
        ERROR = "error"

    @dataclass
    class TaskConfig:
        task_id: str
        task_type: str
        parameters: Dict[str, Any]

    @dataclass
    class TaskResult:
        task_id: str
        status: TaskStatus
        result: Optional[Dict[str, Any]] = None
        error: Optional[str] = None
        logs: Optional[List[str]] = None

    class SDLCatalystExecutor:
        def __init__(self):
            self._tasks = {}

        async def execute_task(self, config: TaskConfig) -> TaskResult:
            # 模拟执行
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.SUCCESS,
                result={"message": "Mock execution completed"}
            )

        def get_task_status(self, task_id: str) -> TaskStatus:
            return TaskStatus.SUCCESS

    class MockWebSocketManager:
        async def broadcast_message(self, channel: str, message: Dict[str, Any]):
            print(f"Mock broadcast to {channel}: {message}")

    ws_manager = MockWebSocketManager()

logger = logging.getLogger(__name__)


@dataclass
class ExperimentConfig:
    """实验配置"""
    experiment_id: str
    experiment_name: str
    unit_operations: List[Dict[str, Any]]
    origin: str = "BO"
    priority: int = 1
    metadata: Optional[Dict[str, Any]] = None


class ExperimentTaskCreator:
    """实验任务创建器"""

    def __init__(self):
        """初始化任务创建器"""
        self.executor = SDLCatalystExecutor()
        self._active_experiments: Dict[str, ExperimentConfig] = {}

    async def create_experiment_task(
        self,
        recommendation,
        uo_config: Dict[str, Any],
        experiment_name: Optional[str] = None
    ) -> str:
        """
        创建实验任务

        Args:
            recommendation: BO 推荐对象
            uo_config: 映射后的 UO 配置
            experiment_name: 实验名称，如果为 None 则自动生成

        Returns:
            实验 ID
        """
        # 生成实验 ID 和名称
        experiment_id = str(uuid.uuid4())
        if not experiment_name:
            experiment_name = f"BO-Round-{recommendation.round}-{recommendation.id[:8]}"

        try:
            # 创建实验配置
            experiment_config = ExperimentConfig(
                experiment_id=experiment_id,
                experiment_name=experiment_name,
                unit_operations=[uo_config],
                origin="BO",
                metadata={
                    "bo_recommendation_id": recommendation.id,
                    "bo_round": recommendation.round,
                    "created_at": datetime.now().isoformat(),
                    "auto_generated": True
                }
            )

            # 保存实验配置
            self._active_experiments[experiment_id] = experiment_config

            # 创建工作流配置
            workflow_config = self._create_workflow_config(experiment_config)

            # 提交到执行器
            await self._submit_to_executor(experiment_id, workflow_config)

            logger.info(f"Created experiment task {experiment_id} for BO recommendation {recommendation.id}")
            return experiment_id

        except Exception as e:
            logger.error(f"Failed to create experiment task: {e}")
            # 清理失败的实验
            if experiment_id in self._active_experiments:
                del self._active_experiments[experiment_id]
            raise

    def _create_workflow_config(self, experiment_config: ExperimentConfig) -> Dict[str, Any]:
        """创建工作流配置"""
        workflow_config = {
            "workflow_id": experiment_config.experiment_id,
            "workflow_name": experiment_config.experiment_name,
            "workflow_type": "bo_experiment",
            "nodes": [],
            "edges": [],
            "metadata": experiment_config.metadata
        }

        # 为每个 UO 创建节点
        for i, uo_config in enumerate(experiment_config.unit_operations):
            node_id = f"node_{i+1}"
            node = {
                "id": node_id,
                "type": uo_config["unit_operation"],
                "position": {"x": 100 + i * 200, "y": 100},
                "data": {
                    "label": uo_config.get("description", uo_config["unit_operation"]),
                    "parameters": uo_config["parameters"],
                    "category": uo_config.get("category", "process"),
                    "metadata": uo_config.get("metadata", {})
                }
            }
            workflow_config["nodes"].append(node)

            # 如果有多个节点，创建连接边
            if i > 0:
                edge = {
                    "id": f"edge_{i}",
                    "source": f"node_{i}",
                    "target": node_id,
                    "type": "default"
                }
                workflow_config["edges"].append(edge)

        return workflow_config

    async def _submit_to_executor(self, experiment_id: str, workflow_config: Dict[str, Any]):
        """提交到执行器"""
        try:
            # 创建任务配置
            task_config = TaskConfig(
                task_id=experiment_id,
                task_type="bo_experiment",
                parameters={"workflow_config": workflow_config}
            )

            # 异步执行任务
            asyncio.create_task(self._execute_experiment_task(task_config))

            # 通过 WebSocket 通知前端
            await self._notify_experiment_created(experiment_id, workflow_config)

            logger.info(f"Submitted experiment {experiment_id} to executor")

        except Exception as e:
            logger.error(f"Failed to submit experiment {experiment_id} to executor: {e}")
            raise

    async def _execute_experiment_task(self, task_config: TaskConfig):
        """执行实验任务"""
        try:
            logger.info(f"Starting execution of experiment {task_config.task_id}")

            # 通知开始执行
            await self._notify_experiment_status(
                task_config.task_id,
                "running",
                "Experiment execution started"
            )

            # 执行任务
            result = await self.executor.execute_task(task_config)

            # 处理执行结果
            if result.status == TaskStatus.SUCCESS:
                await self._notify_experiment_status(
                    task_config.task_id,
                    "completed",
                    "Experiment completed successfully",
                    result.result
                )
                logger.info(f"Experiment {task_config.task_id} completed successfully")
            else:
                await self._notify_experiment_status(
                    task_config.task_id,
                    "failed",
                    f"Experiment failed: {result.error or 'Unknown error'}"
                )
                logger.error(f"Experiment {task_config.task_id} failed")

        except Exception as e:
            logger.error(f"Error executing experiment {task_config.task_id}: {e}")
            await self._notify_experiment_status(
                task_config.task_id,
                "failed",
                f"Execution error: {str(e)}"
            )

    async def _notify_experiment_created(self, experiment_id: str, workflow_config: Dict[str, Any]):
        """通知实验已创建"""
        try:
            notification = {
                "type": "experiment_created",
                "experiment_id": experiment_id,
                "workflow_config": workflow_config,
                "timestamp": datetime.now().isoformat()
            }

            await ws_manager.broadcast_message("bo_experiments", notification)
            logger.debug(f"Notified experiment created: {experiment_id}")

        except Exception as e:
            logger.error(f"Failed to notify experiment created: {e}")

    async def _notify_experiment_status(
        self,
        experiment_id: str,
        status: str,
        message: str,
        results: Optional[Dict[str, Any]] = None
    ):
        """通知实验状态变化"""
        try:
            notification = {
                "type": "experiment_status_update",
                "experiment_id": experiment_id,
                "status": status,
                "message": message,
                "results": results,
                "timestamp": datetime.now().isoformat()
            }

            await ws_manager.broadcast_message("bo_experiments", notification)
            logger.debug(f"Notified experiment status: {experiment_id} -> {status}")

        except Exception as e:
            logger.error(f"Failed to notify experiment status: {e}")

    def get_experiment_status(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        """获取实验状态"""
        if experiment_id not in self._active_experiments:
            return None

        experiment_config = self._active_experiments[experiment_id]

        # 从执行器获取任务状态
        task_status = self.executor.get_task_status(experiment_id)

        return {
            "experiment_id": experiment_id,
            "experiment_name": experiment_config.experiment_name,
            "status": task_status.value if task_status else "unknown",
            "origin": experiment_config.origin,
            "created_at": experiment_config.metadata.get("created_at"),
            "bo_recommendation_id": experiment_config.metadata.get("bo_recommendation_id"),
            "bo_round": experiment_config.metadata.get("bo_round")
        }

    def list_active_experiments(self) -> List[Dict[str, Any]]:
        """列出所有活跃的实验"""
        experiments = []
        for experiment_id in self._active_experiments:
            status = self.get_experiment_status(experiment_id)
            if status:
                experiments.append(status)
        return experiments

    def cancel_experiment(self, experiment_id: str) -> bool:
        """取消实验"""
        try:
            if experiment_id in self._active_experiments:
                # 尝试取消执行器中的任务
                # 注意：这里需要根据实际的执行器实现来调整
                logger.info(f"Cancelling experiment {experiment_id}")

                # 从活跃实验列表中移除
                del self._active_experiments[experiment_id]

                return True
            return False

        except Exception as e:
            logger.error(f"Failed to cancel experiment {experiment_id}: {e}")
            return False

    async def create_batch_experiments(
        self,
        recommendations: List,
        uo_configs: List[Dict[str, Any]],
        batch_name: Optional[str] = None
    ) -> List[str]:
        """批量创建实验任务"""
        if len(recommendations) != len(uo_configs):
            raise ValueError("Number of recommendations must match number of UO configs")

        experiment_ids = []
        batch_id = str(uuid.uuid4())[:8]

        if not batch_name:
            batch_name = f"BO-Batch-{batch_id}"

        logger.info(f"Creating batch of {len(recommendations)} experiments: {batch_name}")

        for i, (recommendation, uo_config) in enumerate(zip(recommendations, uo_configs)):
            try:
                experiment_name = f"{batch_name}-{i+1}"
                experiment_id = await self.create_experiment_task(
                    recommendation, uo_config, experiment_name
                )
                experiment_ids.append(experiment_id)

                # 添加批次信息到元数据
                if experiment_id in self._active_experiments:
                    self._active_experiments[experiment_id].metadata.update({
                        "batch_id": batch_id,
                        "batch_name": batch_name,
                        "batch_index": i + 1,
                        "batch_size": len(recommendations)
                    })

            except Exception as e:
                logger.error(f"Failed to create experiment {i+1} in batch: {e}")
                # 继续创建其他实验
                continue

        logger.info(f"Created {len(experiment_ids)} experiments in batch {batch_name}")
        return experiment_ids


# 全局任务创建器实例
_task_creator_instance: Optional[ExperimentTaskCreator] = None


def get_task_creator() -> ExperimentTaskCreator:
    """获取全局任务创建器实例"""
    global _task_creator_instance
    if _task_creator_instance is None:
        _task_creator_instance = ExperimentTaskCreator()
    return _task_creator_instance
