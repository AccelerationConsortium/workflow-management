# Universal Robotic Arm UO Design

Abstract UO types for various robotic arm platforms. This is a key principle for building a scalable experimental automation system.

⸻

## ✅ 1. Motivation for Designing "Universal Robotic Arm UOs"

| Reason | Description |
|--------|-------------|
| Laboratories may have multiple robotic arm brands (UR, Dobot, Kinova, etc.) | Different hardware, but similar motion logic |
| Canvas needs unified scheduling and management of different hardware | Must abstract UOs from "functional behavior" perspective |
| Reduce coupling, facilitate future expansion or hardware replacement | Code-level adapter replacement, no need to change UI/UO structure |

⸻

## 🧩 2. Recommended Universal "Robotic Arm UO" Classification and Definition (Expandable)

| Universal UO Name | Function Description | UR / Dobot / Kinova Support | Notes |
|-------------------|---------------------|----------------------------|-------|
| RobotMoveTo | Move to specified coordinates, supports linear/joint modes | ✅ | Includes position, orientation, speed parameters |
| RobotPick | Grasping action, may include gripper control or suction | ✅ | Parameterized gripper types |
| RobotPlace | Placement action, gripper release | ✅ | Same as above |
| RobotHome | Return to home position | ✅ | Compatible with different home settings |
| RobotExecuteSequence | Execute predefined action sequence scripts | ✅ | Can reference external definitions |
| RobotWait / Sync | Wait for events or signals | ✅ | Can be used for synchronizing liquid handling, etc. |
| RobotIfCondition | Conditional judgment for subsequent branching (future expansion) | 🚧 | Requires hardware feedback mechanism |

⸻

## ✅ 3. Specific Design Recommendations (For Registration and Drag-and-Drop Interface)

Each "Universal Robotic Arm UO" component should include:

### Universal Fields:
- **robot_type** (UR3e / Dobot / Generic)
- **operation_type** (move/pick/place/home)
- **parameters** (coordinates, speed, action names, etc.)

### Internal Call Logic:
- Adapt specific brand commands through LCP (Lab Communication Protocol) or plugin backend

### Canvas Frontend Display:
- After dragging, display "action type + parameter input form"
- Backend automatically translates to specific device calls

⸻

## 🚀 Example: RobotMoveTo Canvas UO Schema

```json
{
  "uo_name": "RobotMoveTo",
  "description": "Move robotic arm to a specified position.",
  "category": "robotic-arm",
  "fields": [
    { "name": "x", "type": "number", "unit": "mm" },
    { "name": "y", "type": "number", "unit": "mm" },
    { "name": "z", "type": "number", "unit": "mm" },
    { "name": "rx", "type": "number", "unit": "deg" },
    { "name": "ry", "type": "number", "unit": "deg" },
    { "name": "rz", "type": "number", "unit": "deg" },
    { "name": "speed", "type": "number", "unit": "mm/s", "default": 100 },
    { "name": "robot_type", "type": "select", "options": ["UR3e", "Dobot", "Kinova"] }
  ]
}
```

If you decide to use the robot_type parameter, you can provide an adapter layer for the backend to translate commands for each robotic arm type.

⸻

## ✅ Summary and Recommendations

| Item | Recommendation |
|------|----------------|
| Should we use universal design? | ✅ Yes, recommend designing as "robotic-arm" class UOs |
| Should we create new components now? | ✅ Recommend starting with RobotMoveTo / RobotPick / RobotPlace |
| Naming convention | Use RobotXxx instead of UR3eXxx for unified namespace |
| Allow future expansion? | ✅ Can add RobotExecuteScript, RobotIfCondition, etc. later |
| Backend adaptation needed? | ✅ Backend needs to implement robot_type → device_adapter mapping |

⸻

## 🔧 Implementation Guidelines

### Frontend Implementation:
1. **UO Registration**: Register universal robotic UOs in the component library
2. **Parameter Forms**: Create dynamic forms based on robot_type selection
3. **Validation**: Implement parameter validation for different robot types
4. **Preview**: Show robot motion preview in Canvas

### Backend Implementation:
1. **Device Adapters**: Create adapter classes for each robot brand
2. **Command Translation**: Translate universal commands to device-specific protocols
3. **Error Handling**: Implement robust error handling and recovery
4. **Status Monitoring**: Real-time robot status and position feedback

### Configuration Management:
1. **Robot Profiles**: Store robot-specific configurations and capabilities
2. **Calibration Data**: Manage robot calibration and workspace definitions
3. **Safety Limits**: Define and enforce safety boundaries for each robot
4. **Communication Settings**: Configure connection parameters for different robots

⸻

## 🎯 Benefits of Universal Design

### For Users:
- **Consistent Interface**: Same UI for different robot brands
- **Easy Migration**: Switch between robot types without workflow changes
- **Reduced Learning Curve**: Learn once, use with any supported robot

### For Developers:
- **Code Reusability**: Single codebase supports multiple robot brands
- **Easier Maintenance**: Centralized logic for robotic operations
- **Extensibility**: Easy to add support for new robot brands

### For System Integration:
- **Scalability**: Support for heterogeneous robot environments
- **Flexibility**: Mix and match different robot types in workflows
- **Future-Proof**: Architecture ready for new robotic technologies

⸻

## 📋 Next Steps

1. **Phase 1**: Implement core UOs (RobotMoveTo, RobotPick, RobotPlace, RobotHome)
2. **Phase 2**: Add advanced UOs (RobotExecuteSequence, RobotWait)
3. **Phase 3**: Implement conditional logic (RobotIfCondition)
4. **Phase 4**: Add multi-robot coordination capabilities

This universal design approach ensures that the workflow management system can adapt to various robotic platforms while maintaining a consistent user experience and simplified development process.
