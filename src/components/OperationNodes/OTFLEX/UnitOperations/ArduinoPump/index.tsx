import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ArduinoPumpParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexArduinoPump';
const NODE_LABEL = 'Arduino Pump';
const NODE_DESCRIPTION = 'Control Arduino-connected pump for liquid dispensing';
const NODE_CATEGORY = 'hardware';

export interface ArduinoPumpData {
  label: string;
  parameters: ArduinoPumpParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: ArduinoPumpParams): PrimitiveOperation[] => {
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
    operation: 'check_pump_connection',
    parameters: {
      pump_selection: parameters.pump_selection,
    },
  });
  
  // Configure pump parameters
  operations.push({
    operation: 'configure_pump',
    parameters: {
      pump_selection: parameters.pump_selection,
      speed_percentage: parameters.speed_percentage,
      max_pressure: parameters.max_pressure,
      enable_flow_monitoring: parameters.enable_flow_monitoring,
    },
  });
  
  // Execute pump operation based on mode
  if (parameters.pump_mode === 'volume') {
    operations.push({
      operation: 'dispense_volume',
      parameters: {
        volume: parameters.volume,
        flow_rate: parameters.flow_rate,
        reverse_direction: parameters.reverse_direction,
        volume_tolerance: parameters.volume_tolerance,
      },
    });
  } else if (parameters.pump_mode === 'time') {
    operations.push({
      operation: 'run_pump_timed',
      parameters: {
        duration: parameters.duration,
        speed_percentage: parameters.speed_percentage,
        reverse_direction: parameters.reverse_direction,
      },
    });
  } else {
    operations.push({
      operation: 'control_pump',
      parameters: {
        mode: parameters.pump_mode, // 'on' or 'off'
        speed_percentage: parameters.speed_percentage,
      },
    });
  }
  
  // Monitor operation if enabled
  if (parameters.enable_flow_monitoring) {
    operations.push({
      operation: 'monitor_flow',
      parameters: {
        flow_tolerance: parameters.flow_tolerance,
        max_pressure: parameters.max_pressure,
      },
    });
  }
  
  // Verify completion if waiting
  if (parameters.wait_for_completion) {
    operations.push({
      operation: 'verify_completion',
      parameters: {
        timeout: parameters.completion_timeout,
        volume_tolerance: parameters.volume_tolerance,
      },
    });
  }
  
  // Log operation details
  operations.push({
    operation: 'log_pump_operation',
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
  { operation: 'check_pump_connection', description: 'Verify pump connection' },
  { operation: 'configure_pump', description: 'Configure pump parameters' },
  { operation: 'dispense_volume', condition: 'pump_mode == "volume"', description: 'Dispense specified volume' },
  { operation: 'run_pump_timed', condition: 'pump_mode == "time"', description: 'Run pump for specified time' },
  { operation: 'control_pump', condition: 'pump_mode == "on" || pump_mode == "off"', description: 'Control pump on/off' },
  { operation: 'monitor_flow', condition: 'enable_flow_monitoring == true', description: 'Monitor flow rate' },
  { operation: 'verify_completion', condition: 'wait_for_completion == true', description: 'Verify operation completion' },
  { operation: 'log_pump_operation', description: 'Log operation details' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const ArduinoPumpNode: React.FC<NodeProps> = (props) => {
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

export const ArduinoPumpForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as ArduinoPumpData['parameters']);
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

export const arduinoPumpNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '⚡',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: ArduinoPumpNode,
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
