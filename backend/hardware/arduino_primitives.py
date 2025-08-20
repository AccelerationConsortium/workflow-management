"""
Arduino Primitive Functions for SDL Catalyst Integration
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

def execute_arduino_pump(
    pump_number: int = 0,
    volume: float = 1.0,
    mode: str = "dispense",
    duration: int = 1000,
    **kwargs
) -> Dict[str, Any]:
    """
    Control Arduino-connected pump for liquid dispensing
    
    Args:
        pump_number: Pump number (0-5)
        volume: Volume to dispense in ml (for dispense mode)
        mode: Pump operation mode (dispense, on, off)
        duration: Duration in ms for timed operations
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'pump_number': int(pump_number),
            'mode': str(mode).lower()
        }
        
        if mode == "dispense":
            params['volume'] = float(volume)
            operation = 'pump_dispense'
        else:
            params['duration'] = int(duration)
            operation = 'pump_control'
        
        result = hw_manager.execute_operation('arduino', operation, params)
        
        if result['success']:
            if mode == "dispense":
                logger.info(f"Arduino pump {pump_number} dispensed {volume} ml")
                message = f'Pump {pump_number} dispensed {volume} ml'
            else:
                logger.info(f"Arduino pump {pump_number} set to {mode}")
                message = f'Pump {pump_number} set to {mode}'
                
            return {
                'success': True,
                'message': message,
                'parameters': params
            }
        else:
            logger.error(f"Arduino pump control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"Arduino pump operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_arduino_temperature(
    base_number: int = 0,
    temperature: float = 25.0,
    mode: str = "set",
    **kwargs
) -> Dict[str, Any]:
    """
    Control temperature using Arduino-connected heater
    
    Args:
        base_number: Base plate number (0-1)
        temperature: Target temperature in °C
        mode: Temperature operation mode (set, get)
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'base_number': int(base_number),
            'temperature': float(temperature),
            'mode': str(mode).lower()
        }
        
        if mode == "get":
            operation = 'get_temperature'
        else:
            operation = 'set_temperature'
        
        result = hw_manager.execute_operation('arduino', operation, params)
        
        if result['success']:
            if mode == "get":
                temp_reading = result.get('result')
                logger.info(f"Arduino base {base_number} temperature: {temp_reading}°C")
                return {
                    'success': True,
                    'message': f'Base {base_number} temperature: {temp_reading}°C',
                    'temperature': temp_reading,
                    'parameters': params
                }
            else:
                logger.info(f"Arduino base {base_number} temperature set to {temperature}°C")
                return {
                    'success': True,
                    'message': f'Base {base_number} temperature set to {temperature}°C',
                    'parameters': params
                }
        else:
            logger.error(f"Arduino temperature control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"Arduino temperature operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_arduino_ultrasonic(
    base_number: int = 0,
    duration: int = 5000,
    mode: str = "timed",
    **kwargs
) -> Dict[str, Any]:
    """
    Control ultrasonic module via Arduino
    
    Args:
        base_number: Base plate number (0-1)
        duration: Sonication duration in ms
        mode: Ultrasonic operation mode (timed, on, off)
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'base_number': int(base_number),
            'duration': int(duration),
            'mode': str(mode).lower()
        }
        
        result = hw_manager.execute_operation('arduino', 'ultrasonic_control', params)
        
        if result['success']:
            if mode == "timed":
                duration_sec = duration / 1000
                logger.info(f"Arduino ultrasonic {base_number} activated for {duration_sec}s")
                message = f'Ultrasonic {base_number} activated for {duration_sec}s'
            else:
                logger.info(f"Arduino ultrasonic {base_number} set to {mode}")
                message = f'Ultrasonic {base_number} set to {mode}'
                
            return {
                'success': True,
                'message': message,
                'parameters': params
            }
        else:
            logger.error(f"Arduino ultrasonic control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"Arduino ultrasonic operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_arduino_furnace(
    action: str = "open",
    **kwargs
) -> Dict[str, Any]:
    """
    Control furnace open/close via Arduino
    
    Args:
        action: Furnace action (open, close)
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'action': str(action).lower()
        }
        
        result = hw_manager.execute_operation('arduino', 'furnace_control', params)
        
        if result['success']:
            logger.info(f"Arduino furnace {action}")
            return {
                'success': True,
                'message': f'Furnace {action}',
                'parameters': params
            }
        else:
            logger.error(f"Arduino furnace control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"Arduino furnace operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_arduino_electrode(
    mode: str = "3-electrode",
    **kwargs
) -> Dict[str, Any]:
    """
    Switch between 2-electrode and 3-electrode system
    
    Args:
        mode: Electrode system mode (2-electrode, 3-electrode)
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'mode': str(mode).lower()
        }
        
        result = hw_manager.execute_operation('arduino', 'electrode_switch', params)
        
        if result['success']:
            logger.info(f"Arduino electrode system set to {mode}")
            return {
                'success': True,
                'message': f'Electrode system set to {mode}',
                'parameters': params
            }
        else:
            logger.error(f"Arduino electrode switch failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"Arduino electrode operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_arduino_reactor(
    action: str = "open",
    **kwargs
) -> Dict[str, Any]:
    """
    Control actuated reactor open/close
    
    Args:
        action: Reactor action (open, close)
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'action': str(action).lower()
        }
        
        result = hw_manager.execute_operation('arduino', 'reactor_control', params)
        
        if result['success']:
            logger.info(f"Arduino reactor {action}")
            return {
                'success': True,
                'message': f'Reactor {action}',
                'parameters': params
            }
        else:
            logger.error(f"Arduino reactor control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"Arduino reactor operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def get_arduino_status(**kwargs) -> Dict[str, Any]:
    """
    Get current Arduino status
    
    Returns:
        Dictionary with current Arduino status
    """
    try:
        hw_manager = get_hardware_manager()
        status = hw_manager.get_hardware_status()
        
        return {
            'success': True,
            'status': status.get('arduino', {}),
            'message': 'Status retrieved successfully'
        }
        
    except Exception as e:
        logger.error(f"Failed to get Arduino status: {e}")
        return {
            'success': False,
            'error': str(e)
        }