import yaml
import asyncio
import logging
from typing import Dict, Any, List
from ..executors.base_executor import TaskConfig, TaskResult, TaskStatus
from ..registry.executor_registry import ExecutorRegistry

logger = logging.getLogger(__name__)

class ConfigRunner:
    """配置驱动的工作流运行器"""
    
    def __init__(self):
        self.registry = ExecutorRegistry()
        self._running_tasks: Dict[str, asyncio.Task] = {}
    
    def _parse_task_config(self, raw_config: Dict[str, Any]) -> TaskConfig:
        """解析原始配置为TaskConfig对象"""
        return TaskConfig(
            task_id=raw_config['id'],
            task_type=raw_config['type'],
            parameters=raw_config.get('parameters', {}),
            metadata=raw_config.get('metadata', {})
        )
    
    async def run_task(self, task_config: Dict[str, Any]) -> TaskResult:
        """运行单个任务"""
        executor_type = task_config.get('executor', 'python')  # 默认使用python执行器
        
        try:
            # 获取执行器
            executor = await self.registry.get_executor(executor_type)
            
            # 解析配置
            config = self._parse_task_config(task_config)
            
            # 执行任务
            logger.info(f"Starting task {config.task_id} with executor {executor_type}")
            result = await executor.execute_task(config)
            logger.info(f"Task {config.task_id} completed with status {result.status}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing task: {e}")
            return TaskResult(
                task_id=task_config['id'],
                status=TaskStatus.ERROR,
                error=str(e)
            )
    
    async def run_workflow(self, workflow_config: Dict[str, Any]) -> List[TaskResult]:
        """运行完整的工作流程"""
        tasks = workflow_config.get('tasks', [])
        results = []
        
        # TODO: 实现任务依赖和并行执行
        for task_config in tasks:
            result = await self.run_task(task_config)
            results.append(result)
            
            # 如果任务失败，可以选择停止整个工作流
            if result.status == TaskStatus.ERROR:
                logger.error(f"Workflow stopped due to task {result.task_id} failure")
                break
                
        return results
    
    async def cleanup(self):
        """清理所有运行中的任务和执行器"""
        # 取消所有运行中的任务
        for task in self._running_tasks.values():
            task.cancel()
        
        # 等待任务取消完成
        if self._running_tasks:
            await asyncio.gather(*self._running_tasks.values(), return_exceptions=True)
        
        # 清理执行器
        await self.registry.cleanup() 
