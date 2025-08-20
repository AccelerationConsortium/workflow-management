export const metadata = {
  name: 'OTFlex Gripper Control',
  version: '1.0.0',
  category: 'OTFLEX',
  subcategory: 'Robotic Control',
  description: 'Control Opentrons Flex gripper for automated plate handling and positioning',
  author: 'OTFLEX Team',
  license: 'MIT',
  tags: ['otflex', 'gripper', 'plate', 'handling', 'automation'],
  
  hardware: {
    required: ['opentrons_flex'],
    optional: ['force_sensor'],
    connections: {
      opentrons_flex: {
        protocol: 'http',
        ip: '169.254.179.32',
        timeout: 60,
      },
    },
  },
  
  capabilities: {
    plate_handling: true,
    force_control: true,
    collision_detection: true,
    position_control: true,
  },
  
  safety: {
    force_limits: true,
    collision_avoidance: true,
    grip_verification: true,
    emergency_stop: true,
  },
  
  performance: {
    typical_operation_time: '10-60s',
    max_grip_force: '100N',
    position_accuracy: '±0.5mm',
    max_payload: '2kg',
  },
};
