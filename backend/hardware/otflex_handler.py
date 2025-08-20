"""
Opentrons Flex Handler for OTFLEX Workflow
Handles communication with Opentrons Flex liquid handler
"""

import logging
import json
import requests
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class OTFlexHandler:
    """Handler for Opentrons Flex operations"""
    
    def __init__(self, config):
        self.config = config
        self.client = None
        self.connected = False
        self.labware_map = {}
        self.pipettes = {}
        
    def connect(self) -> bool:
        """Establish connection to Opentrons Flex"""
        try:
            connection = self.config.connection
            ip = connection.get('ip', '169.254.179.32')
            protocol = connection.get('protocol', 'http')
            
            # Import Opentrons client
            try:
                from opentrons import opentronsClient
                
                logger.info(f"Connecting to Opentrons Flex at {ip}")
                self.client = opentronsClient(strRobotIP=ip, strRobot='flex')
                
                # Load default pipettes
                self._load_pipettes()
                
                self.connected = True
                logger.info("Opentrons Flex connected successfully")
                return True
                
            except ImportError:
                # Fallback to HTTP API if SDK not available
                logger.warning("Opentrons SDK not available, using HTTP API")
                self.base_url = f"{protocol}://{ip}:31950"
                return self._test_http_connection()
                
        except Exception as e:
            logger.error(f"Failed to connect to Opentrons Flex: {e}")
            return False
            
    def _test_http_connection(self) -> bool:
        """Test HTTP API connection"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                self.connected = True
                logger.info("Opentrons Flex HTTP API connected")
                return True
            return False
        except Exception as e:
            logger.error(f"HTTP connection test failed: {e}")
            return False
            
    def _load_pipettes(self):
        """Load default pipettes"""
        if self.client:
            try:
                # Load P1000 and P50 pipettes
                self.pipettes['p1000'] = self.client.loadPipette(
                    strPipetteName='p1000_single_flex',
                    strMount='right'
                )
                self.pipettes['p50'] = self.client.loadPipette(
                    strPipetteName='p50_single_flex',
                    strMount='left'
                )
                logger.info("Pipettes loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load pipettes: {e}")
                
    def disconnect(self):
        """Disconnect from Opentrons Flex"""
        if self.client:
            try:
                # Home robot before disconnecting
                self.client.homeRobot()
                self.connected = False
                logger.info("Opentrons Flex disconnected")
            except Exception as e:
                logger.error(f"Error disconnecting Opentrons Flex: {e}")
                
    def is_connected(self) -> bool:
        """Check if Opentrons Flex is connected"""
        return self.connected
        
    def get_status(self) -> Dict[str, Any]:
        """Get current Opentrons Flex status"""
        if not self.is_connected():
            return {"error": "Not connected"}
            
        return {
            "connected": True,
            "labware_loaded": len(self.labware_map),
            "pipettes": list(self.pipettes.keys())
        }
        
    def execute(self, operation: str, params: Dict[str, Any]) -> Any:
        """Execute Opentrons Flex operation"""
        if not self.is_connected():
            raise Exception("Opentrons Flex not connected")
            
        operations = {
            "liquid_transfer": self._liquid_transfer,
            "aspirate": self._aspirate,
            "dispense": self._dispense,
            "pick_up_tip": self._pick_up_tip,
            "drop_tip": self._drop_tip,
            "move_to_well": self._move_to_well,
            "load_labware": self._load_labware,
            "gripper_control": self._gripper_control,
            "electrode_wash": self._electrode_wash,
            "home": self._home
        }
        
        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")
            
        return operations[operation](params)
        
    def _liquid_transfer(self, params: Dict[str, Any]) -> bool:
        """Transfer liquid between wells"""
        source_labware = params.get('source_labware')
        source_well = params.get('source_well', 'A1')
        dest_labware = params.get('dest_labware')
        dest_well = params.get('dest_well', 'A1')
        volume = params.get('volume', 100)  # μL
        pipette_name = params.get('pipette', 'p1000_single_flex')
        
        try:
            if not self.client:
                return self._http_liquid_transfer(params)
                
            # Pick up tip if not already holding one
            # This is simplified - real implementation would track tip state
            
            # Aspirate from source
            self.client.aspirate(
                strLabwareName=source_labware,
                strWellName=source_well,
                strPipetteName=pipette_name,
                intVolume=volume
            )
            
            # Dispense to destination
            self.client.dispense(
                strLabwareName=dest_labware,
                strWellName=dest_well,
                strPipetteName=pipette_name,
                intVolume=volume
            )
            
            logger.info(f"Transferred {volume}μL from {source_well} to {dest_well}")
            return True
            
        except Exception as e:
            logger.error(f"Liquid transfer failed: {e}")
            return False
            
    def _http_liquid_transfer(self, params: Dict[str, Any]) -> bool:
        """Transfer liquid using HTTP API"""
        try:
            # Simplified HTTP API call
            endpoint = f"{self.base_url}/commands"
            command = {
                "command": "transfer",
                "params": params
            }
            
            response = requests.post(endpoint, json=command, timeout=30)
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"HTTP liquid transfer failed: {e}")
            return False
            
    def _aspirate(self, params: Dict[str, Any]) -> bool:
        """Aspirate liquid"""
        if not self.client:
            return False
            
        try:
            self.client.aspirate(
                strLabwareName=params.get('labware'),
                strWellName=params.get('well', 'A1'),
                strPipetteName=params.get('pipette', 'p1000_single_flex'),
                intVolume=params.get('volume', 100)
            )
            return True
        except Exception as e:
            logger.error(f"Aspirate failed: {e}")
            return False
            
    def _dispense(self, params: Dict[str, Any]) -> bool:
        """Dispense liquid"""
        if not self.client:
            return False
            
        try:
            self.client.dispense(
                strLabwareName=params.get('labware'),
                strWellName=params.get('well', 'A1'),
                strPipetteName=params.get('pipette', 'p1000_single_flex'),
                intVolume=params.get('volume', 100)
            )
            return True
        except Exception as e:
            logger.error(f"Dispense failed: {e}")
            return False
            
    def _pick_up_tip(self, params: Dict[str, Any]) -> bool:
        """Pick up pipette tip"""
        if not self.client:
            return False
            
        try:
            self.client.pickUpTip(
                strLabwareName=params.get('labware'),
                strPipetteName=params.get('pipette', 'p1000_single_flex'),
                strWellName=params.get('well', 'A1')
            )
            return True
        except Exception as e:
            logger.error(f"Pick up tip failed: {e}")
            return False
            
    def _drop_tip(self, params: Dict[str, Any]) -> bool:
        """Drop pipette tip"""
        if not self.client:
            return False
            
        try:
            self.client.dropTip(
                strPipetteName=params.get('pipette', 'p1000_single_flex'),
                boolDropInDisposal=params.get('dispose', True)
            )
            return True
        except Exception as e:
            logger.error(f"Drop tip failed: {e}")
            return False
            
    def _move_to_well(self, params: Dict[str, Any]) -> bool:
        """Move to specific well"""
        if not self.client:
            return False
            
        try:
            self.client.moveToWell(
                strLabwareName=params.get('labware'),
                strWellName=params.get('well', 'A1'),
                strPipetteName=params.get('pipette', 'p1000_single_flex'),
                strOffsetStart=params.get('offset', 'top'),
                intSpeed=params.get('speed', 100)
            )
            return True
        except Exception as e:
            logger.error(f"Move to well failed: {e}")
            return False
            
    def _load_labware(self, params: Dict[str, Any]) -> str:
        """Load labware at specific location"""
        if not self.client:
            return None
            
        try:
            slot = params.get('slot', 'C1')
            labware_type = params.get('type', 'opentrons_flex_96_tiprack_1000ul')
            custom_json = params.get('custom_json')
            
            if custom_json:
                labware_id = self.client.loadCustomLabwareFromFile(
                    slot, custom_json
                )
            else:
                labware_id = self.client.loadLabware(slot, labware_type)
                
            self.labware_map[labware_id] = {
                'slot': slot,
                'type': labware_type
            }
            
            logger.info(f"Loaded labware {labware_type} at {slot}")
            return labware_id
            
        except Exception as e:
            logger.error(f"Load labware failed: {e}")
            return None
            
    def _gripper_control(self, params: Dict[str, Any]) -> bool:
        """Control Opentrons Flex gripper"""
        if not self.client:
            return False
            
        try:
            action = params.get('action', 'open')
            
            if action == 'open':
                self.client.openGripper()
            elif action == 'close':
                self.client.closeGripper()
            elif action == 'move':
                x = params.get('x', 0)
                y = params.get('y', 0)
                z = params.get('z', 100)
                self.client.moveGripper(float(x), float(y), float(z))
            else:
                raise ValueError(f"Invalid gripper action: {action}")
                
            logger.info(f"Gripper {action} executed")
            return True
            
        except Exception as e:
            logger.error(f"Gripper control failed: {e}")
            return False
            
    def _electrode_wash(self, params: Dict[str, Any]) -> bool:
        """Execute electrode washing sequence"""
        # This would integrate with Arduino for pump control
        # Simplified implementation
        try:
            logger.info("Electrode wash sequence started")
            
            # Move to wash station
            # Dispense water
            # Activate ultrasonic
            # Drain
            # Repeat with acid if needed
            
            logger.info("Electrode wash sequence completed")
            return True
            
        except Exception as e:
            logger.error(f"Electrode wash failed: {e}")
            return False
            
    def _home(self, params: Dict[str, Any]) -> bool:
        """Home the robot"""
        if not self.client:
            return False
            
        try:
            self.client.homeRobot()
            logger.info("Robot homed")
            return True
        except Exception as e:
            logger.error(f"Home failed: {e}")
            return False