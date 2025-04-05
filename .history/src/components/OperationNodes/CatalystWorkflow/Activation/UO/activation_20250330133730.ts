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
    'PEIS',
    'CV_redox'
  ],
  
  // Default enabled primitives when UO is first loaded
  defaultEnabledPrimitives: [
    'CV_activation',
    'CVA',
    'CV_redox'
  ],
  
  // Default parameter values for each primitive
  defaultParameters: {
    CV_activation: Object.entries(defaultPrimitives.CV_activation.parameters).reduce((acc, [key, param]) => {
      acc[key] = {
        ...param,
        source: 'default',
        timestamp: new Date(),
      };
      return acc;
    }, {} as Record<string, any>),
    CVA: Object.entries(defaultPrimitives.CVA.parameters).reduce((acc, [key, param]) => {
      acc[key] = {
        ...param,
        source: 'default',
        timestamp: new Date(),
      };
      return acc;
    }, {} as Record<string, any>),
    PEIS: Object.entries(defaultPrimitives.PEIS.parameters).reduce((acc, [key, param]) => {
      acc[key] = {
        ...param,
        source: 'default',
        timestamp: new Date(),
      };
      return acc;
    }, {} as Record<string, any>),
    CV_redox: Object.entries(defaultPrimitives.CV_redox.parameters).reduce((acc, [key, param]) => {
      acc[key] = {
        ...param,
        source: 'default',
        timestamp: new Date(),
      };
      return acc;
    }, {} as Record<string, any>)
  },
  
  // Validation rules for primitive combinations
  validationRules: {
    minPrimitives: 2,  // Must have at least 2 primitives enabled
    requiredPrimitives: ['CV_activation'],  // CV_activation must be enabled
    incompatiblePrimitives: []  // No incompatible primitives
  }
}; 
