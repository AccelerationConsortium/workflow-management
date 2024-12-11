interface NodeParameter {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'range';
  defaultValue?: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: Array<{
    label: string;
    value: any;
  }>;
}

interface NodeConfig {
  nodeType: string;
  parameters: NodeParameter[];
} 