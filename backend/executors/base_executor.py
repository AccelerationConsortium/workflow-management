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
    task_id: str
    task_type: str
    parameters: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class TaskResult:
    task_id: str
    status: TaskStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    logs: Optional[list[str]] = None

class BaseExecutor(ABC):
    
    @abstractmethod
    async def initialize(self) -> None:
        pass
    
    @abstractmethod
    async def execute_task(self, config: TaskConfig) -> TaskResult:
        pass

    @abstractmethod
    async def get_status(self, task_id: str) -> TaskStatus:
        pass
    
    @abstractmethod
    async def cleanup(self) -> None:
        pass