import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { MyxArmGripperParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexMyxArmGripper';
const NODE_LABEL = 'MyxArm Gripper';
const NODE_DESCRIPTION = 'Control MyxArm robot gripper operation';
const NODE_CATEGORY = 'OTFLEX';

export interface MyxArmGripperData {
  label: string;
  parameters: MyxArmGripperParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: MyxArmGripperParams): PrimitiveOperation[] => {
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
  
  // Initialize gripper
  operations.push({
    operation: 'initialize_gripper',
    parameters: {
      log_level: parameters.log_level,
    },
  });
  
  operations.push({
    operation: 'check_gripper_status',
    parameters: {},
  });
  
  // Set gripper parameters
  operations.push({
    operation: 'set_gripper_parameters',
    parameters: {
      speed: parameters.speed_mode === 'custom' ? parameters.custom_speed : 
             parameters.speed_mode === 'slow' ? 50 :
             parameters.speed_mode === 'fast' ? 100 : 70,
      force_control: parameters.enable_force_control,
      max_force: parameters.max_force,
      collision_detection: parameters.collision_detection,
      safe_mode: parameters.safe_mode,
    },
  });
  
  // Execute gripper action
  switch (parameters.gripper_action) {
    case 'open':
      operations.push({
        operation: 'open_gripper',
        parameters: {
          force: parameters.grip_force,
          wait_completion: parameters.wait_for_completion,
        },
      });
      break;
      
    case 'close':
      operations.push({
        operation: 'close_gripper',
        parameters: {
          force: parameters.grip_force,
          force_threshold: parameters.force_threshold,
          wait_completion: parameters.wait_for_completion,
        },
      });
      break;
      
    case 'position':
      operations.push({
        operation: 'set_gripper_position',
        parameters: {
          position: parameters.target_position,
          force: parameters.grip_force,
          wait_completion: parameters.wait_for_completion,
        },
      });
      break;
  }
  
  // Monitor force if enabled
  if (parameters.enable_force_control) {
    operations.push({
      operation: 'monitor_gripper_force',
      parameters: {
        force_threshold: parameters.force_threshold,
        max_force: parameters.max_force,
        tolerance: parameters.force_tolerance,
      },
    });
  }
  
  // Verify position if waiting for completion
  if (parameters.wait_for_completion) {
    operations.push({
      operation: 'verify_gripper_position',
      parameters: {
        tolerance: parameters.position_tolerance,
        timeout: parameters.completion_timeout,
      },
    });
  }
  
  // Log gripper action
  operations.push({
    operation: 'log_gripper_action',
    parameters: {
      action: parameters.gripper_action,
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
  { operation: 'initialize_gripper', description: 'Initialize gripper system' },
  { operation: 'check_gripper_status', description: 'Check gripper connection and status' },
  { operation: 'set_gripper_parameters', description: 'Configure speed and force settings' },
  { operation: 'open_gripper', condition: 'gripper_action == open', description: 'Open gripper fully' },
  { operation: 'close_gripper', condition: 'gripper_action == close', description: 'Close gripper with force control' },
  { operation: 'set_gripper_position', condition: 'gripper_action == position', description: 'Move to specific position' },
  { operation: 'monitor_gripper_force', condition: 'enable_force_control == true', description: 'Monitor grip force' },
  { operation: 'verify_gripper_position', condition: 'wait_for_completion == true', description: 'Verify final position' },
  { operation: 'log_gripper_action', description: 'Log gripper operation details' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const MyxArmGripperNode: React.FC<NodeProps> = (props) => {
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

export const MyxArmGripperForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as MyxArmGripperData['parameters']);
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

export const myxArmGripperNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🤏',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: MyxArmGripperNode,
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