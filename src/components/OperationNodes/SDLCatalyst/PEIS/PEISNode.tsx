import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

const parameters = {
  frequency_start: {
    type: 'number',
    label: 'Start Frequency',
    unit: 'Hz',
    description: 'Starting frequency',
    min: 0.1,
    defaultValue: 100000
  },
  frequency_end: {
    type: 'number',
    label: 'End Frequency',
    unit: 'Hz',
    description: 'Ending frequency',
    min: 0.01,
    defaultValue: 0.1
  },
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
  points_per_decade: {
    type: 'number',
    label: 'Points per Decade',
    description: 'Number of frequency points per decade',
    min: 1,
    defaultValue: 10
  },
  amplitude: {
    type: 'number',
    label: 'Amplitude',
    unit: 'V',
    description: 'AC voltage amplitude',
    min: 0.001,
    defaultValue: 0.01
  },
  dc_voltage: {
    type: 'number',
    label: 'DC Voltage',
    unit: 'V',
    description: 'DC bias voltage',
    defaultValue: 0
  }
};

export const PEISNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'PEIS',
        parameters,
        onParameterChange: (params) => {
          // Convert vs_ref from string to boolean
          if (params.vs_ref !== undefined) {
            params.vs_ref = params.vs_ref === 'true';
          }
          console.log('PEIS parameters changed:', params);
          // Here you can handle parameter changes
        },
        onExport: () => {
          console.log('Exporting PEIS configuration');
          // Here you can handle configuration export
        }
      }}
    />
  );
}; 
