"""
Hardware Manager for OTFLEX Workflow Integration
Provides abstraction layer for MyxArm, Arduino, and Opentrons Flex hardware
"""

import json
import logging
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class HardwareType(Enum):
    MYXARM = "myxarm"
    ARDUINO = "arduino"
    OTFLEX = "otflex"

@dataclass
class HardwareConfig:
    """Hardware configuration data structure"""
    type: HardwareType
    connection: Dict[str, Any]
    capabilities: Dict[str, Any]
    calibration: Optional[Dict[str, Any]] = None

class HardwareManager:
    """Central hardware management system"""
    
    def __init__(self, config_path: str = "backend/config/hardware_config.json"):
        self.config_path = config_path
        self.hardware_configs = {}
        self.connections = {}
        self.load_configurations()
        
    def load_configurations(self):
        """Load hardware configurations from JSON file"""
        try:
            with open(self.config_path, 'r') as f:
                config_data = json.load(f)
                
            for hw_name, hw_config in config_data.get('hardware_platforms', {}).items():
                self.hardware_configs[hw_name] = HardwareConfig(
                    type=HardwareType(hw_name),
                    connection=hw_config.get('connection', {}),
                    capabilities=hw_config.get('capabilities', {}),
                    calibration=hw_config.get('calibration')
                )
                logger.info(f"Loaded configuration for {hw_name}")
                
        except Exception as e:
            logger.error(f"Failed to load hardware configurations: {e}")
            
    def initialize_hardware(self, hardware_type: str) -> bool:
        """Initialize specific hardware connection"""
        if hardware_type not in self.hardware_configs:
            logger.error(f"Unknown hardware type: {hardware_type}")
            return False
            
        config = self.hardware_configs[hardware_type]
        
        try:
            if hardware_type == "myxarm":
                from .myxarm_handler import MyxArmHandler
                self.connections[hardware_type] = MyxArmHandler(config)
            elif hardware_type == "arduino":
                from .arduino_handler import ArduinoHandler
                self.connections[hardware_type] = ArduinoHandler(config)
            elif hardware_type == "otflex":
                from .otflex_handler import OTFlexHandler
                self.connections[hardware_type] = OTFlexHandler(config)
            else:
                logger.error(f"No handler available for {hardware_type}")
                return False
                
            return self.connections[hardware_type].connect()
            
        except Exception as e:
            logger.error(f"Failed to initialize {hardware_type}: {e}")
            return False
            
    def execute_operation(self, hardware_type: str, operation: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute hardware operation"""
        if hardware_type not in self.connections:
            if not self.initialize_hardware(hardware_type):
                return {"success": False, "error": f"Failed to initialize {hardware_type}"}
                
        handler = self.connections[hardware_type]
        
        try:
            result = handler.execute(operation, params)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Operation failed: {operation} on {hardware_type}: {e}")
            return {"success": False, "error": str(e)}
            
    def disconnect_all(self):
        """Disconnect all hardware connections"""
        for hw_type, handler in self.connections.items():
            try:
                handler.disconnect()
                logger.info(f"Disconnected {hw_type}")
            except Exception as e:
                logger.error(f"Failed to disconnect {hw_type}: {e}")
                
    def get_hardware_status(self) -> Dict[str, Any]:
        """Get status of all hardware connections"""
        status = {}
        for hw_type, config in self.hardware_configs.items():
            if hw_type in self.connections:
                handler = self.connections[hw_type]
                status[hw_type] = {
                    "connected": handler.is_connected(),
                    "status": handler.get_status()
                }
            else:
                status[hw_type] = {
                    "connected": False,
                    "status": "Not initialized"
                }
        return status