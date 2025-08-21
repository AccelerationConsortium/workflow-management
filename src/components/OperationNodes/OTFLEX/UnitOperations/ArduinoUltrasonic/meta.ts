export const metadata = {
  id: 'otflex-arduino-ultrasonic',
  name: 'Arduino Ultrasonic',
  category: 'OTFLEX',
  subcategory: 'Arduino Control',
  description: 'Control ultrasonic module via Arduino for sonication and cleaning',
  version: '1.0.0',
  author: 'OTFLEX Team',
  tags: ['arduino', 'ultrasonic', 'sonication', 'cleaning', 'frequency'],
  
  capabilities: {
    continuous_operation: true,
    pulsed_operation: true,
    frequency_sweep: true,
    power_control: true,
    monitoring: true,
  },
  
  hardware_requirements: {
    arduino: true,
    ultrasonic_generator: true,
    ultrasonic_transducer: true,
    power_amplifier: false, // Optional
  },
  
  safety_features: {
    power_monitoring: true,
    temperature_monitoring: true,
    timeout_protection: true,
    emergency_stop: true,
  },
  
  workflow_context: {
    typical_sequence: [
      'Sample Preparation',
      'Arduino Ultrasonic (sonication)',
      'Wait for Completion',
      'Analysis or Next Step'
    ],
    dependencies: ['Arduino connection', 'Ultrasonic hardware setup'],
    outputs: ['Sonication data', 'Power consumption data'],
  },
};
