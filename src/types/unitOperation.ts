export interface UnitOperation {
  uo_name: string;
  description: string;
  inputs: {
    [key: string]: {
      type: string;
      unit?: string;
      initial_value?: number | string;
    }
  };
  parameters: {
    [key: string]: {
      value: number | string;
      unit?: string;
    }
  };
  outputs: {
    [key: string]: {
      type: string;
      description: string;
    }
  };
  constraints: {
    [key: string]: boolean | string;
  };
  hardware: string;
  software: {
    [key: string]: {
      version: string;
      dependencies?: string[];
    }
  };
  control_details: string;
  environment: {
    [key: string]: string;
  };
  analysis: string;
  customization: string;
} 