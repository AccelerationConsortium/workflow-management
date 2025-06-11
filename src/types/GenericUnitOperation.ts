/**
 * Generic Unit Operation Types
 */

export enum UOCategory {
  ROBOTIC_MANIPULATION = 'ROBOTIC_MANIPULATION',
  LIQUID_HANDLING = 'LIQUID_HANDLING',
  TEMPERATURE_CONTROL = 'TEMPERATURE_CONTROL',
  ANALYSIS_MEASUREMENT = 'ANALYSIS_MEASUREMENT',
  MATERIAL_HANDLING = 'MATERIAL_HANDLING',
  COMPUTATIONAL = 'COMPUTATIONAL'
}

export enum UOType {
  // Robotic Manipulation
  PICK_AND_PLACE = 'PICK_AND_PLACE',
  MIXING = 'MIXING',

  // Liquid Handling
  LIQUID_TRANSFER = 'LIQUID_TRANSFER',
  DILUTION = 'DILUTION',
  SERIAL_DILUTION = 'SERIAL_DILUTION',
  MIXING_LIQUID = 'MIXING_LIQUID',

  // Temperature Control
  THERMAL_CYCLING = 'THERMAL_CYCLING',
  INCUBATION = 'INCUBATION',
  COOLING = 'COOLING',

  // Analysis & Measurement
  SPECTRAL_ANALYSIS = 'SPECTRAL_ANALYSIS',
  IMAGING = 'IMAGING',
  WEIGHT_MEASUREMENT = 'WEIGHT_MEASUREMENT',
  PH_MEASUREMENT = 'PH_MEASUREMENT',

  // Material Handling
  CENTRIFUGATION = 'CENTRIFUGATION',
  STORAGE = 'STORAGE',
  SOLID_TRANSFER = 'SOLID_TRANSFER',
  GAS_HANDLING = 'GAS_HANDLING',

  // Computational
  DATA_PROCESSING = 'DATA_PROCESSING',
  SIMULATION = 'SIMULATION',
  AI_MODEL_TRAINING = 'AI_MODEL_TRAINING'
}

// Base parameter interfaces
export interface BaseParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

// Device specific interfaces
export interface DeviceRequirement {
  category: string;
  type: string[];
  capabilities: string[];
}

// Generic Unit Operation interface
export interface GenericUnitOperation {
  id: string;
  name: string;
  category: UOCategory;
  type: UOType;
  description: string;
  version: string;
  parameters: BaseParameter[];
  deviceRequirements: DeviceRequirement[];
  inputPorts: {
    name: string;
    dataType: string;
    description: string;
  }[];
  outputPorts: {
    name: string;
    dataType: string;
    description: string;
  }[];
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
  };
}

// Parameter templates for different UO types
export const UOParameterTemplates: Record<UOType, BaseParameter[]> = {
  [UOType.PICK_AND_PLACE]: [
    {
      name: 'sourcePosition',
      type: 'object',
      required: true,
      description: 'Source coordinates (x, y, z)',
      validation: {
        pattern: '^{x: number, y: number, z: number}$'
      }
    },
    {
      name: 'targetPosition',
      type: 'object',
      required: true,
      description: 'Target coordinates (x, y, z)',
      validation: {
        pattern: '^{x: number, y: number, z: number}$'
      }
    },
    {
      name: 'objectType',
      type: 'string',
      required: true,
      description: 'Type of object to manipulate',
      validation: {
        options: ['tube', 'plate', 'tip', 'container']
      }
    }
  ],
  [UOType.MIXING]: [],
  [UOType.LIQUID_TRANSFER]: [],
  [UOType.DILUTION]: [],
  [UOType.SERIAL_DILUTION]: [],
  [UOType.MIXING_LIQUID]: [],
  [UOType.THERMAL_CYCLING]: [],
  [UOType.INCUBATION]: [],
  [UOType.COOLING]: [],
  [UOType.SPECTRAL_ANALYSIS]: [],
  [UOType.IMAGING]: [],
  [UOType.WEIGHT_MEASUREMENT]: [],
  [UOType.PH_MEASUREMENT]: [],
  [UOType.CENTRIFUGATION]: [],
  [UOType.STORAGE]: [],
  [UOType.SOLID_TRANSFER]: [],
  [UOType.GAS_HANDLING]: [],
  [UOType.DATA_PROCESSING]: [],
  [UOType.SIMULATION]: [],
  [UOType.AI_MODEL_TRAINING]: []
} as const; 
