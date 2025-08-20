export const metadata = {
  id: 'otflex-arduino-pump',
  name: 'Arduino Pump',
  category: 'OTFLEX',
  subcategory: 'Arduino Control',
  description: 'Control Arduino-connected pump for precise liquid dispensing',
  version: '1.0.0',
  author: 'OTFLEX Team',
  tags: ['arduino', 'pump', 'liquid', 'dispensing', 'hardware'],
  
  capabilities: {
    volume_dispensing: true,
    timed_operation: true,
    flow_monitoring: true,
    pressure_control: true,
    bidirectional_flow: true,
  },
  
  hardware_requirements: {
    arduino: true,
    pump_controller: true,
    flow_sensor: false, // Optional
    pressure_sensor: false, // Optional
  },
  
  safety_features: {
    pressure_monitoring: true,
    emergency_stop: true,
    flow_verification: true,
    timeout_protection: true,
  },
  
  workflow_context: {
    typical_sequence: [
      'Sample Preparation',
      'Arduino Pump (dispense)',
      'Mixing or Reaction',
      'Analysis'
    ],
    dependencies: ['Arduino connection', 'Pump hardware setup'],
    outputs: ['Dispensed liquid volume', 'Flow rate data'],
  },
};
