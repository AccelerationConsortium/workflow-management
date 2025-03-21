/**
 * Device execution modes
 */
export enum DeviceExecutionMode {
  LOCAL = 'local',    // Direct execution on the worker
  REMOTE = 'remote',  // Remote execution via SSH/RPC
  MQTT = 'mqtt',      // MQTT protocol communication
  GRPC = 'grpc'      // gRPC protocol communication
}

/**
 * Parameter validation rules
 */
export interface ParameterValidation {
  required?: boolean;
  type: 'number' | 'string' | 'boolean' | 'object' | 'file';
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  customValidator?: (value: any) => boolean;
}

/**
 * Device parameter definition
 */
export interface DeviceParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'object' | 'file';
  description?: string;
  defaultValue?: any;
  validation?: ParameterValidation;
  dependencies?: string[];  // Names of other parameters this one depends on
}

/**
 * Communication configuration for different execution modes
 */
export interface CommunicationConfig {
  // For REMOTE mode
  remote?: {
    host: string;
    port: number;
    username: string;
    privateKeyPath?: string;
  };
  
  // For MQTT mode
  mqtt?: {
    broker: string;
    port: number;
    commandTopic: string;
    statusTopic: string;
    qos?: 0 | 1 | 2;
  };
  
  // For GRPC mode
  grpc?: {
    host: string;
    port: number;
    serviceName: string;
    protoPath: string;
  };
}

/**
 * Device capabilities and requirements
 */
export interface DeviceCapabilities {
  requiredMemory?: number;     // Required memory in MB
  requiredCPU?: number;        // Required CPU cores
  supportedOS?: string[];      // Supported operating systems
  additionalDependencies?: string[];  // Additional software dependencies
}

/**
 * Device status monitoring configuration
 */
export interface MonitoringConfig {
  healthCheckInterval: number;  // Interval in milliseconds
  timeout: number;             // Timeout in milliseconds
  retryAttempts: number;       // Number of retry attempts
  metrics: string[];           // List of metrics to monitor
}

/**
 * Device definition interface
 */
export interface DeviceDefinition {
  type: string;                // Unique device type identifier
  name: string;                // Human-readable device name
  version: string;             // Device version
  description?: string;        // Device description
  executionMode: DeviceExecutionMode;  // Execution mode
  parameters: DeviceParameter[];        // List of parameters
  communication: CommunicationConfig;   // Communication configuration
  capabilities: DeviceCapabilities;     // Device capabilities
  monitoring: MonitoringConfig;         // Monitoring configuration
  
  // Optional device-specific configurations
  initializationScript?: string;        // Script to run during initialization
  cleanupScript?: string;               // Script to run during cleanup
  errorHandling?: {                     // Error handling configuration
    retryable: boolean;
    maxRetries?: number;
    retryDelay?: number;
  };
  
  // Validation methods
  validateParameters?: (params: Record<string, any>) => boolean;
  validateState?: (state: any) => boolean;
}

/**
 * Device instance state
 */
export interface DeviceState {
  id: string;                  // Device instance ID
  type: string;               // Device type
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentOperation?: string;   // Current operation being performed
  lastUpdated: Date;          // Last state update timestamp
  metrics: Record<string, any>; // Current device metrics
  error?: {                    // Error information if status is 'error'
    message: string;
    code: string;
    timestamp: Date;
  };
} 
