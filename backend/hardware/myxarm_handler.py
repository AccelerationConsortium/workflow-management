"""
MyxArm Robot Handler for OTFLEX Workflow
Handles communication and control of UFactory xArm 6 robot
"""

import logging
import time
from typing import Dict, Any, List, Optional
import sys

logger = logging.getLogger(__name__)

class MyxArmHandler:
    """Handler for MyxArm robot operations"""
    
    def __init__(self, config):
        self.config = config
        self.arm = None
        self.connected = False
        self.tcp_speed = 100
        self.tcp_acc = 200
        self.angle_speed = 20
        self.angle_acc = 500
        
    def connect(self) -> bool:
        """Establish connection to MyxArm robot"""
        try:
            # Import xArm SDK only when needed
            from xarm.wrapper import XArmAPI
            
            connection = self.config.connection
            ip = connection.get('ip', '192.168.1.233')
            
            logger.info(f"Connecting to MyxArm at {ip}")
            self.arm = XArmAPI(ip, baud_checkset=False)
            time.sleep(0.5)
            
            # Initialize robot
            if self.config.capabilities.get('initialization', {}).get('auto_enable', True):
                self._initialize_robot()
                
            self.connected = True
            logger.info("MyxArm connected successfully")
            return True
            
        except ImportError:
            logger.error("xArm SDK not installed. Please install: pip install xarm-python-sdk")
            return False
        except Exception as e:
            logger.error(f"Failed to connect to MyxArm: {e}")
            return False
            
    def _initialize_robot(self):
        """Initialize robot to ready state"""
        if not self.arm:
            return
            
        try:
            self.arm.clean_warn()
            self.arm.clean_error()
            self.arm.motion_enable(True)
            self.arm.set_mode(0)
            self.arm.set_state(0)
            time.sleep(1)
            logger.info("MyxArm initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MyxArm: {e}")
            
    def disconnect(self):
        """Disconnect from MyxArm robot"""
        if self.arm:
            try:
                self.arm.disconnect()
                self.connected = False
                logger.info("MyxArm disconnected")
            except Exception as e:
                logger.error(f"Error disconnecting MyxArm: {e}")
                
    def is_connected(self) -> bool:
        """Check if robot is connected"""
        return self.connected and self.arm and self.arm.connected
        
    def get_status(self) -> Dict[str, Any]:
        """Get current robot status"""
        if not self.is_connected():
            return {"error": "Not connected"}
            
        try:
            return {
                "state": self.arm.state,
                "error_code": self.arm.error_code,
                "warn_code": self.arm.warn_code,
                "position": self.arm.position,
                "angles": self.arm.angles
            }
        except Exception as e:
            return {"error": str(e)}
            
    def execute(self, operation: str, params: Dict[str, Any]) -> Any:
        """Execute robot operation"""
        if not self.is_connected():
            raise Exception("Robot not connected")
            
        operations = {
            "move_position": self._move_position,
            "move_angles": self._move_angles,
            "gripper_control": self._gripper_control,
            "set_speed": self._set_speed,
            "get_position": self._get_position,
            "get_angles": self._get_angles,
            "home": self._home
        }
        
        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")
            
        return operations[operation](params)
        
    def _move_position(self, params: Dict[str, Any]) -> bool:
        """Move robot to cartesian position"""
        x = params.get('x', 0)
        y = params.get('y', 0)
        z = params.get('z', 200)
        roll = params.get('roll', 180)
        pitch = params.get('pitch', 0)
        yaw = params.get('yaw', 0)
        speed = params.get('speed', self.tcp_speed)
        acc = params.get('acceleration', self.tcp_acc)
        wait = params.get('wait', True)
        
        try:
            code = self.arm.set_position(
                x, y, z, roll, pitch, yaw,
                speed=speed, mvacc=acc, wait=wait
            )
            
            if code != 0:
                logger.error(f"Move position failed with code: {code}")
                return False
                
            logger.info(f"Moved to position: ({x}, {y}, {z})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to move to position: {e}")
            return False
            
    def _move_angles(self, params: Dict[str, Any]) -> bool:
        """Move robot joints to specified angles"""
        angles = [
            params.get('j1', 0),
            params.get('j2', 0),
            params.get('j3', 0),
            params.get('j4', 0),
            params.get('j5', 0),
            params.get('j6', 0)
        ]
        speed = params.get('speed', self.angle_speed)
        acc = params.get('acceleration', self.angle_acc)
        wait = params.get('wait', True)
        
        try:
            code = self.arm.set_servo_angle(
                angle=angles,
                speed=speed,
                mvacc=acc,
                wait=wait
            )
            
            if code != 0:
                logger.error(f"Move angles failed with code: {code}")
                return False
                
            logger.info(f"Moved to angles: {angles}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to move to angles: {e}")
            return False
            
    def _gripper_control(self, params: Dict[str, Any]) -> bool:
        """Control gripper position"""
        position = params.get('position', 500)
        speed = params.get('speed', 5000)
        wait = params.get('wait', True)
        
        try:
            code = self.arm.set_gripper_position(
                position, wait=wait, speed=speed, auto_enable=True
            )
            
            if code != 0:
                logger.error(f"Gripper control failed with code: {code}")
                return False
                
            logger.info(f"Gripper moved to position: {position}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to control gripper: {e}")
            return False
            
    def _set_speed(self, params: Dict[str, Any]) -> bool:
        """Set robot movement speeds"""
        if 'tcp_speed' in params:
            self.tcp_speed = params['tcp_speed']
        if 'tcp_acc' in params:
            self.tcp_acc = params['tcp_acc']
        if 'angle_speed' in params:
            self.angle_speed = params['angle_speed']
        if 'angle_acc' in params:
            self.angle_acc = params['angle_acc']
            
        logger.info(f"Speed settings updated")
        return True
        
    def _get_position(self, params: Dict[str, Any]) -> Optional[List[float]]:
        """Get current cartesian position"""
        try:
            return self.arm.position
        except Exception as e:
            logger.error(f"Failed to get position: {e}")
            return None
            
    def _get_angles(self, params: Dict[str, Any]) -> Optional[List[float]]:
        """Get current joint angles"""
        try:
            return self.arm.angles
        except Exception as e:
            logger.error(f"Failed to get angles: {e}")
            return None
            
    def _home(self, params: Dict[str, Any]) -> bool:
        """Move robot to home position"""
        try:
            # Define home position (can be customized in config)
            home_angles = [0, 0, 0, 0, 0, 0]
            return self._move_angles({'j1': 0, 'j2': 0, 'j3': 0, 'j4': 0, 'j5': 0, 'j6': 0})
        except Exception as e:
            logger.error(f"Failed to home robot: {e}")
            return False