import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

const hideNumberInputArrows = {
  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0
  },
  '& input[type=number]': {
    MozAppearance: 'textfield'
  }
};

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
    defaultValue: -0.5,
    inputProps: {
      step: 'any',
      sx: hideNumberInputArrows
    }
  },
  end_voltage: {
    type: 'number',
    label: 'End Voltage',
    unit: 'V',
    description: 'Ending voltage',
    defaultValue: 0.5,
    inputProps: {
      step: 'any',
      sx: hideNumberInputArrows
    }
  },
  scan_rates: {
    type: 'number',
    label: 'Scan Rate',
    unit: 'V/s',
    description: 'Voltage scan rate',
    defaultValue: 0.01,
    min: 0.01,
    max: 0.2,
    inputProps: {
      step: 'any',
      sx: hideNumberInputArrows
    }
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
          // Convert vs_ref from string to boolean
          if (params.vs_ref !== undefined) {
            params.vs_ref = params.vs_ref === 'true';
          }
          // Convert scan_rates to array
          if (params.scan_rates !== undefined) {
            params.scan_rates = [params.scan_rates];
          }
          console.log('CVA parameters changed:', params);
          if (props.data.onParameterChange) {
            props.data.onParameterChange(params);
          }
        },
        onExport: () => {
          console.log('Exporting CVA configuration');
          // Here you can handle configuration export
        }
      }}
    />
  );
};
