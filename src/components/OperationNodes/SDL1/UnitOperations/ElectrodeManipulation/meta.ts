export const meta = {
  id: 'sdl1-electrode-manipulation',
  name: 'Electrode Manipulation',
  category: 'SDL1',
  subcategory: 'Electrode Handling',
  description: 'Handle electrode pickup, insertion, removal, and return operations',
  version: '1.0.0',
  author: 'SDL1 Team',
  tags: ['electrode', 'manipulation', 'insertion', 'removal'],
  
  capabilities: {
    electrode_pickup: true,
    precise_insertion: true,
    safe_removal: true,
    multiple_electrode_types: true,
  },
  
  hardware_requirements: {
    opentrons: true,
    pipettes: ['p1000_single_gen2'],  // Used as electrode holder
    labware: ['electrode_rack', 'nis_reactor'],
  },
  
  safety_features: {
    slow_insertion_speed: true,
    approach_positions: true,
    offset_control: true,
  },
  
  workflow_context: {
    typical_sequence: [
      'Sample Preparation',
      'Electrode Manipulation (pickup)',
      'Electrode Manipulation (insert)',
      'Electrochemical Measurement',
      'Electrode Manipulation (remove)',
      'Electrode Manipulation (return)'
    ],
    dependencies: ['Prepared sample in reactor'],
    outputs: ['Electrode positioned for measurement'],
  },
};