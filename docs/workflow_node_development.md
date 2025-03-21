# Workflow Node Development Guide

## Overview
This guide explains how to create a new device node that can be integrated into the workflow system. Each node requires three main components:
1. Device Definition
2. Device Handler
3. Device Task Script

## Step 1: Device Definition
Create a new file `src/devices/{deviceName}.ts`:

```typescript
import { DeviceDefinition } from '../types/device';

export const {DeviceName}Definition: DeviceDefinition = {
  id: 'unique_device_id',
  name: 'Human Readable Name',
  type: 'device_type',
  description: 'Device description',
  executionMode: 'remote' | 'local',
  scriptPath: 'path/to/device/script.py',
  
  // Define all parameters that can be configured
  parameters: [
    {
      name: 'parameter_name',
      type: 'number' | 'string' | 'boolean' | 'file',
      required: true | false,
      validation: {
        min?: number,
        max?: number,
        pattern?: string,
        fileTypes?: string[]
      }
    }
  ],

  // Define all outputs that the device produces
  outputs: [
    {
      name: 'output_name',
      type: 'measurement' | 'status' | 'log' | 'file',
      description: 'Output description'
    }
  ],

  // Add relevant tags for Prefect worker assignment
  tags: ['tag1', 'tag2'],

  // For remote devices, configure communication
  remoteConfig?: {
    protocol: 'mqtt' | 'grpc',
    host: string,
    port: number,
    topic?: string,
    credentials?: {
      username?: string,
      password?: string,
      certificate?: string
    }
  }
};

// Define command interface for device control
export interface {DeviceName}Command {
  command: string;
  parameters: Record<string, any>;
}

// Define status interface for device feedback
export interface {DeviceName}Status {
  device_id: string;
  connected: boolean;
  // Add device-specific status fields
  timestamp: number;
}

// Create parameter conversion utility
export function convertParamsToCommands(params: Record<string, any>): {DeviceName}Command[] {
  // Convert workflow parameters to device commands
}
```

## Step 2: Device Handler
Create a new file `src/devices/{deviceName}Handler.ts`:

```typescript
import { WorkflowNode } from '../types/workflow';
import { {DeviceName}Command, {DeviceName}Status, convertParamsToCommands } from './{deviceName}';

export class {DeviceName}Handler {
  // Initialize communication client
  constructor() {
    // Setup communication (MQTT, gRPC, etc.)
  }

  // Main task execution method
  public async executeTask(node: WorkflowNode): Promise<void> {
    return new Promise((resolve, reject) => {
      // 1. Convert parameters to commands
      // 2. Send commands to device
      // 3. Monitor device status
      // 4. Handle completion/errors
    });
  }

  // Task completion check
  private isTaskCompleted(status: {DeviceName}Status, params: Record<string, any>): boolean {
    // Define completion criteria
  }

  // Cleanup method
  public disconnect(): void {
    // Clean up connections
  }
}
```

## Step 3: Device Task Script
Create a Python script in `scripts/{deviceName}.py`:

```python
import argparse
import json
import sys

def main():
    parser = argparse.ArgumentParser()
    # Add all parameters as arguments
    parser.add_argument('--param1', type=float, required=True)
    args = parser.parse_args()

    try:
        # Implement device control logic
        result = {
            'status': 'success',
            'output': {...}
        }
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            'status': 'error',
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
```

## Integration Checklist
- [ ] Device Definition
  - [ ] Unique ID and type
  - [ ] All parameters defined with validation
  - [ ] All outputs defined
  - [ ] Communication config (if remote)
  
- [ ] Device Handler
  - [ ] Communication setup
  - [ ] Parameter conversion
  - [ ] Status monitoring
  - [ ] Error handling
  
- [ ] Task Script
  - [ ] Parameter parsing
  - [ ] Device control implementation
  - [ ] Error handling
  - [ ] Output formatting

## Testing
1. Test device script independently
2. Test device handler with mock data
3. Test integration with workflow system
4. Verify Prefect task generation and execution

## Notes
- Ensure parameter ranges match device capabilities
- Consider timeout and retry settings
- Document any device-specific requirements
- Add appropriate error messages and logging 
