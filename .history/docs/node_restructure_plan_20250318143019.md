# Operation Nodes Restructuring Plan

## Current Structure
Currently, operation nodes are defined in two main files:
- `src/components/OperationNodes/index.tsx`: Node UI components
- `src/data/operationNodes.ts`: Node data definitions

## New Structure
We will reorganize the nodes into a more modular structure:

```
src/
  components/
    OperationNodes/
      Test/                      # Test category nodes
        PumpControl/             # Each node in its own directory
          index.tsx             # Node component
          types.ts             # Type definitions
          constants.ts         # Constants
          styles.css          # Styles
        ValveControl/
          index.tsx
          types.ts
          constants.ts
          styles.css
        HotplateControl/
          index.tsx
          types.ts
          constants.ts
          styles.css
        BalanceControl/
          index.tsx
          types.ts
          constants.ts
          styles.css
        WebcamControl/
          index.tsx
          types.ts
          constants.ts
          styles.css
      index.tsx                # Exports all nodes
```

## Implementation Steps

1. Create Directory Structure
   - Create main Test directory
   - Create subdirectories for each node
   - Create necessary files in each node directory

2. Create Node Components
   - Implement each device control node:
     - PumpControl: Liquid transfer control
     - ValveControl: Liquid path control
     - HotplateControl: Temperature control
     - BalanceControl: Weight measurement
     - WebcamControl: Process monitoring

3. Node Implementation Details
   Each node will include:
   - Component definition (index.tsx)
   - Type definitions (types.ts)
   - Constants like default values (constants.ts)
   - Styles (styles.css)

4. Update Main Index
   - Modify main index.tsx to export new node components
   - Ensure backward compatibility with existing code

## Node Specifications

### PumpControl
- Purpose: Liquid transfer control
- Key parameters:
  - Flow rate (mL/min)
  - Duration (seconds)
  - Direction (forward/reverse)

### ValveControl
- Purpose: Liquid path control
- Key parameters:
  - Valve position (open/closed)
  - Port selection (if multi-port)
  - Switching time

### HotplateControl
- Purpose: Temperature control
- Key parameters:
  - Temperature (°C)
  - Stirring speed (RPM)
  - Heating time

### BalanceControl
- Purpose: Weight measurement
- Key parameters:
  - Measurement mode
  - Stability criteria
  - Tare function

### WebcamControl
- Purpose: Process monitoring
- Key parameters:
  - Frame rate
  - Resolution
  - Recording duration

## Migration Notes
- Existing test nodes will be preserved
- New nodes will follow the same interface pattern
- Each node will maintain its own state and logic
- Common functionality will be shared through base components

## Documentation Requirements
- Each node should include:
  - Usage examples
  - Parameter descriptions
  - Hardware requirements
  - Error handling procedures 
