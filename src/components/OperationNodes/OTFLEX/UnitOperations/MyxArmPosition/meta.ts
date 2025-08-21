export const metadata = {
  name: 'MyxArm Position Control',
  version: '1.0.0',
  category: 'OTFLEX',
  subcategory: 'Robotics',
  description: 'Control MyxArm 6-DOF robot position and movement with advanced trajectory planning',
  author: 'OTFLEX Team',
  license: 'MIT',
  tags: ['robotics', 'myxarm', 'position', 'movement', '6-dof'],
  hardware: {
    required: ['MyxArm 6'],
    optional: ['Force Sensor', 'Vision System'],
  },
  software: {
    dependencies: ['xArm-Python-SDK'],
    minVersion: '1.0.0',
  },
  capabilities: [
    'Absolute positioning',
    'Joint angle control',
    'Trajectory planning',
    'Collision detection',
    'Force feedback',
    'Safe mode operation',
  ],
  limitations: [
    'Maximum speed: 500 mm/s',
    'Workspace: 300mm radius',
    'Payload: 500g',
  ],
  safety: {
    level: 'Medium',
    precautions: [
      'Ensure workspace is clear',
      'Enable collision detection for safety',
      'Use safe mode for initial testing',
    ],
  },
};