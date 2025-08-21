export const metadata = {
  id: 'otflex-transfer',
  name: 'OTFlex Transfer',
  category: 'OTFLEX',
  subcategory: 'Liquid Handling',
  description: 'Automated liquid transfer using Opentrons Flex liquid handling system',
  version: '1.0.0',
  author: 'OTFLEX Team',
  tags: ['otflex', 'transfer', 'liquid-handling', 'pipetting', 'automation'],
  
  capabilities: {
    precise_pipetting: true,
    multiple_volumes: true,
    tip_tracking: true,
    liquid_detection: true,
    air_gap_control: true,
  },
  
  hardware_requirements: {
    opentrons_flex: true,
    pipettes: ['p1000_single_flex', 'p50_single_flex', 'p1000_multi_flex', 'p50_multi_flex'],
    labware: ['source_labware', 'dest_labware', 'tip_rack'],
  },
  
  safety_features: {
    liquid_detection: true,
    tip_tracking: true,
    volume_verification: true,
    contamination_prevention: true,
  },
  
  workflow_context: {
    typical_sequence: [
      'Sample Preparation',
      'OTFlex Transfer',
      'Mixing or Reaction',
      'Analysis'
    ],
    dependencies: ['Opentrons Flex setup', 'Labware loaded'],
    outputs: ['Transferred liquid', 'Transfer log data'],
  },
};
