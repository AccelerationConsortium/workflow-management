"""
MyxArm Primitive Functions for SDL Catalyst Integration
"""

import logging
from typing import Dict, Any, Optional
from .hardware_manager import HardwareManager

logger = logging.getLogger(__name__)

# Global hardware manager instance
_hardware_manager = None

def get_hardware_manager():
    """Get or create hardware manager instance"""
    global _hardware_manager
    if _hardware_manager is None:
        _hardware_manager = HardwareManager()
    return _hardware_manager

def execute_myxarm_move_position(
    x: float = 0,
    y: float = 0, 
    z: float = 200,
    roll: float = 180,
    pitch: float = 0,
    yaw: float = 0,
    speed: float = 100,
    acceleration: float = 200,
    wait: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Move MyxArm robot to specified cartesian position
    
    Args:
        x: X coordinate in mm
        y: Y coordinate in mm
        z: Z coordinate in mm
        roll: Roll angle in degrees
        pitch: Pitch angle in degrees
        yaw: Yaw angle in degrees
        speed: Movement speed in mm/s
        acceleration: Movement acceleration in mm/s²
        wait: Wait for movement completion
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'x': float(x),
            'y': float(y),
            'z': float(z),
            'roll': float(roll),
            'pitch': float(pitch),
            'yaw': float(yaw),
            'speed': float(speed),
            'acceleration': float(acceleration),
            'wait': bool(wait)
        }
        
        result = hw_manager.execute_operation('myxarm', 'move_position', params)
        
        if result['success']:
            logger.info(f"MyxArm moved to position ({x}, {y}, {z}) at {speed} mm/s")
            return {
                'success': True,
                'message': f'Moved to position ({x}, {y}, {z})',
                'parameters': params
            }
        else:
            logger.error(f"MyxArm move failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"MyxArm move position failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_myxarm_move_angles(
    j1: float = 0,
    j2: float = 0,
    j3: float = 0,
    j4: float = 0,
    j5: float = 0,
    j6: float = 0,
    speed: float = 20,
    acceleration: float = 500,
    wait: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Move MyxArm robot joints to specified angles
    
    Args:
        j1-j6: Joint angles in degrees
        speed: Angular speed in deg/s
        acceleration: Angular acceleration in deg/s²
        wait: Wait for movement completion
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'j1': float(j1),
            'j2': float(j2),
            'j3': float(j3),
            'j4': float(j4),
            'j5': float(j5),
            'j6': float(j6),
            'speed': float(speed),
            'acceleration': float(acceleration),
            'wait': bool(wait)
        }
        
        result = hw_manager.execute_operation('myxarm', 'move_angles', params)
        
        if result['success']:
            angles_str = f"[{j1}, {j2}, {j3}, {j4}, {j5}, {j6}]"
            logger.info(f"MyxArm moved to angles {angles_str} at {speed} deg/s")
            return {
                'success': True,
                'message': f'Moved to angles {angles_str}',
                'parameters': params
            }
        else:
            logger.error(f"MyxArm angle move failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"MyxArm move angles failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_myxarm_gripper(
    position: int = 500,
    speed: int = 5000,
    wait: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """
    Control MyxArm gripper position
    
    Args:
        position: Gripper position (0=closed, 850=open)
        speed: Gripper movement speed in pulse/s
        wait: Wait for gripper movement completion
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'position': int(position),
            'speed': int(speed),
            'wait': bool(wait)
        }
        
        result = hw_manager.execute_operation('myxarm', 'gripper_control', params)
        
        if result['success']:
            state = "closed" if position < 200 else "open" if position > 600 else "partial"
            logger.info(f"MyxArm gripper set to {position} pulse ({state})")
            return {
                'success': True,
                'message': f'Gripper set to {position} pulse ({state})',
                'parameters': params
            }
        else:
            logger.error(f"MyxArm gripper control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"MyxArm gripper control failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def get_myxarm_status(**kwargs) -> Dict[str, Any]:
    """
    Get current MyxArm status
    
    Returns:
        Dictionary with current robot status
    """
    try:
        hw_manager = get_hardware_manager()
        status = hw_manager.get_hardware_status()
        
        return {
            'success': True,
            'status': status.get('myxarm', {}),
            'message': 'Status retrieved successfully'
        }
        
    except Exception as e:
        logger.error(f"Failed to get MyxArm status: {e}")
        return {
            'success': False,
            'error': str(e)
        }