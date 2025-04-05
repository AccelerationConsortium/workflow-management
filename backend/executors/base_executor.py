from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"

@dataclass
class TaskConfig:
    """任务配置数据结构"""
    task_id: str
    task_type: str
    parameters: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class TaskResult:
    """任务执行结果数据结构"""
    task_id: str
    status: TaskStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    logs: Optional[list[str]] = None

class BaseExecutor(ABC):
    """执行器基类，定义所有执行器必须实现的接口"""
    
    @abstractmethod
    async def initialize(self) -> None:
        """初始化执行器"""
        pass
    
    @abstractmethod
    async def execute_task(self, config: TaskConfig) -> TaskResult:
        """执行单个任务"""
        pass

    @abstractmethod
    async def get_status(self, task_id: str) -> TaskStatus:
        """获取任务状态"""
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        """清理资源"""
        pass 
