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
  GENERIC = 'GENERIC',    // 通用UO
  SPECIFIC = 'SPECIFIC'   // 实验特定UO
}

// 基础UO接口
export interface UnitOperationBase {
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

// 通用UO
export interface GenericUnitOperation extends UnitOperationBase {
  type: UnitOperationType.GENERIC;
  defaultParameters: OperationParameter[];
}

// 实验特定UO
export interface SpecificUnitOperation extends UnitOperationBase {
  type: UnitOperationType.SPECIFIC;
  baseGenericUnitOperationId: string;  // 基于哪个通用UO
  laboratoryId: string;  // 所属实验室ID
  customParameters: OperationParameter[];
}

// 联合类型
export type UnitOperation = GenericUnitOperation | SpecificUnitOperation;

// 操作参数
export interface OperationParameter {
  id: string;
  name: string;
  description: string;
  dataType: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'DATE' | 'ENUM';
  required: boolean;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];  // 用于ENUM类型
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
  type: UnitOperationType;
  baseGenericUnitOperationId?: string;
  laboratoryId?: string;
  defaultParameters?: OperationParameter[];
  customParameters?: OperationParameter[];
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
