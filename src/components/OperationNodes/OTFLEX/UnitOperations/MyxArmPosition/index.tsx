import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { MyxArmPositionParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexMyxArmPosition';
const NODE_LABEL = 'MyxArm Position';
const NODE_DESCRIPTION = 'Control MyxArm robot position and movement';
const NODE_CATEGORY = 'OTFLEX';

export interface MyxArmPositionData {
  label: string;
  parameters: MyxArmPositionParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: MyxArmPositionParams): PrimitiveOperation[] => {
  const operations: PrimitiveOperation[] = [];
  
  // Wait before operation
  if (parameters.wait_before && parameters.wait_before > 0) {
    operations.push({
      operation: 'wait',
      parameters: {
        duration: parameters.wait_before,
        unit: 'seconds',
      },
    });
  }
  
  // Initialize and connect to robot
  operations.push({
    operation: 'initialize_myxarm',
    parameters: {
      log_level: parameters.log_level,
    },
  });
  
  operations.push({
    operation: 'check_connection',
    parameters: {},
  });
  
  operations.push({
    operation: 'enable_robot',
    parameters: {
      safe_mode: parameters.safe_mode,
    },
  });
  
  // Set movement parameters
  operations.push({
    operation: 'set_movement_parameters',
    parameters: {
      speed: parameters.speed_mode === 'custom' ? parameters.custom_speed : 
             parameters.speed_mode === 'slow' ? 100 :
             parameters.speed_mode === 'fast' ? 300 : 200,
      acceleration: parameters.acceleration,
      collision_detection: parameters.enable_collision_detection,
      force_limit: parameters.force_limit,
    },
  });
  
  // Calculate trajectory
  operations.push({
    operation: 'calculate_trajectory',
    parameters: {
      mode: parameters.movement_mode,
      ...(parameters.movement_mode === 'absolute' ? {
        x: parameters.x_position,
        y: parameters.y_position,
        z: parameters.z_position,
        rx: parameters.rx_angle,
        ry: parameters.ry_angle,
        rz: parameters.rz_angle,
      } : {
        joints: [
          parameters.joint1,
          parameters.joint2,
          parameters.joint3,
          parameters.joint4,
          parameters.joint5,
          parameters.joint6,
        ],
      }),
    },
  });
  
  // Execute movement
  operations.push({
    operation: 'move_to_position',
    parameters: {
      wait_for_completion: parameters.wait_for_completion,
      timeout: parameters.completion_timeout,
    },
  });
  
  // Monitor position if waiting for completion
  if (parameters.wait_for_completion) {
    operations.push({
      operation: 'monitor_position',
      parameters: {
        position_tolerance: parameters.position_tolerance,
        angle_tolerance: parameters.angle_tolerance,
      },
    });
    
    operations.push({
      operation: 'verify_position',
      parameters: {
        tolerance: parameters.position_tolerance,
      },
    });
  }
  
  // Log movement details
  operations.push({
    operation: 'log_movement',
    parameters: {
      level: parameters.log_level,
    },
  });
  
  // Wait after operation
  if (parameters.wait_after && parameters.wait_after > 0) {
    operations.push({
      operation: 'wait',
      parameters: {
        duration: parameters.wait_after,
        unit: 'seconds',
      },
    });
  }
  
  return operations;
};

const EXECUTION_STEPS = [
  { operation: 'wait', condition: 'wait_before > 0', description: 'Wait before starting' },
  { operation: 'initialize_myxarm', description: 'Initialize MyxArm robot connection' },
  { operation: 'check_connection', description: 'Verify robot connection status' },
  { operation: 'enable_robot', description: 'Enable robot motors and systems' },
  { operation: 'set_movement_parameters', description: 'Configure speed and safety settings' },
  { operation: 'calculate_trajectory', description: 'Calculate movement trajectory' },
  { operation: 'move_to_position', description: 'Execute robot movement' },
  { operation: 'monitor_position', condition: 'wait_for_completion == true', description: 'Monitor movement progress' },
  { operation: 'verify_position', condition: 'wait_for_completion == true', description: 'Verify final position' },
  { operation: 'log_movement', description: 'Log movement details' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const MyxArmPositionNode: React.FC<NodeProps> = (props) => {
  const enhancedData = {
    ...props.data,
    parameterGroups: PARAMETER_GROUPS,
    nodeType: NODE_TYPE,
    category: NODE_CATEGORY,
    description: NODE_DESCRIPTION,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    executionSteps: EXECUTION_STEPS,
    parameters: { ...DEFAULT_VALUES, ...props.data.parameters },
  };
  
  const currentPrimitiveOps = generatePrimitiveOperations(enhancedData.parameters);

  if (props.data.onDataChange) {
    const originalOnDataChange = props.data.onDataChange;
    enhancedData.onDataChange = (newData: any) => {
      const primitiveOps = generatePrimitiveOperations(newData.parameters);
      originalOnDataChange({
        ...newData,
        primitiveOperations: primitiveOps,
      });
    };
  }

  return <BaseUONode {...props} data={enhancedData} />;
};

export const MyxArmPositionForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as MyxArmPositionData['parameters']);
      onSave({
        nodeType: NODE_TYPE,
        parameters,
        primitiveOperations: primitiveOps,
      });
    }
  };

  return (
    <BaseUO
      title={NODE_LABEL}
      description={NODE_DESCRIPTION}
      parameterGroups={PARAMETER_GROUPS}
      defaultValues={DEFAULT_VALUES}
      onSave={handleSave}
      primitiveOperations={PRIMITIVE_OPERATIONS}
    />
  );
};

export const myxArmPositionNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🤖',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: MyxArmPositionNode,
  defaultData: {
    label: NODE_LABEL,
    description: NODE_DESCRIPTION,
    nodeType: NODE_TYPE,
    category: 'OTFLEX',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};