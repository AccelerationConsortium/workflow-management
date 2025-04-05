from typing import Dict, Type, Optional
from ..executors.base_executor import BaseExecutor
import importlib
import logging

logger = logging.getLogger(__name__)

class ExecutorRegistry:
    """执行器注册表，管理所有可用的执行器实现"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._executors: Dict[str, Type[BaseExecutor]] = {}
            cls._instance._active_executors: Dict[str, BaseExecutor] = {}
        return cls._instance
    
    def register_executor(self, name: str, executor_class: Type[BaseExecutor]) -> None:
        """注册新的执行器类型"""
        if name in self._executors:
            logger.warning(f"Executor {name} already registered, will be overwritten")
        self._executors[name] = executor_class
        logger.info(f"Registered executor: {name}")
    
    def register_executor_from_path(self, name: str, module_path: str, class_name: str) -> None:
        """从模块路径动态加载并注册执行器"""
        try:
            module = importlib.import_module(module_path)
            executor_class = getattr(module, class_name)
            self.register_executor(name, executor_class)
        except (ImportError, AttributeError) as e:
            logger.error(f"Failed to load executor {name} from {module_path}.{class_name}: {e}")
            raise
    
    async def get_executor(self, name: str) -> BaseExecutor:
        """获取执行器实例，如果不存在则创建新实例"""
        if name not in self._executors:
            raise ValueError(f"Unknown executor type: {name}")
            
        if name not in self._active_executors:
            executor = self._executors[name]()
            await executor.initialize()
            self._active_executors[name] = executor
            
        return self._active_executors[name]
    
    async def cleanup(self) -> None:
        """清理所有活动的执行器实例"""
        for name, executor in self._active_executors.items():
            try:
                await executor.cleanup()
            except Exception as e:
                logger.error(f"Error cleaning up executor {name}: {e}")
        self._active_executors.clear() 
