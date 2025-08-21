import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ArduinoElectrodeParams } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexArduinoElectrode';
const NODE_LABEL = 'Arduino Electrode';
const NODE_DESCRIPTION = 'Switch between 2-electrode and 3-electrode system';
const NODE_CATEGORY = 'OTFLEX';

const EXECUTION_STEPS = [
  { operation: 'wait', condition: 'wait_before > 0', description: 'Wait before starting' },
  { operation: 'initialize_arduino', description: 'Initialize Arduino connection' },
  { operation: 'check_electrode_connections', description: 'Verify electrode connections' },
  { operation: 'switch_to_2_electrode', condition: 'electrode_mode == "2-electrode"', description: 'Switch to 2-electrode system' },
  { operation: 'switch_to_3_electrode', condition: 'electrode_mode == "3-electrode"', description: 'Switch to 3-electrode system' },
  { operation: 'verify_continuity', condition: 'enable_continuity_check == true', description: 'Verify electrode continuity' },
  { operation: 'check_isolation', condition: 'enable_isolation_check == true', description: 'Check electrical isolation' },
  { operation: 'measure_resistance', condition: 'enable_continuity_check == true', description: 'Measure electrode resistance' },
  { operation: 'wait_for_stabilization', condition: 'wait_for_stabilization == true', description: 'Wait for electrical stabilization' },
  { operation: 'log_electrode_operation', description: 'Log operation results' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

interface ArduinoElectrodeNodeData {
  label: string;
  description?: string;
  nodeType: string;
  category: string;
  parameters: ArduinoElectrodeParams;
  parameterGroups: typeof PARAMETER_GROUPS;
  primitiveOperations: string[];
  executionSteps: typeof EXECUTION_STEPS;
  metadata: typeof metadata;
}

export const ArduinoElectrodeNode: React.FC<NodeProps> = (props) => {
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

export const ArduinoElectrodeForm: React.FC<{
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

ArduinoElectrodeNode.displayName = 'ArduinoElectrodeNode';

export const arduinoElectrodeNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '⚡',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: ArduinoElectrodeNode,
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
