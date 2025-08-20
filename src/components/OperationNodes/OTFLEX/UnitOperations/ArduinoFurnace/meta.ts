export const metadata = {
  name: 'Arduino Furnace Control',
  version: '1.0.0',
  category: 'OTFLEX',
  subcategory: 'Temperature Control',
  description: 'Control furnace open/close operations via Arduino with temperature safety monitoring',
  author: 'OTFLEX Team',
  license: 'MIT',
  tags: ['arduino', 'furnace', 'heating', 'temperature', 'safety'],
  
  hardware: {
    required: ['arduino'],
    optional: ['temperature_sensor'],
    connections: {
      arduino: {
        port: 'COM4',
        baudrate: 115200,
        timeout: 300,
      },
    },
  },
  
  capabilities: {
    furnace_control: true,
    temperature_monitoring: true,
    position_feedback: true,
    safety_interlocks: true,
  },
  
  safety: {
    temperature_limits: true,
    emergency_stop: true,
    position_verification: true,
  },
  
  performance: {
    typical_operation_time: '5-30s',
    max_temperature: '500°C',
    position_accuracy: '±1mm',
  },
};
