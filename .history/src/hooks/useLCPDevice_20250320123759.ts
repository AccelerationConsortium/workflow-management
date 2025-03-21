import { useState, useEffect, useCallback } from 'react';
import { LCPService } from '../services/lcp/LCPService';
import { DeviceState, DeviceCommand } from '../services/lcp/types';

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
    const statusSubscription = lcpService.subscribeToDeviceStatus(deviceId, (status) => {
      setState(prev => ({
        ...prev,
        isConnected: status.connected,
        data: status.data,
        error: status.error || null
      }));
    });

    // Subscribe to device errors
    const errorSubscription = lcpService.subscribeToDeviceErrors(deviceId, (error) => {
      setState(prev => ({
        ...prev,
        error: error
      }));
    });

    // Initial connection attempt
    lcpService.connectDevice(deviceId).catch(error => {
      setState(prev => ({
        ...prev,
        error: error.message
      }));
    });

    return () => {
      // Cleanup subscriptions
      statusSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      lcpService.disconnectDevice(deviceId);
    };
  }, [deviceId]);

  // Send command to device
  const sendCommand = useCallback(async (command: DeviceCommand) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const lcpService = LCPService.getInstance();
      await lcpService.sendCommand(deviceId, command);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send command'
      }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [deviceId]);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get current device state
  const getDeviceState = useCallback(async () => {
    try {
      const lcpService = LCPService.getInstance();
      const status = await lcpService.getDeviceStatus(deviceId);
      setState(prev => ({
        ...prev,
        data: status.data,
        isConnected: status.connected,
        error: status.error || null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
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
