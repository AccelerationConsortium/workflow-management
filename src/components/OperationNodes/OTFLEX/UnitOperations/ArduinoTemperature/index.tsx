import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../../SDL1/BaseUONode';
import { BaseUO } from '../../../SDL1/BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ArduinoTemperatureParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'otflexArduinoTemperature';
const NODE_LABEL = 'Arduino Temperature';
const NODE_DESCRIPTION = 'Control temperature using Arduino-connected heater';
const NODE_CATEGORY = 'hardware';

export interface ArduinoTemperatureData {
  label: string;
  parameters: ArduinoTemperatureParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: ArduinoTemperatureParams): PrimitiveOperation[] => {
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
    operation: 'check_heater_connection',
    parameters: {
      base_number: parameters.base_number,
    },
  });
  
  // Configure temperature control
  operations.push({
    operation: 'configure_temperature_control',
    parameters: {
      base_number: parameters.base_number,
      target_temperature: parameters.target_temperature,
      heating_rate: parameters.heating_rate,
      cooling_rate: parameters.cooling_rate,
      pid_settings: {
        kp: parameters.pid_kp,
        ki: parameters.pid_ki,
        kd: parameters.pid_kd,
      },
    },
  });
  
  // Set temperature based on mode
  if (parameters.temperature_mode === 'set') {
    operations.push({
      operation: 'set_temperature',
      parameters: {
        target_temperature: parameters.target_temperature,
        tolerance: parameters.temperature_tolerance,
        max_heating_time: parameters.max_heating_time,
      },
    });
  } else if (parameters.temperature_mode === 'ramp') {
    operations.push({
      operation: 'temperature_ramp',
      parameters: {
        start_temperature: parameters.start_temperature,
        end_temperature: parameters.target_temperature,
        ramp_rate: parameters.ramp_rate,
        hold_time: parameters.hold_time,
      },
    });
  } else {
    operations.push({
      operation: 'get_temperature',
      parameters: {
        base_number: parameters.base_number,
      },
    });
  }
  
  // Monitor temperature if enabled
  if (parameters.enable_monitoring) {
    operations.push({
      operation: 'monitor_temperature',
      parameters: {
        monitoring_interval: parameters.monitoring_interval,
        temperature_tolerance: parameters.temperature_tolerance,
        safety_max_temp: parameters.safety_max_temp,
      },
    });
  }
  
  // Wait for temperature stability if required
  if (parameters.wait_for_stability) {
    operations.push({
      operation: 'wait_for_temperature_stability',
      parameters: {
        tolerance: parameters.temperature_tolerance,
        stability_time: parameters.stability_time,
        timeout: parameters.stability_timeout,
      },
    });
  }
  
  // Log temperature data
  operations.push({
    operation: 'log_temperature_data',
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
  { operation: 'check_heater_connection', description: 'Verify heater connection' },
  { operation: 'configure_temperature_control', description: 'Configure temperature control parameters' },
  { operation: 'set_temperature', condition: 'temperature_mode == "set"', description: 'Set target temperature' },
  { operation: 'temperature_ramp', condition: 'temperature_mode == "ramp"', description: 'Execute temperature ramp' },
  { operation: 'get_temperature', condition: 'temperature_mode == "get"', description: 'Read current temperature' },
  { operation: 'monitor_temperature', condition: 'enable_monitoring == true', description: 'Monitor temperature' },
  { operation: 'wait_for_temperature_stability', condition: 'wait_for_stability == true', description: 'Wait for temperature stability' },
  { operation: 'log_temperature_data', description: 'Log temperature data' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const ArduinoTemperatureNode: React.FC<NodeProps> = (props) => {
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

export const ArduinoTemperatureForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as ArduinoTemperatureData['parameters']);
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

export const arduinoTemperatureNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  icon: '🌡️',
  color: '#8F7FE8',
  category: NODE_CATEGORY,
  component: ArduinoTemperatureNode,
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
