import asyncio
import logging
import random
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from .base_executor import BaseExecutor, TaskConfig, TaskResult, TaskStatus

logger = logging.getLogger(__name__)

@dataclass
class DeviceState:
    """模拟设备状态"""
    device_id: str
    status: str  # 'idle', 'busy', 'error'
    temperature: float
    position: Dict[str, float]
    last_command: Optional[str] = None
    error_code: Optional[str] = None

class SimulationExecutor(BaseExecutor):
    """模拟设备执行器，用于测试和开发"""
    
    def __init__(self):
        self._devices: Dict[str, DeviceState] = {}
        self._task_status: Dict[str, TaskStatus] = {}
        self._task_logs: Dict[str, list[str]] = {}
    
    async def initialize(self) -> None:
        """初始化模拟设备"""
        logger.info("Initializing simulation executor")
        # 初始化一些模拟设备
        self._devices["device_1"] = DeviceState(
            device_id="device_1",
            status="idle",
            temperature=25.0,
            position={"x": 0, "y": 0, "z": 0}
        )
        self._devices["device_2"] = DeviceState(
            device_id="device_2",
            status="idle",
            temperature=22.0,
            position={"x": 100, "y": 100, "z": 0}
        )
    
    def _log_task(self, task_id: str, message: str):
        """记录任务日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        log_entry = f"[{timestamp}] {message}"
        if task_id not in self._task_logs:
            self._task_logs[task_id] = []
        self._task_logs[task_id].append(log_entry)
        logger.info(f"Task {task_id}: {message}")
    
    async def _simulate_device_operation(self, device: DeviceState, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """模拟设备操作"""
        if device.status == "error":
            raise ValueError(f"Device {device.device_id} is in error state")
        
        if device.status == "busy":
            raise RuntimeError(f"Device {device.device_id} is busy")
        
        device.status = "busy"
        device.last_command = operation
        
        # 模拟操作延迟
        delay = random.uniform(0.5, 2.0)
        await asyncio.sleep(delay)
        
        # 随机模拟错误
        if random.random() < 0.1:  # 10% 错误率
            device.status = "error"
            device.error_code = f"ERR_{random.randint(1000, 9999)}"
            raise RuntimeError(f"Device operation failed: {device.error_code}")
        
        # 模拟操作结果
        result = {}
        if operation == "move":
            device.position.update(params.get("position", {}))
            result["new_position"] = device.position
        elif operation == "measure":
            result["temperature"] = device.temperature + random.uniform(-0.5, 0.5)
        elif operation == "reset":
            device.position = {"x": 0, "y": 0, "z": 0}
            device.temperature = 25.0
            result["status"] = "reset_complete"
        
        device.status = "idle"
        return result
    
    async def execute_task(self, config: TaskConfig) -> TaskResult:
        """执行模拟任务"""
        self._task_status[config.task_id] = TaskStatus.RUNNING
        self._log_task(config.task_id, f"Starting task: {config.task_type}")
        
        try:
            # 解析任务参数
            device_id = config.parameters.get("device_id")
            if not device_id:
                raise ValueError("device_id is required")
            
            device = self._devices.get(device_id)
            if not device:
                raise ValueError(f"Unknown device: {device_id}")
            
            operation = config.parameters.get("operation")
            if not operation:
                raise ValueError("operation is required")
            
            # 执行模拟操作
            self._log_task(config.task_id, f"Executing operation {operation} on device {device_id}")
            result = await self._simulate_device_operation(
                device,
                operation,
                config.parameters.get("params", {})
            )
            
            self._task_status[config.task_id] = TaskStatus.SUCCESS
            self._log_task(config.task_id, "Task completed successfully")
            
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.SUCCESS,
                result=result,
                logs=self._task_logs.get(config.task_id, [])
            )
            
        except Exception as e:
            error_msg = str(e)
            self._log_task(config.task_id, f"Task failed: {error_msg}")
            self._task_status[config.task_id] = TaskStatus.ERROR
            
            return TaskResult(
                task_id=config.task_id,
                status=TaskStatus.ERROR,
                error=error_msg,
                logs=self._task_logs.get(config.task_id, [])
            )
    
    async def get_status(self, task_id: str) -> TaskStatus:
        """获取任务状态"""
        return self._task_status.get(task_id, TaskStatus.PENDING)
    
    def get_device_state(self, device_id: str) -> Optional[DeviceState]:
        """获取设备状态"""
        return self._devices.get(device_id)
    
    async def cleanup(self) -> None:
        """清理资源"""
        self._devices.clear()
        self._task_status.clear()
        self._task_logs.clear()
        logger.info("Simulation executor cleaned up") 
