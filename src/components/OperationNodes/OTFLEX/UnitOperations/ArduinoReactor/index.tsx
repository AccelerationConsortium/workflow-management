import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ArduinoReactorParams } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexArduinoReactor';
const NODE_LABEL = 'Arduino Reactor';
const NODE_DESCRIPTION = 'Control actuated reactor open/close';
const NODE_CATEGORY = 'OTFLEX';

const EXECUTION_STEPS = [
  { operation: 'wait', condition: 'wait_before > 0', description: 'Wait before starting' },
  { operation: 'initialize_arduino', description: 'Initialize Arduino connection' },
  { operation: 'check_reactor_connection', description: 'Verify reactor connection' },
  { operation: 'read_pressure', condition: 'enable_pressure_monitoring == true', description: 'Read current pressure' },
  { operation: 'verify_safe_pressure', condition: 'enable_pressure_monitoring == true', description: 'Verify safe operating pressure' },
  { operation: 'open_reactor', condition: 'reactor_action == "open"', description: 'Open reactor' },
  { operation: 'close_reactor', condition: 'reactor_action == "close"', description: 'Close reactor' },
  { operation: 'monitor_force_feedback', condition: 'enable_force_feedback == true', description: 'Monitor force feedback' },
  { operation: 'verify_position', description: 'Verify reactor position' },
  { operation: 'wait_for_completion', condition: 'wait_for_completion == true', description: 'Wait for operation completion' },
  { operation: 'log_reactor_operation', description: 'Log operation results' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

interface ArduinoReactorNodeData {
  label: string;
  description?: string;
  nodeType: string;
  category: string;
  parameters: ArduinoReactorParams;
  parameterGroups: typeof PARAMETER_GROUPS;
  primitiveOperations: string[];
  executionSteps: typeof EXECUTION_STEPS;
  metadata: typeof metadata;
}

export const ArduinoReactorNode: React.FC<NodeProps> = (props) => {
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

export const ArduinoReactorForm: React.FC<{
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

ArduinoReactorNode.displayName = 'ArduinoReactorNode';

export const arduinoReactorNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '⚙️',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: ArduinoReactorNode,
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
