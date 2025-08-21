import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ArduinoFurnaceParams } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexArduinoFurnace';
const NODE_LABEL = 'Arduino Furnace';
const NODE_DESCRIPTION = 'Control furnace open/close via Arduino';
const NODE_CATEGORY = 'OTFLEX';

const EXECUTION_STEPS = [
  { operation: 'wait', condition: 'wait_before > 0', description: 'Wait before starting' },
  { operation: 'initialize_arduino', description: 'Initialize Arduino connection' },
  { operation: 'check_furnace_connection', description: 'Verify furnace connection' },
  { operation: 'read_temperature', condition: 'enable_temperature_check == true', description: 'Read current temperature' },
  { operation: 'verify_safe_temperature', condition: 'enable_temperature_check == true', description: 'Verify safe operating temperature' },
  { operation: 'open_furnace', condition: 'furnace_action == "open"', description: 'Open furnace door' },
  { operation: 'close_furnace', condition: 'furnace_action == "close"', description: 'Close furnace door' },
  { operation: 'check_position_feedback', condition: 'enable_position_feedback == true', description: 'Verify position feedback' },
  { operation: 'wait_for_completion', condition: 'wait_for_completion == true', description: 'Wait for operation completion' },
  { operation: 'log_furnace_operation', description: 'Log operation results' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

interface ArduinoFurnaceNodeData {
  label: string;
  description?: string;
  nodeType: string;
  category: string;
  parameters: ArduinoFurnaceParams;
  parameterGroups: typeof PARAMETER_GROUPS;
  primitiveOperations: string[];
  executionSteps: typeof EXECUTION_STEPS;
  metadata: typeof metadata;
}

export const ArduinoFurnaceNode: React.FC<NodeProps> = (props) => {
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

export const ArduinoFurnaceForm: React.FC<{
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

ArduinoFurnaceNode.displayName = 'ArduinoFurnaceNode';

export const arduinoFurnaceNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🔥',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: ArduinoFurnaceNode,
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
