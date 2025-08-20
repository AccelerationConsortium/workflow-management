export const metadata = {
  id: 'otflex-arduino-temperature',
  name: 'Arduino Temperature',
  category: 'OTFLEX',
  subcategory: 'Arduino Control',
  description: 'Control temperature using Arduino-connected heater with PID control',
  version: '1.0.0',
  author: 'OTFLEX Team',
  tags: ['arduino', 'temperature', 'heater', 'pid', 'control'],
  
  capabilities: {
    temperature_setting: true,
    temperature_ramping: true,
    pid_control: true,
    temperature_monitoring: true,
    safety_limits: true,
  },
  
  hardware_requirements: {
    arduino: true,
    heater_controller: true,
    temperature_sensor: true,
    pid_controller: false, // Optional, can use software PID
  },
  
  safety_features: {
    temperature_monitoring: true,
    safety_max_temp: true,
    emergency_shutdown: true,
    stability_verification: true,
  },
  
  workflow_context: {
    typical_sequence: [
      'Sample Preparation',
      'Arduino Temperature (set)',
      'Wait for Stability',
      'Reaction or Analysis'
    ],
    dependencies: ['Arduino connection', 'Heater hardware setup'],
    outputs: ['Temperature data', 'Stability confirmation'],
  },
};
