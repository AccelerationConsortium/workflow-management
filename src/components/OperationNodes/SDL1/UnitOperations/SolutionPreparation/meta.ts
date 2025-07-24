export const metadata = {
  name: 'Solution Preparation',
  description: 'Automated solution preparation and dispensing for electrochemical experiments',
  category: 'solution-prep',
  version: '1.0.0',
  author: 'SDL1 Team',
  tags: ['liquid-handling', 'preparation', 'dispensing', 'electrochemistry'],
  capabilities: [
    'Multi-labware support',
    'Precise volume control',
    'Offset configuration',
    'Error handling',
    'Logging support',
  ],
  limitations: [
    'Single pipette operation per execution',
    'No mixing or stirring capabilities',
    'Volume limited by pipette capacity',
  ],
  primitiveOperations: [
    'select_pipette',
    'aspirate_solution',
    'move_to_target',
    'dispense_solution',
    'drop_tip',
    'wait',
  ],
  requiredResources: [
    'Pipette (P20, P300, or P1000)',
    'Source labware with solution',
    'Target labware',
    'Pipette tips',
  ],
};