import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../../BaseUONode';
import { BaseUO } from '../../BaseUO';
import { PARAMETER_GROUPS, DEFAULT_VALUES, PRIMITIVE_OPERATIONS } from './constants';
import { ElectrochemicalMeasurementParams, PrimitiveOperation } from '../../types';
import { metadata } from './meta';

const NODE_TYPE = 'sdl1ElectrochemicalMeasurement';
const NODE_LABEL = 'Electrochemical Measurement';
const NODE_DESCRIPTION = 'Various electrochemical measurement techniques (OCV, CP, CVA, PEIS, LSV)';
const NODE_CATEGORY = 'measurement';

export interface ElectrochemicalMeasurementData {
  label: string;
  parameters: ElectrochemicalMeasurementParams;
  primitiveOperations?: PrimitiveOperation[];
}

const generatePrimitiveOperations = (parameters: ElectrochemicalMeasurementParams): PrimitiveOperation[] => {
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
  
  // Connect electrodes
  operations.push({
    operation: 'connect_electrodes',
    parameters: {
      measurement_type: parameters.measurement_type,
    },
  });
  
  // Initialize potentiostat
  operations.push({
    operation: 'initialize_potentiostat',
    parameters: {
      measurement_type: parameters.measurement_type,
    },
  });
  
  // Measurement-specific operations
  switch (parameters.measurement_type) {
    case 'OCV':
      operations.push({
        operation: 'measure_ocv',
        parameters: {
          duration: parameters.ocv_duration,
          sample_interval: parameters.ocv_sample_interval,
        },
      });
      break;
      
    case 'CP':
      operations.push({
        operation: 'apply_current',
        parameters: {
          current: parameters.cp_current,
          duration: parameters.cp_duration,
          sample_interval: parameters.cp_sample_interval,
          voltage_limits: {
            min: parameters.cp_voltage_limit_min,
            max: parameters.cp_voltage_limit_max,
          },
        },
      });
      break;
      
    case 'PEIS':
      operations.push({
        operation: 'measure_impedance',
        parameters: {
          start_frequency: parameters.peis_start_frequency,
          end_frequency: parameters.peis_end_frequency,
          points_per_decade: parameters.peis_points_per_decade,
          ac_amplitude: parameters.peis_ac_amplitude,
          dc_bias: parameters.peis_dc_bias,
          bias_vs_ocp: parameters.peis_bias_vs_ocp,
        },
      });
      break;
      
    // TODO: Add CVA and LSV operations when parameters are defined
  }
  
  // Record data
  operations.push({
    operation: 'record_data',
    parameters: {
      measurement_type: parameters.measurement_type,
      timestamp: true,
    },
  });
  
  // Disconnect electrodes
  operations.push({
    operation: 'disconnect_electrodes',
    parameters: {},
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
  { operation: 'connect_electrodes', description: 'Connect electrodes to potentiostat' },
  { operation: 'initialize_potentiostat', description: 'Initialize potentiostat settings' },
  { operation: 'measure_ocv', condition: 'measurement_type == OCV', description: 'Measure open circuit voltage' },
  { operation: 'apply_current', condition: 'measurement_type == CP', description: 'Apply constant current' },
  { operation: 'measure_impedance', condition: 'measurement_type == PEIS', description: 'Measure impedance spectrum' },
  { operation: 'record_data', description: 'Record measurement data' },
  { operation: 'disconnect_electrodes', description: 'Disconnect electrodes' },
  { operation: 'wait', condition: 'wait_after > 0', description: 'Wait after completion' },
];

export const ElectrochemicalMeasurementNode: React.FC<NodeProps> = (props) => {
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

export const ElectrochemicalMeasurementForm: React.FC<{
  onSave?: (parameters: Record<string, any>) => void;
}> = ({ onSave }) => {
  const handleSave = (parameters: Record<string, any>) => {
    if (onSave) {
      const primitiveOps = generatePrimitiveOperations(parameters as ElectrochemicalMeasurementData['parameters']);
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

export const electrochemicalMeasurementNodeConfig = {
  type: NODE_TYPE,
  label: NODE_LABEL,
  description: NODE_DESCRIPTION,
  category: NODE_CATEGORY,
  component: ElectrochemicalMeasurementNode,
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