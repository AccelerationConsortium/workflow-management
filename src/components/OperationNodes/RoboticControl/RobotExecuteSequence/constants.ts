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
  sequenceName: {
    type: 'string',
    label: 'Sequence Name',
    description: 'Name of the sequence to execute',
    required: true,
    defaultValue: ''
  },
  sequenceFile: {
    type: 'string',
    label: 'Sequence File',
    description: 'Path to sequence file (optional)',
    required: false,
    defaultValue: ''
  },
  speed: {
    type: 'number',
    label: 'Execution Speed',
    description: 'Speed multiplier for sequence execution',
    required: true,
    unit: 'x',
    defaultValue: 1.0,
    min: 0.1,
    max: 2.0,
    step: 0.1
  },
  loops: {
    type: 'number',
    label: 'Loop Count',
    description: 'Number of times to repeat sequence',
    required: true,
    defaultValue: 1,
    min: 1,
    max: 100,
    step: 1
  },
  abortOnError: {
    type: 'boolean',
    label: 'Abort on Error',
    description: 'Stop execution if error occurs',
    required: false,
    defaultValue: true
  },
  timeoutS: {
    type: 'number',
    label: 'Timeout',
    description: 'Maximum execution time',
    required: true,
    unit: 's',
    defaultValue: 300,
    min: 1,
    max: 3600,
    step: 1
  }
};