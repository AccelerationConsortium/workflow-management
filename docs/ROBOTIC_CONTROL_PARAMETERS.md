# Robotic Control Parameters - Complete Reference

## 🎯 Overview

This document provides a complete reference for all parameters in the 6 Robotic Control Unit Operations (UOs). All parameters are now properly defined in the backend JSON structure with complete metadata.

## 🤖 Robot Move To (`robot_move_to`)

**Complete Parameters:**
- `robotType` (string, required): Robot model selection (UR3e, Dobot, Kinova, Generic)
- `x` (number, required): Target X coordinate (-1000 to 1000 mm)
- `y` (number, required): Target Y coordinate (-1000 to 1000 mm) 
- `z` (number, required): Target Z coordinate (0 to 500 mm)
- `rx` (number, optional): X-axis rotation (-180 to 180 deg)
- `ry` (number, optional): Y-axis rotation (-180 to 180 deg)
- `rz` (number, optional): Z-axis rotation (-180 to 180 deg)
- `speed` (number, required): Movement speed (1 to 500 mm/s)
- `motionType` (string, required): Motion path type (linear/joint/circular)
- `acceleration` (number, optional): Movement acceleration (10 to 1000 mm/s²)
- `blendRadius` (number, optional): Path blending radius (0 to 50 mm)

## 🤏 Robot Pick (`robot_pick`)

**Complete Parameters:**
- `robotType` (string, required): Robot model selection
- `x` (number, required): Pick location X coordinate (-1000 to 1000 mm)
- `y` (number, required): Pick location Y coordinate (-1000 to 1000 mm)
- `z` (number, required): Pick location Z coordinate (0 to 500 mm)
- `objectId` (string, required): Identifier of object to pick
- `gripperType` (string, required): Type of gripper (mechanical/pneumatic/vacuum)
- `gripForce` (number, required): Gripping force (0.1 to 50 N)
- `approachHeight` (number, optional): Approach height above object (5 to 100 mm)
- `speed` (number, optional): Movement speed (1 to 200 mm/s)
- `verifyPick` (boolean, optional): Verify successful pick operation

## 🤲 Robot Place (`robot_place`)

**Complete Parameters:**
- `robotType` (string, required): Robot model selection
- `x` (number, required): Place location X coordinate (-1000 to 1000 mm)
- `y` (number, required): Place location Y coordinate (-1000 to 1000 mm)
- `z` (number, required): Place location Z coordinate (0 to 500 mm)
- `objectId` (string, required): Identifier of object to place
- `placementType` (string, required): Placement style (gentle/firm/precise)
- `releaseDelay` (number, optional): Delay before releasing (0 to 5 s)
- `approachHeight` (number, optional): Approach height (5 to 100 mm)
- `speed` (number, optional): Movement speed (1 to 200 mm/s)
- `verifyPlace` (boolean, optional): Verify successful placement

## 🏠 Robot Home (`robot_home`)

**Complete Parameters:**
- `robotType` (string, required): Robot model selection
- `speed` (number, required): Movement speed to home (1 to 500 mm/s)
- `safeMode` (boolean, optional): Use safe trajectory to avoid obstacles
- `waitAfter` (number, optional): Wait time after reaching home (0 to 10 s)
- `reason` (string, optional): Reason for returning to home position

## 🔄 Robot Execute Sequence (`robot_execute_sequence`)

**Complete Parameters:**
- `robotType` (string, required): Robot model selection
- `sequenceName` (string, required): Name of sequence to execute
- `sequenceFile` (string, optional): Path to sequence file
- `speed` (number, required): Execution speed multiplier (0.1 to 2.0x)
- `loops` (number, required): Number of repetitions (1 to 100)
- `abortOnError` (boolean, optional): Stop execution on error
- `timeoutS` (number, required): Maximum execution time (1 to 3600 s)

## ⏳ Robot Wait (`robot_wait`)

**Complete Parameters:**
- `robotType` (string, required): Robot model selection
- `duration` (number, required): Wait duration (0.1 to 300 s)
- `reason` (string, optional): Reason for waiting
- `skipable` (boolean, optional): Allow user to skip wait
- `showCountdown` (boolean, optional): Display countdown timer

## 🔧 Parameter Structure

Each parameter now includes:
- **Type**: Data type (string, number, boolean)
- **Label**: Human-readable name
- **Description**: Detailed explanation
- **Required**: Whether parameter is mandatory
- **Default**: Default value
- **Range**: Valid value range (for numbers)
- **Unit**: Measurement unit (mm, s, deg, etc.)

## 📊 JSON Output Structure

When a workflow containing robotic control nodes is saved, the JSON will now include:

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "robot_move_to",
      "data": {
        "robotType": "UR3e",
        "x": 100,
        "y": 200,
        "z": 150,
        "rx": 0,
        "ry": 0,
        "rz": 90,
        "speed": 100,
        "motionType": "linear",
        "acceleration": 100,
        "blendRadius": 5
      }
    }
  ]
}
```

## ✅ Verification Checklist

- [x] All 6 robotic control nodes updated
- [x] Parameter names match frontend components
- [x] Complete parameter definitions with metadata
- [x] Proper data types and validation ranges
- [x] Required/optional flags set correctly
- [x] Units and descriptions included
- [x] Default values specified

## 🚀 Benefits

1. **Complete JSON Export**: All parameters are now included in workflow JSON
2. **Consistent Naming**: Parameter names match between frontend and backend
3. **Proper Validation**: Range and type validation for all parameters
4. **Better Documentation**: Complete descriptions and units
5. **API Compatibility**: JSON structure ready for backend processing

## 🔮 Future Enhancements

- Parameter validation in UI
- Dynamic parameter loading from JSON schema
- Custom parameter sets for different robot types
- Parameter templates and presets
- Real-time parameter validation

---

**Status**: ✅ Complete - All robotic control nodes now have full parameter definitions in the backend JSON structure.
