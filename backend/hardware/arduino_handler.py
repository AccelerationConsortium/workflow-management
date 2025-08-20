"""
Arduino Controller Handler for OTFLEX Workflow
Handles communication with Arduino for pumps, temperature, ultrasonic, etc.
"""

import logging
import time
import serial
import serial.tools.list_ports
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

class ArduinoException(Exception):
    pass

class ArduinoTimeout(Exception):
    pass

class ArduinoHandler:
    """Handler for Arduino-based control operations"""
    
    def __init__(self, config):
        self.config = config
        self.connection = None
        self.connected = False
        self.pump_calibration = {}
        self.heater_setpoints = [25.0, 25.0]
        self._load_calibration()
        
    def _load_calibration(self):
        """Load pump calibration data from config"""
        calibration = self.config.calibration
        if calibration and 'pumps' in calibration:
            self.pump_calibration = calibration['pumps']
            logger.info(f"Loaded calibration for {len(self.pump_calibration)} pumps")
            
    def connect(self) -> bool:
        """Establish connection to Arduino"""
        try:
            connection_config = self.config.connection
            port = self._find_arduino_port(connection_config.get('port', 'COM4'))
            baudrate = connection_config.get('baudrate', 115200)
            timeout = connection_config.get('timeout', 300)
            
            logger.info(f"Connecting to Arduino on {port} at {baudrate} baud")
            self.connection = serial.Serial(
                port=port,
                baudrate=baudrate,
                timeout=timeout
            )
            time.sleep(3)  # Arduino boot time
            
            self.connected = True
            logger.info("Arduino connected successfully")
            
            # Restore heater setpoints if needed
            for i, temp in enumerate(self.heater_setpoints):
                if temp != 25.0:
                    self._set_temperature({'base_number': i, 'temperature': temp})
                    
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Arduino: {e}")
            return False
            
    def _find_arduino_port(self, default_port: str) -> str:
        """Find Arduino port automatically or use default"""
        try:
            ports = list(serial.tools.list_ports.comports())
            arduino_ports = [p.device for p in ports if 'Arduino' in p.description or 'CH340' in p.description]
            
            if arduino_ports:
                logger.info(f"Found Arduino on port: {arduino_ports[0]}")
                return arduino_ports[0]
                
            logger.warning(f"Arduino not auto-detected, using default: {default_port}")
            return default_port
            
        except Exception as e:
            logger.error(f"Error finding Arduino port: {e}")
            return default_port
            
    def disconnect(self):
        """Disconnect from Arduino"""
        if self.connection:
            try:
                self.connection.close()
                self.connected = False
                logger.info("Arduino disconnected")
            except Exception as e:
                logger.error(f"Error disconnecting Arduino: {e}")
                
    def is_connected(self) -> bool:
        """Check if Arduino is connected"""
        return self.connected and self.connection and self.connection.is_open
        
    def get_status(self) -> Dict[str, Any]:
        """Get current Arduino status"""
        if not self.is_connected():
            return {"error": "Not connected"}
            
        return {
            "connected": True,
            "port": self.connection.port,
            "heater_setpoints": self.heater_setpoints
        }
        
    def execute(self, operation: str, params: Dict[str, Any]) -> Any:
        """Execute Arduino operation"""
        if not self.is_connected():
            raise Exception("Arduino not connected")
            
        operations = {
            "pump_control": self._pump_control,
            "pump_dispense": self._pump_dispense,
            "set_temperature": self._set_temperature,
            "get_temperature": self._get_temperature,
            "ultrasonic_control": self._ultrasonic_control,
            "furnace_control": self._furnace_control,
            "electrode_switch": self._electrode_switch,
            "reactor_control": self._reactor_control
        }
        
        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")
            
        return operations[operation](params)
        
    def _send_command(self, command: str) -> List[str]:
        """Send command to Arduino and get response"""
        if not self.connection:
            raise ArduinoException("No connection")
            
        self.connection.write(f"{command}\n".encode())
        return self._get_response()
        
    def _get_response(self, timeout: float = 3.0) -> List[str]:
        """Get response from Arduino"""
        return_data = []
        line = b""
        start_time = time.time()
        
        while (time.time() - start_time < timeout):
            if self.connection.in_waiting > 0:
                line += self.connection.read()
                if line.endswith(b'\r\n'):
                    line_str = line.decode().strip()
                    line = b''
                    if line_str == "0":
                        return return_data
                    elif line_str == "1":
                        raise ArduinoException("Arduino function received bad arguments")
                    else:
                        return_data.append(line_str)
                        
        raise ArduinoTimeout("Arduino response timed out")
        
    def _pump_control(self, params: Dict[str, Any]) -> bool:
        """Control pump on/off state"""
        pump_number = params.get('pump_number', 0)
        mode = params.get('mode', 'off')
        
        try:
            if mode == 'on':
                self._send_command(f"set_pump_on {pump_number}")
            elif mode == 'off':
                self._send_command(f"set_pump_off {pump_number}")
            else:
                raise ValueError(f"Invalid pump mode: {mode}")
                
            logger.info(f"Pump {pump_number} set to {mode}")
            return True
            
        except Exception as e:
            logger.error(f"Pump control failed: {e}")
            return False
            
    def _pump_dispense(self, params: Dict[str, Any]) -> bool:
        """Dispense specific volume using pump"""
        pump_number = params.get('pump_number', 0)
        volume = params.get('volume', 1.0)  # ml
        
        if str(pump_number) not in self.pump_calibration:
            logger.warning(f"No calibration for pump {pump_number}, using default")
            slope = 1.6  # Default slope
        else:
            calib = self.pump_calibration[str(pump_number)]
            slope = calib.get('slope', 1.6)
            
        # Calculate time needed for volume
        time_ms = int(volume / slope * 1000)
        
        try:
            self._send_command(f"set_pump_on_time {pump_number} {time_ms}")
            logger.info(f"Pump {pump_number} dispensed {volume} ml")
            return True
            
        except Exception as e:
            logger.error(f"Pump dispense failed: {e}")
            return False
            
    def _set_temperature(self, params: Dict[str, Any]) -> bool:
        """Set temperature for base plate"""
        base_number = params.get('base_number', 0)
        temperature = round(params.get('temperature', 25.0), 1)
        
        try:
            self._send_command(f"set_base_temp {base_number} {temperature}")
            
            # Update stored setpoint
            if base_number < len(self.heater_setpoints):
                self.heater_setpoints[base_number] = temperature
                
            logger.info(f"Base {base_number} temperature set to {temperature}°C")
            return True
            
        except Exception as e:
            logger.error(f"Set temperature failed: {e}")
            return False
            
    def _get_temperature(self, params: Dict[str, Any]) -> Optional[float]:
        """Get temperature from base plate"""
        base_number = params.get('base_number', 0)
        
        try:
            response = self._send_command(f"get_base_temp {base_number}")
            if response:
                temperature = float(response[0])
                logger.info(f"Base {base_number} temperature: {temperature}°C")
                return temperature
            return None
            
        except Exception as e:
            logger.error(f"Get temperature failed: {e}")
            return None
            
    def _ultrasonic_control(self, params: Dict[str, Any]) -> bool:
        """Control ultrasonic module"""
        base_number = params.get('base_number', 0)
        mode = params.get('mode', 'timed')
        duration = params.get('duration', 5000)  # ms
        
        try:
            if mode == 'timed':
                self._send_command(f"set_ultrasonic_on_time {base_number} {duration}")
            elif mode == 'on':
                self._send_command(f"set_ultrasonic_on {base_number}")
            elif mode == 'off':
                self._send_command(f"set_ultrasonic_off {base_number}")
            else:
                raise ValueError(f"Invalid ultrasonic mode: {mode}")
                
            logger.info(f"Ultrasonic {base_number} {mode} for {duration}ms")
            return True
            
        except Exception as e:
            logger.error(f"Ultrasonic control failed: {e}")
            return False
            
    def _furnace_control(self, params: Dict[str, Any]) -> bool:
        """Control furnace open/close"""
        action = params.get('action', 'open')
        
        try:
            if action == 'open':
                self._send_command("set_furnace_open")
            elif action == 'close':
                self._send_command("set_furnace_close")
            else:
                raise ValueError(f"Invalid furnace action: {action}")
                
            logger.info(f"Furnace {action}")
            return True
            
        except Exception as e:
            logger.error(f"Furnace control failed: {e}")
            return False
            
    def _electrode_switch(self, params: Dict[str, Any]) -> bool:
        """Switch electrode system mode"""
        mode = params.get('mode', '3-electrode')
        
        try:
            if mode == '2-electrode':
                self._send_command("switch_2Electrode")
            elif mode == '3-electrode':
                self._send_command("switch_3Electrode")
            else:
                raise ValueError(f"Invalid electrode mode: {mode}")
                
            logger.info(f"Electrode system set to {mode}")
            return True
            
        except Exception as e:
            logger.error(f"Electrode switch failed: {e}")
            return False
            
    def _reactor_control(self, params: Dict[str, Any]) -> bool:
        """Control actuated reactor"""
        action = params.get('action', 'open')
        
        try:
            if action == 'open':
                self._send_command("set_reactor_on")
            elif action == 'close':
                self._send_command("set_reactor_off")
            else:
                raise ValueError(f"Invalid reactor action: {action}")
                
            logger.info(f"Reactor {action}")
            return True
            
        except Exception as e:
            logger.error(f"Reactor control failed: {e}")
            return False