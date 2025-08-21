import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { OTFlexGripperParams } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexGripper';
const NODE_LABEL = 'OTFlex Gripper';
const NODE_DESCRIPTION = 'Control Opentrons Flex gripper for plate handling';
const NODE_CATEGORY = 'OTFLEX';

const EXECUTION_STEPS = [
  { operation: 'wait', condition: 'wait_before > 0', description: 'Wait before starting' },
  { operation: 'initialize_otflex', description: 'Initialize Opentrons Flex connection' },
  { operation: 'check_gripper_connection', description: 'Verify gripper connection' },
  { operation: 'home_gripper', condition: 'gripper_action == "home"', description: 'Home gripper to safe position' },
  { operation: 'move_to_position', condition: 'gripper_action == "move"', description: 'Move gripper to specified position' },
  { operation: 'open_gripper', condition: 'gripper_action == "open"', description: 'Open gripper jaws' },
  { operation: 'close_gripper', condition: 'gripper_action == "close"', description: 'Close gripper jaws' },
  { operation: 'pick_up_labware', condition: 'gripper_action == "pick"', description: 'Pick up target labware' },
  { operation: 'place_labware', condition: 'gripper_action == "place"', description: 'Place labware at target location' },
  { operation: 'monitor_force', condition: 'enable_force_monitoring == true', description: 'Monitor grip force' },
  { operation: 'detect_collision', condition: 'enable_collision_detection == true', description: 'Check for collisions' },
  { operation: 'verify_grip', description: 'Verify successful grip operation' },
  { operation: 'log_gripper_operation', description: 'Log operation results' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

interface OTFlexGripperNodeData {
  label: string;
  description?: string;
  nodeType: string;
  category: string;
  parameters: OTFlexGripperParams;
  parameterGroups: typeof PARAMETER_GROUPS;
  primitiveOperations: string[];
  executionSteps: typeof EXECUTION_STEPS;
  metadata: typeof metadata;
}

export const OTFlexGripperNode: React.FC<NodeProps> = (props) => {
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

  return <BaseUONode {...props} data={enhancedData} />;
};

export const OTFlexGripperForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      onSave({
        nodeType: NODE_TYPE,
        parameters,
        primitiveOperations: PRIMITIVE_OPERATIONS,
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

OTFlexGripperNode.displayName = 'OTFlexGripperNode';

export const otflexGripperNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🦾',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: OTFlexGripperNode,
  defaultData: {
    label: NODE_LABEL,
    description: NODE_DESCRIPTION,
    nodeType: NODE_TYPE,
    category: 'OTFLEX',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    executionSteps: EXECUTION_STEPS,
    metadata,
  },
};
