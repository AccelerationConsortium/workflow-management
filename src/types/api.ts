import { UnitOperation } from './index';

// GET /api/unit-operations/templates
export interface GetTemplatesResponse {
  templates: UnitOperation[];
}

// GET /api/unit-operations/:id
export interface GetUnitOperationResponse {
  unitOperation: UnitOperation;
}

// PATCH /api/unit-operations/:id
export interface UpdateUnitOperationRequest {
  parameters?: {
    [key: string]: {
      value: number | string;
      unit?: string;
    }
  };
  environment?: {
    [key: string]: string;
  };
  // 其他可更新的字段...
}

export interface UpdateUnitOperationResponse {
  unitOperation: UnitOperation;
}

// POST /api/unit-operations/instances
export interface CreateInstanceRequest {
  templateId: string;
  uo_name?: string;
  parameters?: {
    [key: string]: {
      value: number | string;
      unit?: string;
    }
  };
  environment?: {
    [key: string]: string;
  };
}

export interface CreateInstanceResponse {
  unitOperation: UnitOperation;
} 