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
    description: 'Target X coordinate',
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
    description: 'Target Y coordinate',
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
    description: 'Target Z coordinate',
    required: true,
    unit: 'mm',
    defaultValue: 100,
    min: 0,
    max: 500,
    step: 1
  },
  rx: {
    type: 'number',
    label: 'RX Rotation',
    description: 'Rotation around X axis',
    required: false,
    unit: 'deg',
    defaultValue: 0,
    min: -180,
    max: 180,
    step: 1
  },
  ry: {
    type: 'number',
    label: 'RY Rotation',
    description: 'Rotation around Y axis',
    required: false,
    unit: 'deg',
    defaultValue: 0,
    min: -180,
    max: 180,
    step: 1
  },
  rz: {
    type: 'number',
    label: 'RZ Rotation',
    description: 'Rotation around Z axis',
    required: false,
    unit: 'deg',
    defaultValue: 0,
    min: -180,
    max: 180,
    step: 1
  },
  speed: {
    type: 'number',
    label: 'Movement Speed',
    description: 'Speed of robot movement',
    required: true,
    unit: 'mm/s',
    defaultValue: 100,
    min: 1,
    max: 1000,
    step: 1
  },
  motionType: {
    type: 'select',
    label: 'Motion Type',
    description: 'Type of motion path',
    required: true,
    defaultValue: 'linear',
    options: ['linear', 'joint', 'arc']
  },
  waitAfter: {
    type: 'number',
    label: 'Wait After Move',
    description: 'Wait time after reaching position',
    required: false,
    unit: 's',
    defaultValue: 0,
    min: 0,
    max: 60,
    step: 0.1
  },
  safeMode: {
    type: 'boolean',
    label: 'Safe Mode',
    description: 'Use safe trajectory to avoid obstacles',
    required: false,
    defaultValue: true
  }
};