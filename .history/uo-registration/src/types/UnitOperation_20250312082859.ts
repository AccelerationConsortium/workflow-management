/**
 * Types for Unit Operation entities
 */

export interface TechnicalDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  url?: string;
}

// UO类型枚举
export enum UnitOperationType {
  GENERIC = 'generic',
  SPECIFIC = 'specific'
}

export enum UnitOperationStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export enum UnitOperationCategory {
  REACTION = 'reaction',
  SEPARATION = 'separation',
  HEAT_TRANSFER = 'heat_transfer',
  MASS_TRANSFER = 'mass_transfer',
  FLUID_FLOW = 'fluid_flow',
  OTHERS = 'others'
}

// Base Unit Operation interface
export interface UnitOperation {
  id: string;
  name: string;
  type: UnitOperationType;
  category: UnitOperationCategory;
  description: string;
  status: UnitOperationStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Generic Unit Operation (Template)
export interface GenericUnitOperation extends UnitOperation {
  type: UnitOperationType.GENERIC;
  parameters: UnitOperationParameter[];
  safetyGuidelines: string;
  theoryBackground: string;
  operatingProcedure: string;
  equipmentRequirements: string[];
  maintenanceRequirements?: string;
  references?: string[];
}

// Specific Unit Operation (Lab-specific implementation)
export interface SpecificUnitOperation extends UnitOperation {
  type: UnitOperationType.SPECIFIC;
  genericUnitOperationId: string;  // Reference to the generic UO it's derived from
  laboratoryId: string;            // Which laboratory this specific UO belongs to
  location: string;                // Specific location within the laboratory
  parameterValues: UnitOperationParameterValue[];
  equipmentIds: string[];          // Specific equipment instances used
  additionalNotes?: string;        // Any lab-specific notes
  contactPerson?: string;          // Person responsible for this UO in the lab
  maintenanceSchedule?: string;    // Lab-specific maintenance info
}

// Parameter definition for Generic UO
export interface UnitOperationParameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  required: boolean;
  defaultValue?: string | number;
  minValue?: number;
  maxValue?: number;
  options?: string[];  // For enum-type parameters
  parameterType: 'string' | 'number' | 'boolean' | 'enum' | 'date';
}

// Parameter values for Specific UO
export interface UnitOperationParameterValue {
  parameterId: string;  // References a parameter from the generic UO
  value: string | number | boolean;
}

// Form data for creating/updating a UO
export interface UnitOperationFormData {
  name: string;
  type: UnitOperationType;
  category: UnitOperationCategory;
  description: string;
  status?: UnitOperationStatus;
  
  // For Generic UO
  parameters?: UnitOperationParameter[];
  safetyGuidelines?: string;
  theoryBackground?: string;
  operatingProcedure?: string;
  equipmentRequirements?: string[];
  maintenanceRequirements?: string;
  references?: string[];
  
  // For Specific UO
  genericUnitOperationId?: string;
  laboratoryId?: string;
  location?: string;
  parameterValues?: UnitOperationParameterValue[];
  equipmentIds?: string[];
  additionalNotes?: string;
  contactPerson?: string;
  maintenanceSchedule?: string;
}

export interface UnitOperationError {
  name?: string;
  description?: string;
  category?: string;
  [key: string]: string | undefined;
}

// 实验室类型
export interface Laboratory {
  id: string;
  name: string;
  description: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
} 
