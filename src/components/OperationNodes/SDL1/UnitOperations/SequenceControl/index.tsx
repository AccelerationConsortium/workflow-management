import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { SequenceControlParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl1SequenceControl';
const NODE_LABEL = 'Sequence Control';
const NODE_DESCRIPTION = 'Loop and conditional control for experimental sequences';
const NODE_CATEGORY = 'control';

export interface SequenceControlData {
  label: string;
  parameters: SequenceControlParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: SequenceControlParams): PrimitiveOperation[] => {
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
  
  // Initialize loop
  operations.push({
    operation: 'initialize_loop',
    parameters: {
      type: parameters.loop_type,
      count: parameters.loop_count,
      condition: parameters.loop_condition,
    },
  });
  
  // Check condition (for condition-based loops)
  if (parameters.loop_type === 'condition_based') {
    operations.push({
      operation: 'check_condition',
      parameters: {
        condition_type: parameters.loop_condition,
        expression: parameters.break_condition,
      },
    });
  }
  
  // Loop iteration (this would contain the actual operations to be repeated)
  operations.push({
    operation: 'loop_iteration',
    parameters: {
      type: parameters.loop_type,
      max_iterations: parameters.loop_count || 1000, // Safety limit
    },
  });
  
  // Increment counter (for fixed count loops)
  if (parameters.loop_type === 'fixed_count') {
    operations.push({
      operation: 'increment_counter',
      parameters: {
        target_count: parameters.loop_count,
      },
    });
  }
  
  // Evaluate break condition (for condition-based loops)
  if (parameters.loop_type === 'condition_based') {
    operations.push({
      operation: 'evaluate_break_condition',
      parameters: {
        expression: parameters.break_condition,
        condition_type: parameters.loop_condition,
      },
    });
  }
  
  // Finalize loop
  operations.push({
    operation: 'finalize_loop',
    parameters: {
      type: parameters.loop_type,
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
  { operation: 'initialize_loop', description: 'Initialize loop control structure' },
  { operation: 'check_condition', condition: 'loop_type == condition_based', description: 'Check loop continuation condition' },
  { operation: 'loop_iteration', description: 'Execute loop iteration' },
  { operation: 'increment_counter', condition: 'loop_type == fixed_count', description: 'Increment iteration counter' },
  { operation: 'evaluate_break_condition', condition: 'loop_type == condition_based', description: 'Evaluate break condition' },
  { operation: 'finalize_loop', description: 'Finalize loop and cleanup' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const SequenceControlNode: React.FC<NodeProps> = (props) => {
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

export const SequenceControlForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as SequenceControlData['parameters']);
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

export const sequenceControlNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: SequenceControlNode,
  defaultData: {
    label: NODE_LABEL,
    description: NODE_DESCRIPTION,
    nodeType: NODE_TYPE,
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
  },
};