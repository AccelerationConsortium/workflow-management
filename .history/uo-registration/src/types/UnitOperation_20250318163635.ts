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

// 主要类别
export enum UnitOperationCategory {
  REACTION = 'reaction',
  SEPARATION = 'separation',
  HEAT_TRANSFER = 'heat_transfer',
  MASS_TRANSFER = 'mass_transfer',
  FLUID_FLOW = 'fluid_flow',
  OTHERS = 'others'
}

// 子类别
export enum UnitOperationSubCategory {
  // 反应类别
  BATCH_REACTOR = 'batch_reactor',
  CONTINUOUS_REACTOR = 'continuous_reactor',
  CATALYTIC_REACTOR = 'catalytic_reactor',
  FERMENTATION = 'fermentation',
  
  // 分离类别
  DISTILLATION = 'distillation',
  EXTRACTION = 'extraction',
  ABSORPTION = 'absorption',
  FILTRATION = 'filtration',
  CRYSTALLIZATION = 'crystallization',
  
  // 传热类别
  HEAT_EXCHANGER = 'heat_exchanger',
  EVAPORATOR = 'evaporator',
  CONDENSER = 'condenser',
  
  // 传质类别
  ABSORPTION_COLUMN = 'absorption_column',
  ADSORPTION = 'adsorption',
  MEMBRANE_SEPARATION = 'membrane_separation',
  
  // 流体流动类别
  PUMPING = 'pumping',
  COMPRESSION = 'compression',
  PIPING = 'piping',
  
  // 其他
  MIXING = 'mixing',
  GRINDING = 'grinding',
  CUSTOM = 'custom'
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
  subCategory?: UnitOperationSubCategory;
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
  capacity: string;
  operatingTemperature: string;
  operatingPressure: string;
  otherSpecifications?: Record<string, string>; // 其他可能的技术规格
}

// 工作流兼容性
export interface WorkflowCompatibility {
  applicableWorkflows: string[];  // 适用的工作流ID列表
  requiresFileUpload: boolean;    // 是否需要文件上传支持
}

// Generic Unit Operation (Template)
export interface GenericUnitOperation extends UnitOperation {
  type: UnitOperationType.GENERIC;
  parameters: UnitOperationParameter[];
  technicalSpecifications: TechnicalSpecifications;
  safetyGuidelines: string;
  theoryBackground: string;
  operatingProcedure: string;
  equipmentRequirements: string[];
  maintenanceRequirements?: string;
  references?: string[];
  workflowCompatibility?: WorkflowCompatibility;
  parentUnitOperationId?: string; // 父UO的ID，如果继承自另一个UO
  subUnitOperations?: string[];   // 子UO的ID列表，表示组合关系
}

// Specific Unit Operation (Lab-specific implementation)
export interface SpecificUnitOperation extends UnitOperation {
  type: UnitOperationType.SPECIFIC;
  genericUnitOperationId: string;  // Reference to the generic UO it's derived from
  laboratoryId: Laboratory;        // Which laboratory this specific UO belongs to
  location: string;                // Specific location within the laboratory
  parameterValues: UnitOperationParameterValue[];
  technicalSpecifications: TechnicalSpecifications;
  equipmentIds: string[];          // Specific equipment instances used
  additionalNotes?: string;        // Any lab-specific notes
  contactPerson?: string;          // Person responsible for this UO in the lab
  maintenanceSchedule?: string;    // Lab-specific maintenance info
  workflowCompatibility?: WorkflowCompatibility;
}

// Form data for creating/updating a UO
export interface UnitOperationFormData {
  name: string;
  type: UnitOperationType;
  category: UnitOperationCategory;
  subCategory?: UnitOperationSubCategory;
  description: string;
  status?: UnitOperationStatus;
  applicableLabs?: Laboratory[];
  
  // Technical Specifications
  technicalSpecifications?: {
    capacity?: string;
    operatingTemperature?: string;
    operatingPressure?: string;
    otherSpecifications?: Record<string, string>;
  };
  
  // Input & Output Parameters
  parameters?: UnitOperationParameter[];
  
  // Inheritance & Composition
  parentUnitOperationId?: string;
  subUnitOperations?: string[];
  
  // Workflow Compatibility
  workflowCompatibility?: {
    applicableWorkflows?: string[];
    requiresFileUpload?: boolean;
  };
  
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
  subCategory?: string;
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

// 节点原语操作定义
export interface NodePrimitive {
  id: string;
  name: string;
  description: string;
  order: number;
  pythonCode: string;
  parameters: {
    name: string;
    type: string;
    default?: any;
    description: string;
  }[];
}

// 节点规格定义
export interface NodeSpecifications {
  model: string;
  manufacturer: string;
  type: string;
  range?: string;
  precision?: string;
  ports?: string;
  otherSpecs?: Record<string, string>;
}

// 工作流节点定义
export interface WorkflowNode extends UnitOperation {
  specs: NodeSpecifications;
  parameters: UnitOperationParameter[];
  inputs: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  outputs: {
    id: string;
    label: string;
    type: string;
    description: string;
  }[];
  primitives: NodePrimitive[];
}

// 节点创建表单数据
export interface NodeCreationFormData {
  // 基本信息
  name: string;
  label: string;
  description: string;
  category: UnitOperationCategory;
  subCategory?: UnitOperationSubCategory;
  
  // 硬件规格
  specs: NodeSpecifications;
  
  // 参数配置
  parameters: UnitOperationParameter[];
  
  // 输入输出
  inputs: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  outputs: {
    id: string;
    label: string;
    type: string;
    description: string;
  }[];
  
  // 原语操作
  primitives: NodePrimitive[];
  
  // 文档
  documentation?: {
    safetyGuidelines?: string;
    operatingProcedure?: string;
    maintenanceRequirements?: string;
    references?: string[];
  };
}

// 节点创建验证错误
export interface NodeCreationError {
  name?: string;
  label?: string;
  description?: string;
  category?: string;
  specs?: {
    model?: string;
    manufacturer?: string;
    type?: string;
  };
  parameters?: string[];
  inputs?: string[];
  outputs?: string[];
  primitives?: string[];
  [key: string]: any;
} 
