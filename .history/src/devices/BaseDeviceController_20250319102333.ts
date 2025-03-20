import { DeviceController, DeviceStatus, ConnectionConfig } from '../communication/interfaces';
import { CommunicationProtocol } from '../communication/interfaces';
import { UOCategory, UOType, GenericUnitOperation } from '../types/GenericUnitOperation';
import { LCPClient } from '../protocols/lcp/client';

export abstract class BaseDeviceController implements DeviceController {
  protected protocol: CommunicationProtocol;
  protected deviceId: string;
  protected status: DeviceStatus = {
    isConnected: false,
    state: 'idle',
    lastUpdated: Date.now(),
  };
  protected statusCallbacks: Set<(status: DeviceStatus) => void> = new Set();
  protected lastError: Error | null = null;
  protected supportedOperations: Set<UOType> = new Set();
  protected lcpClient: LCPClient;

  constructor(protocol: CommunicationProtocol, lcpConfig: { baseUrl: string }, deviceId: string) {
    this.protocol = protocol;
    this.lcpClient = new LCPClient(lcpConfig);
    this.deviceId = deviceId;
  }

  // Lifecycle methods
  async initialize(): Promise<void> {
    try {
      await this.lcpClient.connectDevice(this.deviceId);
      this.updateStatus({ isConnected: true });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async dispose(): Promise<void> {
    try {
      await this.protocol.disconnect();
      this.updateStatus({ isConnected: false });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  // Device operations
  async executeOperation(operationId: string, params: Record<string, any>): Promise<void> {
    try {
      // Validate operation support
      if (!this.supportedOperations.has(operationId as UOType)) {
        throw new Error(`Operation ${operationId} is not supported by this device`);
      }

      // Validate parameters
      this.validateParameters(operationId as UOType, params);

      // Execute operation
      await this.lcpClient.sendCommand(this.deviceId, operationId, params);
      
      // Update status
      this.updateStatus({ state: 'running' });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async abortOperation(operationId: string): Promise<void> {
    try {
      await this.lcpClient.sendCommand(this.deviceId, 'ABORT', { operationId });
      this.updateStatus({ state: 'idle' });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  // Parameter management
  async setParameter(name: string, value: any): Promise<void> {
    try {
      await this.lcpClient.sendCommand(this.deviceId, 'SET_PARAMETER', { name, value });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  async getParameter(name: string): Promise<any> {
    try {
      const response = await this.lcpClient.sendCommand(this.deviceId, 'GET_PARAMETER', { name });
      return response.json().then(data => data.value);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  // Status and monitoring
  async getStatus(): Promise<DeviceStatus> {
    try {
      const deviceStatus = await this.protocol.getStatus();
      this.status = deviceStatus;
      return this.status;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  onStatusChange(callback: (status: DeviceStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  // Error handling
  handleError(error: Error): void {
    this.lastError = error;
    this.updateStatus({
      state: 'error',
      error: error.message
    });
    console.error('Device error:', error);
  }

  getLastError(): Error | null {
    return this.lastError;
  }

  // Protected helper methods
  protected abstract getDeviceHost(): string;
  protected abstract getDevicePort(): number;
  protected abstract validateParameters(operationType: UOType, params: Record<string, any>): void;

  protected updateStatus(partialStatus: Partial<DeviceStatus>): void {
    this.status = {
      ...this.status,
      ...partialStatus,
      lastUpdated: Date.now()
    };

    // Notify all status subscribers
    this.statusCallbacks.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  // Utility methods
  protected isSupportedOperation(operationType: UOType): boolean {
    return this.supportedOperations.has(operationType);
  }

  protected addSupportedOperation(operationType: UOType): void {
    this.supportedOperations.add(operationType);
  }
} 
