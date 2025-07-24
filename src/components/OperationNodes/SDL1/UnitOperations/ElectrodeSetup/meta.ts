export const metadata = {
  name: 'Electrode Setup',
  description: 'Electrode installation and positioning for electrochemical experiments',
  category: 'electrode',
  version: '1.0.0',
  author: 'SDL1 Team',
  tags: ['electrode', 'positioning', 'setup', 'electrochemistry'],
  capabilities: [
    'Multiple electrode types support',
    'Precise positioning control',
    'Depth control',
    'Lateral offset configuration',
    'Position verification',
  ],
  limitations: [
    'Single electrode operation per execution',
    'Limited to predefined electrode positions',
    'Manual electrode connection required',
  ],
  primitiveOperations: [
    'pick_electrode',
    'move_to_well',
    'insert_electrode',
    'secure_electrode',
    'verify_position',
    'wait',
  ],
  requiredResources: [
    'Electrode gripper mechanism',
    'Reference, counter, or working electrodes',
    'Electrode storage rack',
    'Target reaction well',
  ],
};