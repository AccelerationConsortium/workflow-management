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
  x: {
    type: 'number',
    label: 'X Position',
    description: 'Place location X coordinate',
    required: true,
    unit: 'mm',
    defaultValue: 0,
    min: -1000,
    max: 1000,
    step: 1
  },
  y: {
    type: 'number',
    label: 'Y Position',
    description: 'Place location Y coordinate',
    required: true,
    unit: 'mm',
    defaultValue: 0,
    min: -1000,
    max: 1000,
    step: 1
  },
  z: {
    type: 'number',
    label: 'Z Position',
    description: 'Place location Z coordinate',
    required: true,
    unit: 'mm',
    defaultValue: 50,
    min: 0,
    max: 500,
    step: 1
  },
  objectId: {
    type: 'string',
    label: 'Object ID',
    description: 'Identifier for the object to place',
    required: true,
    defaultValue: ''
  },
  releaseHeight: {
    type: 'number',
    label: 'Release Height',
    description: 'Height above surface to release object',
    required: true,
    unit: 'mm',
    defaultValue: 10,
    min: 0,
    max: 50,
    step: 1
  },
  releaseDelay: {
    type: 'number',
    label: 'Release Delay',
    description: 'Wait time before releasing gripper',
    required: false,
    unit: 's',
    defaultValue: 0.5,
    min: 0,
    max: 5,
    step: 0.1
  },
  retractHeight: {
    type: 'number',
    label: 'Retract Height',
    description: 'Height to retract after placing',
    required: true,
    unit: 'mm',
    defaultValue: 50,
    min: 10,
    max: 200,
    step: 1
  },
  speed: {
    type: 'number',
    label: 'Movement Speed',
    description: 'Speed of robot movement',
    required: true,
    unit: 'mm/s',
    defaultValue: 50,
    min: 1,
    max: 500,
    step: 1
  }
};