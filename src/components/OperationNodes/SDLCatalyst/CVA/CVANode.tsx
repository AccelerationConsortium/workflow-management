import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

const parameters = {
  purpose: {
    type: 'string',
    label: 'Purpose',
    description: 'Purpose of the CVA measurement',
    defaultValue: 'cv',
    options: [
      { label: 'CV', value: 'cv' },
      { label: 'Activation', value: 'activation' },
      { label: 'Stability', value: 'stability' }
    ]
  },
  start_voltage: {
    type: 'number',
    label: 'Start Voltage',
    unit: 'V',
    description: 'Starting voltage',
    defaultValue: -0.5
  },
  end_voltage: {
    type: 'number',
    label: 'End Voltage',
    unit: 'V',
    description: 'Ending voltage',
    defaultValue: 0.5
  },
  scan_rate: {
    type: 'number',
    label: 'Scan Rate',
    unit: 'V/s',
    description: 'Voltage scan rate',
    min: 0.001,
    defaultValue: 0.1
  },
  cycles: {
    type: 'number',
    label: 'Cycles',
    description: 'Number of cycles',
    min: 1,
    defaultValue: 3
  },
  sample_interval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time between measurements',
    min: 0.1,
    defaultValue: 0.1
  }
};

export const CVANode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'CVA',
        parameters,
        onParameterChange: (params) => {
          console.log('CVA parameters changed:', params);
          // Here you can handle parameter changes
        },
        onExport: () => {
          console.log('Exporting CVA configuration');
          // Here you can handle configuration export
        }
      }}
    />
  );
}; 
