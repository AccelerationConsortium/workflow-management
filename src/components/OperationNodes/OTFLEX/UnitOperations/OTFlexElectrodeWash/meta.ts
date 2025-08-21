export const metadata = {
  id: 'otflex-electrode-wash',
  name: 'OTFlex Electrode Wash',
  category: 'OTFLEX',
  subcategory: 'Liquid Handling',
  description: 'Automated electrode washing using Opentrons Flex liquid handling system',
  version: '1.0.0',
  author: 'OTFLEX Team',
  tags: ['otflex', 'electrode', 'wash', 'cleaning', 'liquid-handling'],
  
  capabilities: {
    automated_washing: true,
    multiple_wash_cycles: true,
    rinse_cycles: true,
    air_drying: true,
    cleanliness_verification: true,
  },
  
  hardware_requirements: {
    opentrons_flex: true,
    pipettes: ['p1000_single_flex', 'p50_single_flex'],
    labware: ['wash_reservoir', 'rinse_reservoir', 'waste_container', 'tip_rack'],
  },
  
  safety_features: {
    liquid_detection: true,
    tip_tracking: true,
    waste_monitoring: true,
    contamination_prevention: true,
  },
  
  workflow_context: {
    typical_sequence: [
      'Electrochemical Measurement',
      'OTFlex Electrode Wash',
      'Electrode Verification',
      'Next Measurement'
    ],
    dependencies: ['Opentrons Flex setup', 'Wash solutions prepared'],
    outputs: ['Clean electrode', 'Wash log data'],
  },
};
