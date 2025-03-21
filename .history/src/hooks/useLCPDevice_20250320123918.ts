import { useState, useEffect, useCallback } from 'react';
import { LCPService } from '../services/lcp/LCPService';
import { 
  DeviceState, 
  DeviceCommand, 
  DeviceStatus, 
  DeviceData,
  DeviceEvent
} from '../services/lcp/types';

export const useLCPDevice = (deviceId: string) => {
  const [state, setState] = useState<DeviceState>({
    isConnected: false,
    isLoading: false,
    error: null,
    data: null
  });

  // Initialize LCP service
  useEffect(() => {
    const lcpService = LCPService.getInstance();
    
    // Subscribe to device status updates
    lcpService.subscribeToDeviceStatus<DeviceData>(
      deviceId,
      (status: DeviceStatus<DeviceData>) => {
        setState(prevState => ({
          ...prevState,
          isConnected: status.connected,
          data: status.data,
          error: status.error || null
        }));
      }
    );

    // Subscribe to device events
    lcpService.subscribeToDeviceEvents(
      deviceId,
      (event: DeviceEvent) => {
        if (event.type === 'error') {
          setState(prevState => ({
            ...prevState,
            error: event.data.message || 'Unknown error'
          }));
        }
      }
    );

    // Initial status check
    lcpService.getDeviceStatus<DeviceData>(deviceId).catch((error: Error) => {
      setState(prevState => ({
        ...prevState,
        error: error.message
      }));
    });

    return () => {
      // Cleanup subscriptions
      lcpService.unsubscribeFromDeviceStatus(deviceId);
      lcpService.unsubscribeFromDeviceEvents(deviceId);
    };
  }, [deviceId]);

  // Send command to device
  const sendCommand = useCallback(async <T>(command: DeviceCommand<T>) => {
    setState(prevState => ({ ...prevState, isLoading: true }));
    try {
      const lcpService = LCPService.getInstance();
      await lcpService.sendCommand(command);
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Failed to send command'
      }));
      throw error;
    } finally {
      setState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Get current device state
  const getDeviceState = useCallback(async () => {
    try {
      const lcpService = LCPService.getInstance();
      const status = await lcpService.getDeviceStatus<DeviceData>(deviceId);
      setState(prevState => ({
        ...prevState,
        data: status.data,
        isConnected: status.connected,
        error: status.error || null
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Failed to get device state'
      }));
    }
  }, [deviceId]);

  return {
    state,
    sendCommand,
    clearError,
    getDeviceState
  };
}; 
