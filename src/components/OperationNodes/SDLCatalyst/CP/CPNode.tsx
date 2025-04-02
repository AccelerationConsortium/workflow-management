import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

const parameters = {
  current: {
    type: 'number',
    label: 'Current',
    unit: 'A',
    description: 'Applied current',
    defaultValue: 0.001,
    required: true
  },
  duration: {
    type: 'number',
    label: 'Duration',
    unit: 's',
    description: 'Duration of measurement',
    min: 0,
    defaultValue: 300,
    required: true
  },
  sample_interval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time between measurements',
    min: 0.1,
    defaultValue: 1.0,
    required: true
  },
  voltage_limit_high: {
    type: 'number',
    label: 'High Voltage Limit (Optional)',
    unit: 'V',
    description: 'Upper voltage limit - Set this to prevent overcharging or side reactions',
    defaultValue: 1.0,
    required: false,
    tooltip: 'Optional safety limit to prevent exceeding maximum voltage'
  },
  voltage_limit_low: {
    type: 'number',
    label: 'Low Voltage Limit (Optional)',
    unit: 'V',
    description: 'Lower voltage limit - Set this to prevent over-discharging',
    defaultValue: -1.0,
    required: false,
    tooltip: 'Optional safety limit to prevent voltage from going too low'
  }
};

export const CPNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'CP',
        parameters,
        onParameterChange: (params) => {
          console.log('CP parameters changed:', params);
          // Here you can handle parameter changes
        },
        onExport: () => {
          console.log('Exporting CP configuration');
          // Here you can handle configuration export
        }
      }}
    />
  );
}; 
