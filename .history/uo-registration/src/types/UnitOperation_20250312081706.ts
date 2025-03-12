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

export interface UnitOperation {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  capacity: string;
  operationTemperature: string;
  operationPressure: string;
  maintenanceSchedule: string;
  safetyProcedures: string;
  technicalDocuments: TechnicalDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface UnitOperationFormData {
  name: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  capacity: string;
  operationTemperature: string;
  operationPressure: string;
  maintenanceSchedule: string;
  safetyProcedures: string;
}

export interface UnitOperationError {
  name?: string;
  description?: string;
  category?: string;
  [key: string]: string | undefined;
}

export type UnitOperationCategory = 
  | 'Separation'
  | 'Chemical Reaction'
  | 'Energy Transfer'
  | 'Fluid Flow'
  | 'Mixing'
  | 'Size Reduction'
  | 'Size Enlargement'; 
