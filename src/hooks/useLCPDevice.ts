import { useState, useEffect, useCallback } from 'react';
import { deviceService, DeviceData } from '../services/DeviceService';

export interface DeviceState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
  data: Record<string, any>;
}

export function useLCPDevice(deviceId: string) {
  const [state, setState] = useState<DeviceState>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastUpdate: null,
    data: {}
  });

  useEffect(() => {
    const handleDeviceData = (data: DeviceData) => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        lastUpdate: data.timestamp,
        data: data.parameters
      }));
    };

    deviceService.subscribeToDevice(deviceId, handleDeviceData);

    return () => {
      deviceService.unsubscribeFromDevice(deviceId);
    };
  }, [deviceId]);

  const sendCommand = useCallback(async (command: string, parameters: Record<string, any> = {}) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await deviceService.sendCommand(deviceId, command, parameters);
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [deviceId]);

  return {
    state,
    sendCommand
  };
} 
