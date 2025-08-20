# OTFLEX Workflow Integration Guide

## Overview

This document describes the integration of OTFLEX workflow components (MyxArm robot, Arduino controller, and Opentrons Flex) into the existing workflow management system.

## Architecture

The integration follows a modular, hardware-abstraction approach that maintains consistency with the existing SDL Catalyst framework.

### Components Added

#### 1. Hardware Configuration (`backend/config/hardware_config.json`)
- **MyxArm**: UFactory xArm 6 robot configuration with TCP/IP connection
- **Arduino**: Serial controller for pumps, temperature, ultrasonic, furnace
- **Opentrons Flex**: Liquid handling system with HTTP/SDK integration
- **Calibration**: Pump flow rate calibrations for accurate liquid dispensing

#### 2. Hardware Abstraction Layer (`backend/hardware/`)
- **HardwareManager**: Central coordination of all hardware systems
- **MyxArmHandler**: Robot arm control with position, angle, and gripper operations
- **ArduinoHandler**: Serial communication for pumps, heaters, ultrasonic modules
- **OTFlexHandler**: Liquid handling operations with pipette and gripper control

#### 3. Unit Operation Templates (Updated `uo_templates.json`)
New operation types added:
- **MyxArm Operations**: `myxarm_move_position`, `myxarm_move_angles`, `myxarm_gripper`
- **Arduino Operations**: `arduino_pump`, `arduino_temperature`, `arduino_ultrasonic`, `arduino_furnace`, `arduino_electrode`, `arduino_reactor`
- **OTFlex Operations**: `otflex_liquid_transfer`, `otflex_electrode_wash`, `otflex_gripper`

#### 4. Frontend Components (`src/components/OperationNodes/`)
- **MyxArmNode.tsx**: Robot arm operation visualization
- **ArduinoControlNode.tsx**: Arduino control operations display
- **OTFlexNode.tsx**: Opentrons Flex operation interface

#### 5. Backend Primitive Functions (`backend/hardware/*_primitives.py`)
- **MyxArm Primitives**: Position control, angle control, gripper operations
- **Arduino Primitives**: Pump control, temperature management, ultrasonic activation
- **OTFlex Primitives**: Liquid transfer, electrode washing, gripper control

## Hardware Setup Requirements

### MyxArm Robot
- **Model**: UFactory xArm 6
- **Connection**: TCP/IP (default: 192.168.1.233)
- **Requirements**: xArm Python SDK (`pip install xarm-python-sdk`)

### Arduino Controller
- **Connection**: Serial USB (COM4 or auto-detect)
- **Baud Rate**: 115200
- **Capabilities**: 6 pumps, 2 heaters, 2 ultrasonic modules, furnace, electrode switch
- **Calibration**: Pump flow rates configured per pump

### Opentrons Flex
- **Connection**: HTTP API (default: 169.254.179.32)
- **Pipettes**: P1000 Single Flex (right), P50 Single Flex (left)
- **Requirements**: Opentrons SDK (optional, falls back to HTTP API)

## Usage Examples

### Creating a Workflow

1. **Robot Movement**:
   - Add "MyxArm Move Position" node
   - Set X, Y, Z coordinates
   - Configure speed and acceleration

2. **Liquid Handling**:
   - Add "Arduino Pump" node for precise dispensing
   - Add "OTFlex Transfer" node for complex pipetting
   - Configure volumes and labware locations

3. **Temperature Control**:
   - Add "Arduino Temperature" node
   - Set base plate number and target temperature
   - Monitor temperature with get mode

4. **Electrode Processing**:
   - Add "OTFlex Electrode Wash" node
   - Configure wash cycles and volumes
   - Include ultrasonic cleaning steps

### Node Configuration

Each hardware operation node provides:
- **Parameter Validation**: Range checking and type validation
- **Visual Feedback**: Real-time parameter display and status
- **Error Handling**: Clear error messages and recovery suggestions
- **Integration**: Seamless connection with existing workflow nodes

## Safety Features

### Hardware Safety
- **Connection Monitoring**: Automatic detection of hardware disconnections
- **Error Recovery**: Graceful handling of communication failures
- **Emergency Stop**: Immediate halt capabilities for all hardware
- **State Validation**: Verification of robot and equipment states before operations

### Software Safety
- **Parameter Validation**: Input validation with safe ranges
- **Timeout Handling**: Automatic timeout for long-running operations
- **Status Checking**: Continuous monitoring of hardware status
- **Logging**: Comprehensive logging for debugging and audit trails

## Integration Points

### Existing System Compatibility
- **SDL Catalyst Framework**: Full compatibility with existing operation nodes
- **Unit Operation System**: Seamless integration with UO templates and mappings
- **Frontend Architecture**: Consistent with existing React component structure
- **Backend API**: Compatible with current workflow execution engine

### Data Flow
```
Frontend Node → Backend API → Hardware Manager → Hardware Handler → Physical Device
     ↑              ↑              ↑                 ↑                    ↓
Status Display ← Response ← Operation Result ← Device Response ← Device Action
```

## Troubleshooting

### Common Issues

1. **Hardware Connection Failures**:
   - Check IP addresses and ports
   - Verify serial port availability
   - Ensure hardware power and network connectivity

2. **Calibration Issues**:
   - Verify pump calibration values in hardware_config.json
   - Run calibration procedures for new pumps
   - Check flow rate measurements

3. **Operation Timeouts**:
   - Increase timeout values for slow operations
   - Check hardware response times
   - Verify command syntax and parameters

### Debug Mode
Enable detailed logging by setting log level to DEBUG:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

### Planned Features
- **Advanced Calibration**: Automated calibration procedures
- **Batch Operations**: Multi-sample processing workflows
- **Real-time Monitoring**: Live hardware status dashboard
- **Recipe Management**: Predefined operation sequences
- **Safety Interlocks**: Advanced safety checking and validation

### Scalability
- **Multi-Robot Support**: Support for multiple MyxArm units
- **Hardware Abstraction**: Easy addition of new hardware types
- **Cloud Integration**: Remote monitoring and control capabilities
- **AI Integration**: Automated optimization and learning

## API Reference

### Hardware Manager Methods
- `initialize_hardware(hardware_type)`: Connect to specific hardware
- `execute_operation(hardware_type, operation, params)`: Run hardware operation
- `get_hardware_status()`: Get status of all connected hardware
- `disconnect_all()`: Safely disconnect all hardware

### Operation Categories
- **Movement**: Robot positioning and gripper control
- **Liquid Handling**: Pumps, pipettes, and transfers
- **Environmental**: Temperature, ultrasonic, furnace control
- **Electrochemical**: Electrode switching and washing

This integration provides a robust foundation for automated laboratory workflows combining robotic manipulation, precise liquid handling, and environmental control within the existing SDL Catalyst framework.