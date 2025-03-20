import mqtt from 'mqtt';

export interface DeviceInfo {
  device_id: string;
  protocol: string;
  model: string;
  capabilities: string[];
  metadata: Record<string, any>;
}

export interface DeviceData {
  device_id: string;
  timestamp: string;
  parameters: Record<string, any>;
}

export interface CommandResponse {
  device_id: string;
  command_id: string;
  status: 'completed' | 'error' | 'processing';
  error?: string;
  timestamp: string;
}

export class DeviceService {
  private client: mqtt.Client;
  private deviceCallbacks: Map<string, (data: DeviceData) => void>;
  private commandCallbacks: Map<string, (response: CommandResponse) => void>;
  
  constructor() {
    this.client = mqtt.connect('ws://localhost:1883'); // WebSocket connection
    this.deviceCallbacks = new Map();
    this.commandCallbacks = new Map();
    
    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Subscribe to device registration topic
      this.client.subscribe('lcp/devices/+/data');
      this.client.subscribe('lcp/devices/+/command_response');
    });
    
    this.client.on('message', (topic, message) => {
      const topicParts = topic.split('/');
      if (topicParts[3] === 'data') {
        const data = JSON.parse(message.toString()) as DeviceData;
        const callback = this.deviceCallbacks.get(data.device_id);
        if (callback) {
          callback(data);
        }
      } else if (topicParts[3] === 'command_response') {
        const response = JSON.parse(message.toString()) as CommandResponse;
        const callback = this.commandCallbacks.get(response.command_id);
        if (callback) {
          callback(response);
          if (response.status !== 'processing') {
            this.commandCallbacks.delete(response.command_id);
          }
        }
      }
    });
  }
  
  // Subscribe to device data updates
  subscribeToDevice(deviceId: string, callback: (data: DeviceData) => void) {
    this.deviceCallbacks.set(deviceId, callback);
  }
  
  // Unsubscribe from device data updates
  unsubscribeFromDevice(deviceId: string) {
    this.deviceCallbacks.delete(deviceId);
  }
  
  // Send command to device
  async sendCommand(deviceId: string, command: string, parameters: Record<string, any> = {}) {
    return new Promise<CommandResponse>((resolve, reject) => {
      const commandId = Date.now().toString();
      const commandData = {
        id: commandId,
        device_id: deviceId,
        command,
        parameters,
        timestamp: new Date().toISOString()
      };
      
      // Set up callback for command response
      this.commandCallbacks.set(commandId, (response) => {
        if (response.status === 'error') {
          reject(new Error(response.error));
        } else if (response.status === 'completed') {
          resolve(response);
        }
        // 'processing' status will not resolve/reject
      });
      
      // Send command
      this.client.publish(`lcp/devices/${deviceId}/commands`, JSON.stringify(commandData));
      
      // Set timeout for command response
      setTimeout(() => {
        if (this.commandCallbacks.has(commandId)) {
          this.commandCallbacks.delete(commandId);
          reject(new Error('Command timeout'));
        }
      }, 10000); // 10 second timeout
    });
  }
  
  // Disconnect from MQTT broker
  disconnect() {
    this.client.end();
  }
}

// Create singleton instance
export const deviceService = new DeviceService(); 
