// GET /api/unit-operations/templates
interface GetTemplatesResponse {
  templates: UnitOperation[];
}

// GET /api/unit-operations/:id
interface GetUnitOperationResponse {
  unitOperation: UnitOperation;
}

// PATCH /api/unit-operations/:id
interface UpdateUnitOperationRequest {
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

interface UpdateUnitOperationResponse {
  unitOperation: UnitOperation;
}

// POST /api/unit-operations/instances
interface CreateInstanceRequest {
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

interface CreateInstanceResponse {
  unitOperation: UnitOperation;
} 