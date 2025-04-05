import asyncio
import logging
from typing import Dict, Any, Callable
from .base_executor import BaseExecutor, TaskConfig, TaskResult, TaskStatus

logger = logging.getLogger(__name__)

class PythonExecutor(BaseExecutor):
    """Python函数执行器"""
    
    def __init__(self):
        self._functions: Dict[str, Callable] = {}
        self._task_status: Dict[str, TaskStatus] = {}
    
    async def initialize(self) -> None:
        """初始化执行器"""
        logger.info("Initializing Python executor")
        # 这里可以加载预定义的函数
        self._register_builtin_functions()
    
    def _register_builtin_functions(self):
        """注册内置函数"""
        # 示例函数
        self.register_function("print", print)
        self.register_function("sum", sum)
    
    def register_function(self, name: str, func: Callable):
        """注册新的可执行函数"""
        if name in self._functions:
            logger.warning(f"Function {name} already registered, will be overwritten")
        self._functions[name] = func
        logger.info(f"Registered function: {name}")
    
    async def execute_task(self, config: TaskConfig) -> TaskResult:
        """执行Python函数"""
        self._task_status[config.task_id] = TaskStatus.RUNNING
        
        try:
            if config.task_type not in self._functions:
                raise ValueError(f"Unknown function: {config.task_type}")
            
            func = self._functions[config.task_type]
            
            # 执行函数
            if asyncio.iscoroutinefunction(func):
                result = await func(**config.parameters)
            else:
                result = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: func(**config.parameters)
                )
            
            self._task_status[config.task_id] = TaskStatus.SUCCESS
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.SUCCESS,
                result=result
            )
            
        except Exception as e:
            logger.error(f"Error executing task {config.task_id}: {e}")
            self._task_status[config.task_id] = TaskStatus.ERROR
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.ERROR,
                error=str(e)
            )
    
    async def get_status(self, task_id: str) -> TaskStatus:
        """获取任务状态"""
        return self._task_status.get(task_id, TaskStatus.PENDING)
    
    async def cleanup(self) -> None:
        """清理资源"""
        self._functions.clear()
        self._task_status.clear()
        logger.info("Python executor cleaned up") 
