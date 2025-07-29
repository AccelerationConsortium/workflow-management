export const meta = {
  id: 'sdl1-hardware-washing',
  name: 'Hardware Washing',
  category: 'SDL1',
  subcategory: 'Cleaning & Maintenance',
  description: 'Automated washing of reactor cells using flush tool and Arduino-controlled pumps',
  version: '1.0.0',
  author: 'SDL1 Team',
  tags: ['washing', 'cleaning', 'pumps', 'ultrasonic', 'arduino'],
  
  capabilities: {
    automated_washing: true,
    pump_control: true,
    ultrasonic_cleaning: true,
    flush_tool_handling: true,
  },
  
  hardware_requirements: {
    opentrons: true,
    arduino: true,
    pumps: ['pump_1', 'pump_2'],
    ultrasonic: true,
    pipettes: ['p1000_single_gen2'],  // For flush tool handling
    labware: ['electrode_rack', 'nis_reactor'],
  },
  
  washing_sequence: {
    steps: [
      'Pick up flush tool',
      'Insert into reactor cell',
      'Initial drain (Pump 2)',
      'Rinse with clean solution (Pump 1)',
      'Ultrasonic cleaning',
      'Final rinse and drain (Pump 2)',
      'Remove and return flush tool'
    ],
  },
  
  workflow_context: {
    typical_sequence: [
      'Electrochemical Measurement',
      'Electrode Manipulation (remove)',
      'Hardware Washing',
      'Ready for next sample'
    ],
    dependencies: ['Completed electrochemical measurement'],
    outputs: ['Clean reactor cell ready for next experiment'],
  },
};