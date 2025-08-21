import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ArduinoUltrasonicParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexArduinoUltrasonic';
const NODE_LABEL = 'Arduino Ultrasonic';
const NODE_DESCRIPTION = 'Control ultrasonic module via Arduino';
const NODE_CATEGORY = 'hardware';

export interface ArduinoUltrasonicData {
  label: string;
  parameters: ArduinoUltrasonicParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: ArduinoUltrasonicParams): PrimitiveOperation[] => {
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
  
  // Initialize Arduino connection
  operations.push({
    operation: 'initialize_arduino',
    parameters: {
      log_level: parameters.log_level,
    },
  });
  
  operations.push({
    operation: 'check_ultrasonic_connection',
    parameters: {
      base_number: parameters.base_number,
    },
  });
  
  // Configure ultrasonic parameters
  operations.push({
    operation: 'configure_ultrasonic',
    parameters: {
      base_number: parameters.base_number,
      frequency: parameters.frequency,
      power_level: parameters.power_level,
      pulse_mode: parameters.pulse_mode,
      duty_cycle: parameters.duty_cycle,
    },
  });
  
  // Execute ultrasonic operation based on mode
  if (parameters.ultrasonic_mode === 'continuous') {
    operations.push({
      operation: 'start_continuous_ultrasonic',
      parameters: {
        duration: parameters.duration,
        power_level: parameters.power_level,
        frequency: parameters.frequency,
      },
    });
  } else if (parameters.ultrasonic_mode === 'pulsed') {
    operations.push({
      operation: 'start_pulsed_ultrasonic',
      parameters: {
        duration: parameters.duration,
        pulse_duration: parameters.pulse_duration,
        pulse_interval: parameters.pulse_interval,
        duty_cycle: parameters.duty_cycle,
      },
    });
  } else if (parameters.ultrasonic_mode === 'sweep') {
    operations.push({
      operation: 'start_frequency_sweep',
      parameters: {
        start_frequency: parameters.start_frequency,
        end_frequency: parameters.end_frequency,
        sweep_rate: parameters.sweep_rate,
        duration: parameters.duration,
      },
    });
  } else {
    operations.push({
      operation: 'stop_ultrasonic',
      parameters: {
        base_number: parameters.base_number,
      },
    });
  }
  
  // Monitor operation if enabled
  if (parameters.enable_monitoring) {
    operations.push({
      operation: 'monitor_ultrasonic',
      parameters: {
        monitoring_interval: parameters.monitoring_interval,
        power_monitoring: parameters.power_monitoring,
        temperature_monitoring: parameters.temperature_monitoring,
      },
    });
  }
  
  // Wait for completion if required
  if (parameters.wait_for_completion) {
    operations.push({
      operation: 'wait_for_ultrasonic_completion',
      parameters: {
        timeout: parameters.completion_timeout,
      },
    });
  }
  
  // Log operation details
  operations.push({
    operation: 'log_ultrasonic_operation',
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
  { operation: 'initialize_arduino', description: 'Initialize Arduino connection' },
  { operation: 'check_ultrasonic_connection', description: 'Verify ultrasonic module connection' },
  { operation: 'configure_ultrasonic', description: 'Configure ultrasonic parameters' },
  { operation: 'start_continuous_ultrasonic', condition: 'ultrasonic_mode == "continuous"', description: 'Start continuous ultrasonic' },
  { operation: 'start_pulsed_ultrasonic', condition: 'ultrasonic_mode == "pulsed"', description: 'Start pulsed ultrasonic' },
  { operation: 'start_frequency_sweep', condition: 'ultrasonic_mode == "sweep"', description: 'Start frequency sweep' },
  { operation: 'stop_ultrasonic', condition: 'ultrasonic_mode == "stop"', description: 'Stop ultrasonic operation' },
  { operation: 'monitor_ultrasonic', condition: 'enable_monitoring == true', description: 'Monitor ultrasonic operation' },
  { operation: 'wait_for_ultrasonic_completion', condition: 'wait_for_completion == true', description: 'Wait for operation completion' },
  { operation: 'log_ultrasonic_operation', description: 'Log operation details' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const ArduinoUltrasonicNode: React.FC<NodeProps> = (props) => {
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

export const ArduinoUltrasonicForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as ArduinoUltrasonicData['parameters']);
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

export const arduinoUltrasonicNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🔊',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: ArduinoUltrasonicNode,
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
