import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';

const parameters = {
  duration: {
    type: 'number',
    label: 'Duration',
    unit: 's',
    description: 'Duration of measurement',
    min: 0,
    defaultValue: 300
  },
  sample_interval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time between measurements',
    min: 0.1,
    defaultValue: 1.0
  }
};

export const OCVNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'OCV',
        parameters,
        onParameterChange: (params) => {
          console.log('OCV parameters changed:', params);
          // Here you can handle parameter changes
        },
        onExport: () => {
          console.log('Exporting OCV configuration');
          // Here you can handle configuration export
        }
      }}
    />
  );
}; 
