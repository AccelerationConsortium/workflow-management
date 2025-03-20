/**
 * Generic Unit Operation Type Definitions
 * This file defines the structure and types for generic unit operations
 * that can be customized by users to create specific unit operations.
 */

// Unit Operation Categories
export enum UOCategory {
  ROBOTIC_MANIPULATION = 'Robotic Manipulation',
  LIQUID_HANDLING = 'Liquid Handling',
  TEMPERATURE_CONTROL = 'Temperature Control',
  ANALYSIS_MEASUREMENT = 'Analysis & Measurement',
  MATERIAL_HANDLING = 'Material Handling',
  COMPUTATIONAL = 'Computational & Data Processing'
}

// Unit Operation Types
export enum UOType {
  // Robotic Manipulation
  PICK_AND_PLACE = 'Pick and Place',
  SORTING = 'Sorting',
  ASSEMBLY = 'Assembly',
  
  // Liquid Handling
  LIQUID_TRANSFER = 'Liquid Transfer',
  DILUTION = 'Dilution',
  MIXING = 'Mixing',
  DISPENSING = 'Dispensing',
  
  // Temperature Control
  HEATING = 'Heating',
  COOLING = 'Cooling',
  TEMPERATURE_CYCLING = 'Temperature Cycling',
  
  // Analysis & Measurement
  SPECTROSCOPY = 'Spectroscopy',
  WEIGHING = 'Weighing',
  IMAGING = 'Imaging',
  PH_MEASUREMENT = 'pH Measurement',
  
  // Material Handling
  CENTRIFUGATION = 'Centrifugation',
  FILTRATION = 'Filtration',
  STORAGE = 'Storage',
  
  // Computational
  DATA_ANALYSIS = 'Data Analysis',
  OPTIMIZATION = 'Optimization',
  MODELING = 'Modeling'
}

// Base Parameter Interface
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

// Device Requirement Interface
export interface DeviceRequirement {
  type: string;
  model?: string;
  capabilities: string[];
  parameters: BaseParameter[];
}

// Generic Unit Operation Interface
export interface GenericUnitOperation {
  id: string;
  name: string;
  category: UOCategory;
  type: UOType;
  description: string;
  parameters: BaseParameter[];
  deviceRequirements: DeviceRequirement[];
  safetyRequirements?: string[];
  standardOperatingProcedure?: string;
}

// Parameter Templates for each UO Type
export const UOParameterTemplates: Record<UOType, BaseParameter[]> = {
  [UOType.PICK_AND_PLACE]: [
    {
      name: 'sourcePosition',
      type: 'object',
      required: true,
      description: 'Source position coordinates (x, y, z)',
      validation: {
        pattern: '^{x: number, y: number, z: number}$'
      }
    },
    {
      name: 'targetPosition',
      type: 'object',
      required: true,
      description: 'Target position coordinates (x, y, z)',
      validation: {
        pattern: '^{x: number, y: number, z: number}$'
      }
    },
    {
      name: 'speed',
      type: 'number',
      required: false,
      description: 'Movement speed (mm/s)',
      defaultValue: 100,
      validation: {
        min: 0,
        max: 1000
      }
    }
  ],
  [UOType.LIQUID_TRANSFER]: [
    {
      name: 'sourceContainer',
      type: 'string',
      required: true,
      description: 'Source container identifier'
    },
    {
      name: 'targetContainer',
      type: 'string',
      required: true,
      description: 'Target container identifier'
    },
    {
      name: 'volume',
      type: 'number',
      required: true,
      description: 'Volume to transfer (µL)',
      validation: {
        min: 0,
        max: 10000
      }
    },
    {
      name: 'flowRate',
      type: 'number',
      required: false,
      description: 'Flow rate (µL/s)',
      defaultValue: 100,
      validation: {
        min: 0,
        max: 1000
      }
    }
  ],
  [UOType.TEMPERATURE_CYCLING]: [
    {
      name: 'cycles',
      type: 'array',
      required: true,
      description: 'Temperature cycling steps',
      validation: {
        pattern: '^Array<{temperature: number, duration: number}>$'
      }
    },
    {
      name: 'rampRate',
      type: 'number',
      required: false,
      description: 'Temperature ramping rate (°C/min)',
      defaultValue: 2,
      validation: {
        min: 0,
        max: 10
      }
    }
  ],
  // Add more templates as needed...
} as const;

// Export default parameter templates for all UO types
export const DefaultParameterTemplates = UOParameterTemplates; 
