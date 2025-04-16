import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

const parameters = {
  vs_ref: {
    type: 'string',
    label: 'VS',
    description: 'Voltage measurement against reference electrode',
    defaultValue: 'true',
    options: [
      { label: 'True', value: 'true' },
      { label: 'False', value: 'false' }
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
  sample_interval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time between measurements',
    min: 0.1,
    defaultValue: 0.1
  }
};

export const LSVNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'LSV',
        parameters,
        onParameterChange: (params) => {
          // Convert vs_ref from string to boolean
          if (params.vs_ref !== undefined) {
            params.vs_ref = params.vs_ref === 'true';
          }
          console.log('LSV parameters changed:', params);
          // Here you can handle parameter changes
        },
        onExport: () => {
          console.log('Exporting LSV configuration');
          // Here you can handle configuration export
        }
      }}
    />
  );
}; 
