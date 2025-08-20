export const metadata = {
  name: 'Arduino Reactor Control',
  version: '1.0.0',
  category: 'OTFLEX',
  subcategory: 'Reaction Control',
  description: 'Control actuated reactor open/close operations with pressure and force monitoring',
  author: 'OTFLEX Team',
  license: 'MIT',
  tags: ['arduino', 'reactor', 'actuation', 'pressure', 'force'],
  
  hardware: {
    required: ['arduino'],
    optional: ['pressure_sensor', 'force_sensor'],
    connections: {
      arduino: {
        port: 'COM4',
        baudrate: 115200,
        timeout: 300,
      },
    },
  },
  
  capabilities: {
    reactor_control: true,
    pressure_monitoring: true,
    force_feedback: true,
    position_control: true,
  },
  
  safety: {
    pressure_limits: true,
    force_limits: true,
    position_verification: true,
    emergency_stop: true,
  },
  
  performance: {
    typical_operation_time: '5-30s',
    max_pressure: '200psi',
    max_force: '500N',
    position_accuracy: '±0.1mm',
  },
};
