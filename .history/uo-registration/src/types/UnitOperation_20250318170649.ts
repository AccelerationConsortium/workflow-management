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

// 新的UO类别系统
export enum UnitOperationCategory {
  CHARACTERIZATION = 'characterization',   // 表征设备
  SYNTHESIS = 'synthesis',                 // 合成设备
  PROCESSING = 'processing',               // 加工处理
  MEASUREMENT = 'measurement',             // 测量设备
  CONTROL = 'control',                     // 控制设备
  UTILITY = 'utility'                      // 公用设施
}

// 标签系统
export interface UnitOperationTags {
  functionality: string[];    // 功能标签：如 'heating', 'mixing', 'analysis' 等
  domain: string[];          // 应用领域：如 'chemical', 'biological', 'material' 等
  scale: string[];           // 规模：如 'lab', 'pilot', 'industrial' 等
  customTags?: string[];     // 自定义标签
}

// 实验室枚举
export enum Laboratory {
  SDL1 = 'sdl1',
  SDL2 = 'sdl2',
  SDL3 = 'sdl3',
  SDL4 = 'sdl4',
  SDL5 = 'sdl5',
  SDL6 = 'sdl6'
}

// 参数方向(输入/输出)
export enum ParameterDirection {
  INPUT = 'input',
  OUTPUT = 'output'
}

// Base Unit Operation interface
export interface UnitOperation {
  id: string;
  name: string;
  type: UnitOperationType;
  category: UnitOperationCategory;
  description: string;
  status: UnitOperationStatus;
  applicableLabs: Laboratory[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Parameter definition for UO
export interface UnitOperationParameter {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: ParameterDirection; // 输入或输出参数
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

// 技术规格接口
export interface TechnicalSpecifications {
  specifications: SpecificationItem[];
  environmentalRequirements?: EnvironmentalRequirement[];
}

export interface SpecificationItem {
  name: string;
  value: string | number;
  unit?: string;
  type: 'range' | 'discrete' | 'boolean' | 'text';
  constraints?: {
    min?: number;
    max?: number;
    options?: string[];
    format?: string;
  };
}

export interface EnvironmentalRequirement {
  parameter: string;          // 如 'temperature', 'humidity' 等
  type: 'required' | 'recommended';
  range: {
    min: number;
    max: number;
    unit: string;
  };
  impact?: string;           // 描述超出范围的影响
}

// 接口定义
export interface InterfaceDefinition {
  id: string;
  name: string;
  dataType: string;           // 数据类型
  protocol?: string;          // 通信协议（如果需要）
  constraints?: any;          // 接口约束
}

// Generic Unit Operation (Template)
export interface GenericUnitOperation extends UnitOperation {
  type: UnitOperationType.GENERIC;
  parameters: UnitOperationParameter[];
  technicalSpecifications: TechnicalSpecifications;
  tags: UnitOperationTags;
  interfaces: {
    inputs: InterfaceDefinition[];
    outputs: InterfaceDefinition[];
  };
  safetyGuidelines: string;
  theoryBackground: string;
  operatingProcedure: string;
  equipmentRequirements: string[];
  maintenanceRequirements?: string;
  references?: string[];
  parentUnitOperationId?: string;
  subUnitOperations?: string[];
}

// Specific Unit Operation (Lab-specific implementation)
export interface SpecificUnitOperation extends UnitOperation {
  type: UnitOperationType.SPECIFIC;
  genericUnitOperationId: string;
  laboratoryId: Laboratory;
  location: string;
  parameterValues: UnitOperationParameterValue[];
  technicalSpecifications: TechnicalSpecifications;
  tags: UnitOperationTags;
  interfaces: {
    inputs: InterfaceDefinition[];
    outputs: InterfaceDefinition[];
  };
  equipmentIds: string[];
  additionalNotes?: string;
  contactPerson?: string;
  maintenanceSchedule?: string;
}

// Form data for creating/updating a UO
export interface UnitOperationFormData {
  name: string;
  type: UnitOperationType;
  category: UnitOperationCategory;
  description: string;
  status?: UnitOperationStatus;
  applicableLabs?: Laboratory[];
  
  // Technical Specifications
  technicalSpecifications?: {
    specifications: SpecificationItem[];
    environmentalRequirements?: EnvironmentalRequirement[];
  };
  
  // Tags
  tags?: UnitOperationTags;
  
  // Interfaces
  interfaces?: {
    inputs: InterfaceDefinition[];
    outputs: InterfaceDefinition[];
  };
  
  // Input & Output Parameters
  parameters?: UnitOperationParameter[];
  
  // Inheritance & Composition
  parentUnitOperationId?: string;
  subUnitOperations?: string[];
  
  // For Generic UO
  safetyGuidelines?: string;
  theoryBackground?: string;
  operatingProcedure?: string;
  equipmentRequirements?: string[];
  maintenanceRequirements?: string;
  references?: string[];
  
  // For Specific UO
  genericUnitOperationId?: string;
  laboratoryId?: Laboratory;
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
  applicableLabs?: string;
  [key: string]: string | undefined;
}

// 实验室详情类型
export interface LaboratoryDetails {
  id: Laboratory;
  name: string;
  description: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

// 新增的类型定义
export interface NodeCreationFormData {
  name: string;
  category: string;
  subCategory?: string;
  description: string;
  specifications: NodeSpecifications;
  parameters: NodeParameter[];
}

export interface NodeSpecifications {
  model?: string;
  manufacturer?: string;
  type?: string;
  range?: string;
  precision?: string;
  ports?: string;
  otherSpecs?: Record<string, string>;
}

export interface NodeParameter {
  name: string;
  type: string;
  unit?: string;
  description?: string;
  direction: string;
  required: boolean;
  minValue?: number;
  maxValue?: number;
  defaultValue?: string | number;
  options?: string[];
}

export interface NodeCreationError {
  name?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  specifications?: {
    model?: string;
    manufacturer?: string;
    type?: string;
    range?: string;
    precision?: string;
    ports?: string;
  };
  parameters?: {
    name?: string;
    type?: string;
    unit?: string;
    description?: string;
    direction?: string;
  }[];
} 
