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
  speed: {
    type: 'number',
    label: 'Movement Speed',
    description: 'Speed to return home',
    required: true,
    unit: 'mm/s',
    defaultValue: 100,
    min: 1,
    max: 500,
    step: 1
  },
  safeMode: {
    type: 'boolean',
    label: 'Safe Mode',
    description: 'Use safe trajectory to avoid obstacles',
    required: false,
    defaultValue: true
  },
  waitAfter: {
    type: 'number',
    label: 'Wait After Home',
    description: 'Wait time after reaching home position',
    required: false,
    unit: 's',
    defaultValue: 0,
    min: 0,
    max: 10,
    step: 0.1
  },
  reason: {
    type: 'string',
    label: 'Reason',
    description: 'Reason for returning to home position',
    required: false,
    defaultValue: ''
  }
};