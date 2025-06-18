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
    description: 'Pick location X coordinate',
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
    description: 'Pick location Y coordinate',
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
    description: 'Pick location Z coordinate',
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
    description: 'Identifier for the object to pick',
    required: true,
    defaultValue: ''
  },
  gripForce: {
    type: 'number',
    label: 'Grip Force',
    description: 'Force applied by gripper',
    required: true,
    unit: '%',
    defaultValue: 50,
    min: 1,
    max: 100,
    step: 1
  },
  approachHeight: {
    type: 'number',
    label: 'Approach Height',
    description: 'Height above object before picking',
    required: true,
    unit: 'mm',
    defaultValue: 20,
    min: 5,
    max: 100,
    step: 1
  },
  liftHeight: {
    type: 'number',
    label: 'Lift Height',
    description: 'Height to lift after gripping',
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