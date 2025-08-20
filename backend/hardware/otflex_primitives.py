"""
Opentrons Flex Primitive Functions for SDL Catalyst Integration
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

def execute_otflex_liquid_transfer(
    source_labware: str = "source_plate",
    source_well: str = "A1",
    dest_labware: str = "dest_plate",
    dest_well: str = "A1",
    volume: int = 100,
    pipette: str = "p1000_single_flex",
    speed: int = 100,
    mix_before: bool = False,
    mix_after: bool = False,
    **kwargs
) -> Dict[str, Any]:
    """
    Transfer liquid using Opentrons Flex
    
    Args:
        source_labware: Source labware name
        source_well: Source well location
        dest_labware: Destination labware name
        dest_well: Destination well location
        volume: Transfer volume in μL
        pipette: Pipette to use
        speed: Movement speed in mm/s
        mix_before: Mix before aspiration
        mix_after: Mix after dispensing
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'source_labware': str(source_labware),
            'source_well': str(source_well),
            'dest_labware': str(dest_labware),
            'dest_well': str(dest_well),
            'volume': int(volume),
            'pipette': str(pipette),
            'speed': int(speed),
            'mix_before': bool(mix_before),
            'mix_after': bool(mix_after)
        }
        
        result = hw_manager.execute_operation('otflex', 'liquid_transfer', params)
        
        if result['success']:
            logger.info(f"OTFlex transferred {volume}μL from {source_well} to {dest_well}")
            return {
                'success': True,
                'message': f'Transferred {volume}μL from {source_well} to {dest_well}',
                'parameters': params
            }
        else:
            logger.error(f"OTFlex liquid transfer failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"OTFlex liquid transfer failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_otflex_electrode_wash(
    wash_station: str = "wash_station",
    wash_well: str = "A1",
    water_volume: float = 15,
    acid_volume: float = 10,
    sonication_time: int = 30,
    cycles: int = 1,
    **kwargs
) -> Dict[str, Any]:
    """
    Automated electrode washing sequence
    
    Args:
        wash_station: Wash station labware name
        wash_well: Wash well location
        water_volume: Water volume for washing in ml
        acid_volume: Acid volume for washing in ml
        sonication_time: Sonication duration in seconds
        cycles: Number of wash cycles
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'wash_station': str(wash_station),
            'wash_well': str(wash_well),
            'water_volume': float(water_volume),
            'acid_volume': float(acid_volume),
            'sonication_time': int(sonication_time),
            'cycles': int(cycles)
        }
        
        result = hw_manager.execute_operation('otflex', 'electrode_wash', params)
        
        if result['success']:
            logger.info(f"OTFlex electrode wash completed ({cycles} cycles)")
            return {
                'success': True,
                'message': f'Electrode wash completed ({cycles} cycles)',
                'parameters': params
            }
        else:
            logger.error(f"OTFlex electrode wash failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"OTFlex electrode wash failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_otflex_gripper(
    action: str = "move",
    x: float = 0,
    y: float = 0,
    z: float = 100,
    labware: str = "",
    **kwargs
) -> Dict[str, Any]:
    """
    Control Opentrons Flex gripper for plate handling
    
    Args:
        action: Gripper action (move, pick, place, open, close)
        x: X coordinate in mm
        y: Y coordinate in mm
        z: Z coordinate in mm
        labware: Target labware for pick/place operations
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'action': str(action).lower(),
            'x': float(x),
            'y': float(y),
            'z': float(z),
            'labware': str(labware)
        }
        
        result = hw_manager.execute_operation('otflex', 'gripper_control', params)
        
        if result['success']:
            if action == "move":
                logger.info(f"OTFlex gripper moved to ({x}, {y}, {z})")
                message = f'Gripper moved to ({x}, {y}, {z})'
            elif action in ["pick", "place"]:
                logger.info(f"OTFlex gripper {action} operation on {labware}")
                message = f'Gripper {action} operation completed'
            else:
                logger.info(f"OTFlex gripper {action}")
                message = f'Gripper {action}'
                
            return {
                'success': True,
                'message': message,
                'parameters': params
            }
        else:
            logger.error(f"OTFlex gripper control failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"OTFlex gripper operation failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_otflex_aspirate(
    labware: str = "plate",
    well: str = "A1",
    volume: int = 100,
    pipette: str = "p1000_single_flex",
    **kwargs
) -> Dict[str, Any]:
    """
    Aspirate liquid with Opentrons Flex
    
    Args:
        labware: Labware name
        well: Well location
        volume: Volume to aspirate in μL
        pipette: Pipette to use
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'labware': str(labware),
            'well': str(well),
            'volume': int(volume),
            'pipette': str(pipette)
        }
        
        result = hw_manager.execute_operation('otflex', 'aspirate', params)
        
        if result['success']:
            logger.info(f"OTFlex aspirated {volume}μL from {well}")
            return {
                'success': True,
                'message': f'Aspirated {volume}μL from {well}',
                'parameters': params
            }
        else:
            logger.error(f"OTFlex aspirate failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"OTFlex aspirate failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_otflex_dispense(
    labware: str = "plate",
    well: str = "A1",
    volume: int = 100,
    pipette: str = "p1000_single_flex",
    **kwargs
) -> Dict[str, Any]:
    """
    Dispense liquid with Opentrons Flex
    
    Args:
        labware: Labware name
        well: Well location
        volume: Volume to dispense in μL
        pipette: Pipette to use
        
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        params = {
            'labware': str(labware),
            'well': str(well),
            'volume': int(volume),
            'pipette': str(pipette)
        }
        
        result = hw_manager.execute_operation('otflex', 'dispense', params)
        
        if result['success']:
            logger.info(f"OTFlex dispensed {volume}μL to {well}")
            return {
                'success': True,
                'message': f'Dispensed {volume}μL to {well}',
                'parameters': params
            }
        else:
            logger.error(f"OTFlex dispense failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error'),
                'parameters': params
            }
            
    except Exception as e:
        logger.error(f"OTFlex dispense failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': locals()
        }

def execute_otflex_home(**kwargs) -> Dict[str, Any]:
    """
    Home the Opentrons Flex robot
    
    Returns:
        Dictionary with execution result
    """
    try:
        hw_manager = get_hardware_manager()
        
        result = hw_manager.execute_operation('otflex', 'home', {})
        
        if result['success']:
            logger.info("OTFlex robot homed")
            return {
                'success': True,
                'message': 'Robot homed successfully'
            }
        else:
            logger.error(f"OTFlex home failed: {result.get('error')}")
            return {
                'success': False,
                'error': result.get('error', 'Unknown error')
            }
            
    except Exception as e:
        logger.error(f"OTFlex home failed: {e}")
        return {
            'success': False,
            'error': str(e)
        }

def get_otflex_status(**kwargs) -> Dict[str, Any]:
    """
    Get current Opentrons Flex status
    
    Returns:
        Dictionary with current status
    """
    try:
        hw_manager = get_hardware_manager()
        status = hw_manager.get_hardware_status()
        
        return {
            'success': True,
            'status': status.get('otflex', {}),
            'message': 'Status retrieved successfully'
        }
        
    except Exception as e:
        logger.error(f"Failed to get OTFlex status: {e}")
        return {
            'success': False,
            'error': str(e)
        }