import { useState, useEffect, useCallback } from 'react';
import { LCPService } from '../services/lcp/LCPService';
import { DeviceStatus, DeviceCommand, DeviceEvent } from '../services/lcp/types';

export function useDeviceControl<T>(deviceId: string) {
  const [status, setStatus] = useState<DeviceStatus<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const lcpService = LCPService.getInstance();

  // Subscribe to device status updates
  useEffect(() => {
    const handleStatus = (newStatus: DeviceStatus<T>) => {
      setStatus(newStatus);
      setIsConnected(newStatus.status === 'online');
    };

    const handleEvent = (event: DeviceEvent) => {
      if (event.event_type === 'error') {
        setError(event.data.message);
      }
    };

    lcpService.subscribeToDeviceStatus<T>(deviceId, handleStatus);
    lcpService.subscribeToDeviceEvents(deviceId, handleEvent);

    // Initial status fetch
    lcpService.getDeviceStatus<T>(deviceId)
      .then(handleStatus)
      .catch(err => setError(err.message));

    return () => {
      lcpService.unsubscribeFromDeviceStatus(deviceId);
      lcpService.unsubscribeFromDeviceEvents(deviceId);
    };
  }, [deviceId]);

  // Send command to device
  const sendCommand = useCallback(async (command: Omit<DeviceCommand<T>, 'device_id'>) => {
    try {
      setError(null);
      await lcpService.sendCommand({
        ...command,
        device_id: deviceId
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [deviceId]);

  // Execute batch commands
  const executeBatch = useCallback(async (commands: DeviceCommand<T>[]) => {
    try {
      setError(null);
      await lcpService.executeBatchCommands(commands);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    status,
    error,
    isConnected,
    sendCommand,
    executeBatch,
    clearError: () => setError(null)
  };
} 
