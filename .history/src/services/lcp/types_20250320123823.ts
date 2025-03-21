// Device types
export type DeviceType = 'hotplate' | 'pump' | 'valve' | 'balance' | 'webcam';

// Device parameters
export interface HotplateParameters {
  current_temperature: number;
  target_temperature: number;
  current_stirring_speed: number;
  target_stirring_speed: number;
  heating: boolean;
  stirring: boolean;
}

export interface PumpParameters {
  flow_rate: number;
  direction: 'forward' | 'reverse';
  running: boolean;
}

export interface ValveParameters {
  position: 'open' | 'closed';
}

export interface BalanceParameters {
  current_weight: number;
  tare: boolean;
}

// Device status
export interface DeviceStatus<T> {
  device_id: string;
  timestamp: string;
  parameters: T;
  status: 'online' | 'offline' | 'error';
  error?: string;
}

// Control commands
export interface DeviceCommand<T> {
  device_id: string;
  command: 'set_parameters' | 'start' | 'stop' | 'reset';
  parameters: T;
}

// Device events
export interface DeviceEvent {
  device_id: string;
  event_type: 'status_change' | 'error' | 'data';
  timestamp: string;
  data: any;
}

export interface DeviceState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  data: DeviceData | null;
}

export interface DeviceData {
  temperature?: number;
  stirring_speed?: number;
  target_temperature?: number;
  ramp_rate?: number;
  is_heating?: boolean;
  is_stirring?: boolean;
  status?: string;
}

export interface DeviceCommand {
  command: string;
  parameters?: Record<string, any>;
}

export interface DeviceStatus<T = DeviceData> {
  connected: boolean;
  data: T | null;
  error: string | null;
}

export interface DeviceEvent {
  type: string;
  data: any;
  timestamp: string;
}

export type DeviceEventCallback = (event: DeviceEvent) => void;
export type DeviceStatusCallback = (status: DeviceStatus) => void;

export interface DeviceError {
  code: string;
  message: string;
  timestamp: string;
} 
