/**
 * Interface for workflow execution services
 */
export interface IWorkflowService {
  // Device Control
  executeHotplateControl(nodeId: string, parameters: HotplateParameters): Promise<ExecutionResult>;
  executePumpControl(nodeId: string, parameters: PumpParameters): Promise<ExecutionResult>;
  executeValveControl(nodeId: string, parameters: ValveParameters): Promise<ExecutionResult>;
  executeSensorReading(nodeId: string, parameters: SensorParameters): Promise<ExecutionResult>;
  
  // Data Processing
  executeDataProcessing(nodeId: string, parameters: DataProcessingParameters): Promise<ExecutionResult>;
  
  // File Operations
  executeFileInput(nodeId: string, parameters: FileInputParameters): Promise<ExecutionResult>;
  executeFileOutput(nodeId: string, parameters: FileOutputParameters): Promise<ExecutionResult>;
  
  // Resource Management
  allocateResources(nodeId: string, requirements: ResourceRequirements): Promise<boolean>;
  releaseResources(nodeId: string): Promise<void>;
  
  // Error Handling
  handleExecutionError(nodeId: string, error: Error): Promise<void>;
  cleanup(nodeId: string): Promise<void>;
}

/**
 * Common parameter types
 */
export interface HotplateParameters {
  temperature: number;
  duration: number;
  stirringSpeed?: number;
}

export interface PumpParameters {
  flowRate: number;
  volume: number;
  direction: 'forward' | 'reverse';
}

export interface ValveParameters {
  position: 'A' | 'B' | 'C' | 'D';
  switchTime?: number;
}

export interface SensorParameters {
  sensorType: 'temperature' | 'pressure' | 'pH' | 'flow';
  samplingRate: number;
  alarmThreshold?: number;
}

export interface DataProcessingParameters {
  operation: 'average' | 'max' | 'min' | 'filter';
  windowSize?: number;
  inputData: any[];
}

export interface FileInputParameters {
  filePath: string;
  fileType: 'csv' | 'json' | 'txt';
}

export interface FileOutputParameters {
  filePath: string;
  format: 'csv' | 'json' | 'txt';
  overwrite?: boolean;
  data: any;
}

export interface ResourceRequirements {
  deviceType: string;
  exclusive: boolean;
  timeout?: number;
}

/**
 * Common result type
 */
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: Error;
  executionTime: number;
  resourceId?: string;
} 
