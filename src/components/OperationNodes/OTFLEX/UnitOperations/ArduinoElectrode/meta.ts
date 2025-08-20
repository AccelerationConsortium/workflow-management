export const metadata = {
  name: 'Arduino Electrode Switch',
  version: '1.0.0',
  category: 'OTFLEX',
  subcategory: 'Electrochemical',
  description: 'Switch between 2-electrode and 3-electrode systems with continuity verification',
  author: 'OTFLEX Team',
  license: 'MIT',
  tags: ['arduino', 'electrode', 'electrochemical', 'switch', 'continuity'],
  
  hardware: {
    required: ['arduino'],
    optional: ['multimeter'],
    connections: {
      arduino: {
        port: 'COM4',
        baudrate: 115200,
        timeout: 300,
      },
    },
  },
  
  capabilities: {
    electrode_switching: true,
    continuity_testing: true,
    isolation_checking: true,
    resistance_measurement: true,
  },
  
  safety: {
    electrical_isolation: true,
    leakage_monitoring: true,
    continuity_verification: true,
  },
  
  performance: {
    typical_switch_time: '1-5s',
    resistance_accuracy: '±10Ω',
    isolation_sensitivity: '0.01mA',
  },
};
