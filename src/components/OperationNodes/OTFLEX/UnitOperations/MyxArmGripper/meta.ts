export const metadata = {
  name: 'MyxArm Gripper Control',
  version: '1.0.0',
  category: 'OTFLEX',
  subcategory: 'Robotics',
  description: 'Control MyxArm robot gripper with force feedback and collision detection',
  author: 'OTFLEX Team',
  license: 'MIT',
  tags: ['robotics', 'myxarm', 'gripper', 'force-control', 'end-effector'],
  hardware: {
    required: ['MyxArm 6', 'xArm Gripper'],
    optional: ['Force Sensor'],
  },
  software: {
    dependencies: ['xArm-Python-SDK'],
    minVersion: '1.0.0',
  },
  capabilities: [
    'Open/close gripper',
    'Position control',
    'Force feedback',
    'Collision detection',
    'Variable speed control',
    'Safe mode operation',
  ],
  limitations: [
    'Maximum grip force: 100N',
    'Position accuracy: ±1%',
    'Response time: <1s',
  ],
  safety: {
    level: 'Medium',
    precautions: [
      'Test grip force on safe objects first',
      'Enable collision detection',
      'Use safe mode for delicate objects',
    ],
  },
};