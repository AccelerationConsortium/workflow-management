export const meta = {
  id: 'sdl1-sample-preparation',
  name: 'Sample Preparation',
  category: 'SDL1',
  subcategory: 'Sample Handling',
  description: 'Prepare samples with conditional additives based on experimental design',
  version: '1.0.0',
  author: 'SDL1 Team',
  tags: ['sample', 'preparation', 'additives', 'mixing'],
  
  capabilities: {
    conditional_additives: true,
    volume_calculation: true,
    multi_transfer: true,
    csv_driven: true,
  },
  
  hardware_requirements: {
    opentrons: true,
    pipettes: ['p1000_single_gen2'],
    labware: ['vial_rack', 'nis_reactor', 'tip_rack'],
  },
  
  workflow_context: {
    typical_sequence: [
      'Experiment Setup',
      'Sample Preparation',
      'Electrode Setup',
      'Electrochemical Measurement',
      'Wash/Cleaning'
    ],
    dependencies: ['CSV data with additive flags'],
    outputs: ['Prepared sample in reactor cell'],
  },
};