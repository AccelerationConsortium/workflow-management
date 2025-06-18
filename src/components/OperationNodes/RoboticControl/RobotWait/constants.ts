import { ParameterDefinition } from '../types';

export const PARAMETERS: Record<string, ParameterDefinition> = {
  robotType: {
    type: 'select',
    label: 'Robot Type',
    description: 'Select the robot model',
    required: true,
    defaultValue: 'Generic',
    options: ['UR3e', 'Dobot', 'Kinova', 'Generic']
  },
  duration: {
    type: 'number',
    label: 'Wait Duration',
    description: 'Time to wait',
    required: true,
    unit: 's',
    defaultValue: 1,
    min: 0.1,
    max: 300,
    step: 0.1
  },
  reason: {
    type: 'string',
    label: 'Reason',
    description: 'Reason for waiting',
    required: false,
    defaultValue: ''
  },
  skipable: {
    type: 'boolean',
    label: 'Skipable',
    description: 'Allow user to skip this wait',
    required: false,
    defaultValue: false
  },
  holdPosition: {
    type: 'boolean',
    label: 'Hold Position',
    description: 'Maintain current position during wait',
    required: false,
    defaultValue: true
  }
};