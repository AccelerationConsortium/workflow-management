import mqtt from 'mqtt';
import axios from 'axios';
import { DeviceStatus, DeviceCommand, DeviceEvent, DeviceType } from './types';

export class LCPService {
  private static instance: LCPService;
  private mqttClient: mqtt.Client;
  private deviceStatusCallbacks: Map<string, (status: DeviceStatus<any>) => void>;
  private deviceEventCallbacks: Map<string, (event: DeviceEvent) => void>;

  private constructor() {
    this.deviceStatusCallbacks = new Map();
    this.deviceEventCallbacks = new Map();
    this.initializeMQTT();
  }

  public static getInstance(): LCPService {
    if (!LCPService.instance) {
      LCPService.instance = new LCPService();
    }
    return LCPService.instance;
  }

  private initializeMQTT() {
    this.mqttClient = mqtt.connect('mqtt://localhost:1883');

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.mqttClient.subscribe('device/+/status');
      this.mqttClient.subscribe('device/+/event');
    });

    this.mqttClient.on('message', (topic, message) => {
      const [, deviceId, type] = topic.split('/');
      const data = JSON.parse(message.toString());

      if (type === 'status') {
        const callback = this.deviceStatusCallbacks.get(deviceId);
        if (callback) {
          callback(data as DeviceStatus<any>);
        }
      } else if (type === 'event') {
        const callback = this.deviceEventCallbacks.get(deviceId);
        if (callback) {
          callback(data as DeviceEvent);
        }
      }
    });
  }

  // Send control command to device
  public async sendCommand<T>(command: DeviceCommand<T>): Promise<void> {
    try {
      await axios.post('http://localhost:3000/api/lcp/command', command);
    } catch (error: unknown) {
      console.error('Failed to send command:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Subscribe to device status updates
  public subscribeToDeviceStatus<T>(
    deviceId: string,
    callback: (status: DeviceStatus<T>) => void
  ): void {
    this.deviceStatusCallbacks.set(deviceId, callback);
  }

  // Subscribe to device events
  public subscribeToDeviceEvents(
    deviceId: string,
    callback: (event: DeviceEvent) => void
  ): void {
    this.deviceEventCallbacks.set(deviceId, callback);
  }

  // Unsubscribe from device status updates
  public unsubscribeFromDeviceStatus(deviceId: string): void {
    this.deviceStatusCallbacks.delete(deviceId);
  }

  // Unsubscribe from device events
  public unsubscribeFromDeviceEvents(deviceId: string): void {
    this.deviceEventCallbacks.delete(deviceId);
  }

  // Get current device status
  public async getDeviceStatus<T>(deviceId: string): Promise<DeviceStatus<T>> {
    try {
      const response = await axios.get(`http://localhost:3000/api/lcp/device/${deviceId}/status`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get device status:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Get device configuration
  public async getDeviceConfig(deviceId: string): Promise<any> {
    try {
      const response = await axios.get(`http://localhost:3000/api/lcp/device/${deviceId}/config`);
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to get device config:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Batch control commands for sequence execution
  public async executeBatchCommands<T>(commands: DeviceCommand<T>[]): Promise<void> {
    try {
      await axios.post('http://localhost:3000/api/lcp/batch', { commands });
    } catch (error: unknown) {
      console.error('Failed to execute batch commands:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
} 
