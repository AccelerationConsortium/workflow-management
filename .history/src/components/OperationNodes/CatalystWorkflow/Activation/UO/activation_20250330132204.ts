import { UnitOperationConfig } from '../types';
import { defaultPrimitives } from '../primitives';

export const ActivationUO: UnitOperationConfig = {
  name: 'Activation',
  description: 'Standard 3-step catalyst activation',
  version: '1.0.0',
  category: 'catalyst',
  
  // All available primitives that can be used in this UO
  availablePrimitives: [
    'CV_activation',
    'CVA',
    'CV_redox',
    'CV_optional'  // Additional optional primitive
  ],
  
  // Default enabled primitives when UO is first loaded
  defaultEnabledPrimitives: [
    'CV_activation',
    'CVA',
    'CV_redox'
  ],
  
  // Default parameter values for each primitive
  defaultParameters: {
    CV_activation: {
      ...defaultPrimitives.CV_activation.parameters
    },
    CVA: {
      ...defaultPrimitives.CVA.parameters
    },
    CV_redox: {
      ...defaultPrimitives.CV_redox.parameters
    },
    CV_optional: {
      ...defaultPrimitives.CV_redox.parameters  // Using same defaults as CV_redox
    }
  },
  
  // Validation rules for primitive combinations
  validationRules: {
    minPrimitives: 2,  // Must have at least 2 primitives enabled
    requiredPrimitives: ['CV_activation'],  // CV_activation must be enabled
    incompatiblePrimitives: [
      ['CV_redox', 'CV_optional']  // Cannot enable both at the same time
    ]
  }
}; 
