import { LCPCommand, LCPResponse, LCPEvent } from '../protocols/lcp/types';

export interface ConnectionConfig {
  host: string;
  port: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface DeviceStatus {
  isConnected: boolean;
  state: 'idle' | 'running' | 'error' | 'maintenance';
  lastUpdated: number;
  error?: string;
}

export interface CommunicationProtocol {
  // Connection management
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Basic communication
  sendCommand<T = any>(command: string, params?: any): Promise<T>;
  subscribe(topic: string, callback: (data: any) => void): () => void;
  unsubscribe(topic: string): void;

  // LCP specific methods
  sendLCPCommand(command: LCPCommand): Promise<LCPResponse>;
  onLCPEvent(callback: (event: LCPEvent) => void): () => void;

  // Status and error handling
  getStatus(): Promise<DeviceStatus>;
  getLastError(): Error | null;
}

export interface DeviceController {
  // Lifecycle methods
  initialize(): Promise<void>;
  dispose(): Promise<void>;

  // Device operations
  executeOperation(operationId: string, params: Record<string, any>): Promise<void>;
  abortOperation(operationId: string): Promise<void>;
  
  // Parameter management
  setParameter(name: string, value: any): Promise<void>;
  getParameter(name: string): Promise<any>;
  
  // Status and monitoring
  getStatus(): Promise<DeviceStatus>;
  onStatusChange(callback: (status: DeviceStatus) => void): () => void;
  
  // Error handling
  handleError(error: Error): void;
  getLastError(): Error | null;
} 
