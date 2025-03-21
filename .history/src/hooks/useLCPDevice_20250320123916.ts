import { useState, useEffect, useCallback } from 'react';
import { LCPService } from '../services/lcp/LCPService';
import { 
  DeviceState, 
  DeviceCommand, 
  DeviceStatus, 
  DeviceData,
  DeviceError,
  DeviceStatusCallback 
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
    const statusSubscription = lcpService.subscribeToDeviceStatus(
      deviceId,
      (status: DeviceStatus<DeviceData>) => {
        setState(prevState => ({
          ...prevState,
          isConnected: status.connected,
          data: status.data,
          error: status.error
        }));
      }
    );

    // Subscribe to device events
    const eventSubscription = lcpService.subscribeToDeviceEvents(
      deviceId,
      (error: DeviceError) => {
        setState(prevState => ({
          ...prevState,
          error: error.message
        }));
      }
    );

    // Initial connection attempt
    lcpService.connect(deviceId).catch((error: Error) => {
      setState(prevState => ({
        ...prevState,
        error: error.message
      }));
    });

    return () => {
      // Cleanup subscriptions
      statusSubscription.unsubscribe();
      eventSubscription.unsubscribe();
      lcpService.disconnect(deviceId);
    };
  }, [deviceId]);

  // Send command to device
  const sendCommand = useCallback(async (command: DeviceCommand) => {
    setState(prevState => ({ ...prevState, isLoading: true }));
    try {
      const lcpService = LCPService.getInstance();
      await lcpService.sendCommand(deviceId, command);
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Failed to send command'
      }));
      throw error;
    } finally {
      setState(prevState => ({ ...prevState, isLoading: false }));
    }
  }, [deviceId]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Get current device state
  const getDeviceState = useCallback(async () => {
    try {
      const lcpService = LCPService.getInstance();
      const status = await lcpService.getStatus(deviceId);
      setState(prevState => ({
        ...prevState,
        data: status.data,
        isConnected: status.connected,
        error: status.error
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
