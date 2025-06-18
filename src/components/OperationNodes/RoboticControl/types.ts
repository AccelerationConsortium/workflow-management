/**
 * Type definitions for Robotic Control nodes
 */

export interface RoboticControlNode {
  type: string;
  label: string;
  description: string;
  category: 'Robotic Control';
  expanded?: boolean;
}

export interface ParameterDefinition {
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  description: string;
  required: boolean;
  unit?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

export interface RobotParameters {
  robotType: 'UR3e' | 'Dobot' | 'Kinova' | 'Generic';
  [key: string]: any;
}

export const ROBOT_TYPES = ['UR3e', 'Dobot', 'Kinova', 'Generic'] as const;

export const MOTION_TYPES = ['linear', 'joint', 'arc'] as const;

export const ROBOTIC_CONTROL_NODE_TYPES: RoboticControlNode[] = [
  {
    type: 'robot_move_to',
    label: 'Robot Move To',
    description: 'Move robotic arm to specified position and orientation',
    category: 'Robotic Control',
    expanded: false
  },
  {
    type: 'robot_pick',
    label: 'Robot Pick',
    description: 'Pick up an object at specified location',
    category: 'Robotic Control',
    expanded: false
  },
  {
    type: 'robot_place',
    label: 'Robot Place',
    description: 'Place an object at specified location',
    category: 'Robotic Control',
    expanded: false
  },
  {
    type: 'robot_home',
    label: 'Robot Home',
    description: 'Return robot to home position',
    category: 'Robotic Control',
    expanded: false
  },
  {
    type: 'robot_execute_sequence',
    label: 'Robot Execute Sequence',
    description: 'Execute a predefined motion sequence',
    category: 'Robotic Control',
    expanded: false
  },
  {
    type: 'robot_wait',
    label: 'Robot Wait',
    description: 'Robot waits for specified duration',
    category: 'Robotic Control',
    expanded: false
  }
];