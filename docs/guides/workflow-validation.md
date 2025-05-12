# Workflow Validation System Documentation

## Overview
This document tracks the development and functionality of the workflow validation system. The validation system ensures the correctness and reliability of workflows before execution.

## Validation Levels

### 1. Basic Validation
- DAG Structure Validation ✅
  - Cycle detection ✅
  - Isolated node detection ✅
  - Start/end node validation ✅
- Connection Validation ✅
  - Port type compatibility ✅
  - Required connection completeness ✅
  - Multiple connection rules ✅
- Parameter Validation ✅
  - Required parameter presence ✅
  - Parameter type checking ✅
  - Parameter range validation ✅

### 2. Device-Specific Validation
- Device Status Validation
  - Online/availability status
  - Operation mode verification
- Device Parameter Validation
  - Device-specific parameter ranges
  - Parameter combination rules
- Operation Sequence Validation
  - Operation order logic
  - Timing constraint verification

### 3. Data Flow Validation
- Data Type Compatibility
- Data Format Validation
- Data Dependency Validation

## Implementation Details

### DAG Structure Validation (Implemented)

The DAG Structure Validator (`DAGValidator`) implements three main validation checks:

1. **Cycle Detection**
   - Uses Depth-First Search (DFS) algorithm
   - Maintains visited and recursion stacks
   - Reports detailed cycle path in error message
   - Time Complexity: O(V + E) where V is number of nodes and E is number of edges

2. **Isolated Node Detection**
   - Identifies nodes with no connections
   - Collects all connected nodes and compares with total nodes
   - Reports node label/ID in error message
   - Time Complexity: O(E + V)

3. **Start/End Node Validation**
   - Verifies presence of start nodes (no incoming connections)
   - Verifies presence of end nodes (no outgoing connections)
   - Time Complexity: O(E + V)

### Connection Validation (Implemented)

The Connection Validator (`ConnectionValidator`) implements three main validation checks:

1. **Port Type Compatibility**
   - Validates that connected ports have compatible types
   - Supports basic type matching
   - Extensible for complex type compatibility rules
   - Time Complexity: O(E) where E is number of connections

2. **Required Connection Validation**
   - Ensures all required ports are connected
   - Checks both input and output required ports
   - Reports missing connections with node and port details
   - Time Complexity: O(N * P) where N is number of nodes and P is average ports per node

3. **Multiple Connection Rules**
   - Validates ports' multiple connection constraints
   - Ensures single-connection ports have only one connection
   - Reports violation details including all conflicting connections
   - Time Complexity: O(N * P * E)

Example Usage:
```typescript
const validator = new ConnectionValidator();
const result = validator.validate({
  workflow,
  nodes,
  connections
});

if (!result.isValid) {
  console.error('Connection validation errors:', result.errors);
}
```

Error Types:
- `INVALID_CONNECTION`: Port type mismatch or multiple connection rule violation
- `MISSING_REQUIRED_CONNECTION`: Required port is not connected

### Parameter Validation (Implemented)

The Parameter Validator (`ParameterValidator`) implements three main validation checks:

1. **Required Parameter Validation**
   - Ensures all required parameters have values
   - Checks for undefined, null, or empty values
   - Reports missing required parameters
   - Time Complexity: O(P) where P is number of parameters

2. **Parameter Type Validation**
   - Validates parameter value types against definitions
   - Supports basic types: string, number, boolean, array, object
   - Special handling for numeric types (integer vs float)
   - Time Complexity: O(P)

3. **Parameter Range/Format Validation**
   - Numeric range validation (min/max)
   - String pattern matching
   - Enum value validation
   - Time Complexity: O(P)

Example Usage:
```typescript
const validator = new ParameterValidator();
const result = validator.validate({
  workflow,
  nodes,
  connections
});

if (!result.isValid) {
  console.error('Parameter validation errors:', result.errors);
}
```

Error Types:
- `MISSING_REQUIRED_PARAMETER`: Required parameter is not provided
- `INVALID_PARAMETER`: Parameter value is of wrong type or out of range

Important Note:
This validator only handles basic parameter validation for workflow integrity. It does not perform deep data validation or business rule validation, which should be handled by separate data validation services.

### Parameter Definitions

The system uses a centralized parameter definition configuration (`parameterDefinitions.ts`) that defines the validation rules for each node type. Currently supported node types include:

1. **HotplateControl**
   - `temperature` (number, required)
     - Range: 0-400°C
   - `duration` (number, required)
     - Range: 0-86400 seconds (24 hours)
   - `stirringSpeed` (number, optional)
     - Range: 0-2000 RPM

2. **PumpControl**
   - `flowRate` (number, required)
     - Range: 0-100 mL/min
   - `volume` (number, required)
     - Range: 0-1000 mL
   - `direction` (string, required)
     - Enum: ['forward', 'reverse']

3. **ValveControl**
   - `position` (string, required)
     - Enum: ['A', 'B', 'C', 'D']
   - `switchTime` (number, optional)
     - Range: 0-10 seconds

4. **SensorNode**
   - `sensorType` (string, required)
     - Enum: ['temperature', 'pressure', 'pH', 'flow']
   - `samplingRate` (number, required)
     - Range: 0.1-100 samples/second
   - `alarmThreshold` (number, optional)

5. **DataProcessing**
   - `operation` (string, required)
     - Enum: ['average', 'max', 'min', 'filter']
   - `windowSize` (integer, optional)
     - Range: 1-1000

6. **FileInput/Output**
   - `filePath` (string, required)
     - Pattern: Basic file path validation
   - `fileType`/`format` (string, required)
     - Enum: ['csv', 'json', 'txt']
   - `overwrite` (boolean, optional, FileOutput only)

Parameter Definition Structure:
```typescript
interface ParameterDefinition {
  name: string;
  type: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}
```

Usage Example:
```typescript
// Get parameter definitions for a node type
const paramDefs = getParameterDefinitions('HotplateControl');

// Validate parameters against definitions
const validator = new ParameterValidator();
const result = validator.validate({
  workflow,
  nodes,
  connections
});

if (!result.isValid) {
  // Handle validation errors
  result.errors.forEach(error => {
    if (error.type === ValidationErrorType.INVALID_PARAMETER) {
      console.error(
        `Invalid parameter "${error.parameterName}" in node ${error.nodeId}: ${error.message}`
      );
    }
  });
}
```

## Validation Rules

### DAG Structure Rules
1. No cycles allowed in the workflow ✅
2. All nodes must be connected (no isolated nodes) ✅
3. Workflow must have at least one start node and one end node ✅
4. All required inputs must be connected ✅

### Connection Rules
1. Connected ports must have compatible types ✅
2. Required ports must be connected ✅
3. Optional ports may be left unconnected ✅
4. Single-connection ports must not have multiple connections ✅

### Parameter Rules
1. Required parameters must have values ✅
2. Parameter values must match their defined types ✅
3. Parameter values must be within specified ranges ✅
4. Parameter formats must match defined patterns ✅
5. Enum parameters must have valid values ✅

## Usage Examples

### DAG Validation Example
```typescript
// Create validation context
const context: ValidationContext = {
  workflow: myWorkflow,
  nodes: new Map(nodes.map(node => [node.id, node])),
  connections: new Map(connections.map(conn => [conn.id, conn]))
};

// Run validation
const dagValidator = new DAGValidator();
const result = dagValidator.validate(context);

// Handle results
if (!result.isValid) {
  result.errors.forEach(error => {
    switch (error.type) {
      case ValidationErrorType.CYCLE_DETECTED:
        console.error(`Cycle detected: ${error.message}`);
        break;
      case ValidationErrorType.ISOLATED_NODE:
        console.error(`Isolated node: ${error.message}`);
        break;
      case ValidationErrorType.MISSING_START_END:
        console.error(`Invalid workflow structure: ${error.message}`);
        break;
    }
  });
}
```

### Connection Validation Example
```typescript
// Run connection validation
const connectionValidator = new ConnectionValidator();
const result = connectionValidator.validate(context);

// Handle results
if (!result.isValid) {
  result.errors.forEach(error => {
    switch (error.type) {
      case ValidationErrorType.INVALID_CONNECTION:
        console.error(`Invalid connection: ${error.message}`);
        // Highlight problematic connection in UI
        highlightConnection(error.connectionId);
        break;
      case ValidationErrorType.MISSING_REQUIRED_CONNECTION:
        console.error(`Missing connection: ${error.message}`);
        // Highlight node with missing connection
        highlightNode(error.nodeId);
        break;
    }
  });
}
```

### Parameter Validation Example
```typescript
// Run parameter validation
const paramValidator = new ParameterValidator();
const result = paramValidator.validate(context);

// Handle results
if (!result.isValid) {
  result.errors.forEach(error => {
    switch (error.type) {
      case ValidationErrorType.MISSING_REQUIRED_PARAMETER:
        console.error(`Missing parameter: ${error.message}`);
        // Highlight node with missing parameter
        highlightNode(error.nodeId);
        break;
      case ValidationErrorType.INVALID_PARAMETER:
        console.error(`Invalid parameter: ${error.message}`);
        // Show parameter error in UI
        showParameterError(error.nodeId, error.parameterName);
        break;
    }
  });
}
```

## Error Handling
The validation system uses a structured error reporting system:
- Each error has a type, severity, and detailed message
- Errors can reference specific nodes, connections, or parameters
- Additional details can be included for debugging purposes

## UI Feedback
The validation system provides detailed error information that can be used to:
1. Highlight problematic nodes and connections
2. Display error messages in the UI
3. Provide suggestions for fixing validation issues
4. Guide users through the workflow creation process 

## Validation vs Data Validation

It's important to distinguish between two types of validation in the system:

1. **Workflow Validation (This System)**
   - Ensures workflow structure integrity
   - Validates basic parameter requirements
   - Runs during workflow editing
   - Part of the workflow editor

2. **Data Validation (External Service)**
   - Validates experiment data validity
   - Checks business rules and constraints
   - Runs during simulation/execution
   - Separate microservice
   
The workflow validation system focuses on ensuring the workflow can be executed, while data validation ensures the experiment is scientifically valid. 
