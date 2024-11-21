import { UnitOperation } from '../types';

export const dummyOperations: UnitOperation[] = [
  {
    id: 'plate_transfer',
    name: '96-Well Plate Transfer',
    type: 'PLATE_OPERATION',
    description: 'Transfer samples between 96-well plates',
    inputs: [
      {
        id: 'source_plate',
        name: 'Source Plate',
        required: true,
        type: 'plate'
      }
    ],
    outputs: [
      {
        id: 'target_plate',
        name: 'Target Plate',
        required: true,
        type: 'plate'
      }
    ]
  },
  {
    id: 'file_upload',
    name: 'File Upload',
    type: 'DATA_INPUT',
    description: 'Upload a file to the workflow',
    inputs: [],
    outputs: [
      {
        id: 'file_output',
        name: 'File',
        required: true,
        type: 'file'
      }
    ]
  },
  {
    id: 'data_analysis',
    name: 'Data Analysis',
    type: 'ANALYSIS',
    description: 'Analyze experimental data',
    inputs: [
      {
        id: 'input_data',
        name: 'Input Data',
        required: true,
        type: 'file'
      }
    ],
    outputs: [
      {
        id: 'analysis_result',
        name: 'Analysis Result',
        required: true,
        type: 'file'
      }
    ]
  }
]; 