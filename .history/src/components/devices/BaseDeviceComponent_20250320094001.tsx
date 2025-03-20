import React, { useEffect, useState } from 'react';
import { deviceService, DeviceData, CommandResponse } from '../../services/DeviceService';

export interface BaseDeviceProps {
  deviceId: string;
  onError?: (error: Error) => void;
}

export interface DeviceState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: string | null;
}

export const BaseDeviceComponent: React.FC<BaseDeviceProps> = ({
  deviceId,
  onError
}) => {
  const [deviceState, setDeviceState] = useState<DeviceState>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastUpdate: null
  });

  useEffect(() => {
    // Subscribe to device data updates
    const handleDeviceData = (data: DeviceData) => {
      setDeviceState(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        lastUpdate: data.timestamp
      }));
    };

    deviceService.subscribeToDevice(deviceId, handleDeviceData);

    // Cleanup subscription on unmount
    return () => {
      deviceService.unsubscribeFromDevice(deviceId);
    };
  }, [deviceId]);

  // Protected method for sending commands
  const sendDeviceCommand = async (
    command: string,
    parameters: Record<string, any> = {}
  ): Promise<CommandResponse> => {
    try {
      setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await deviceService.sendCommand(deviceId, command, parameters);
      setDeviceState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDeviceState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
      throw error;
    }
  };

  return (
    <div className="device-component">
      <div className="device-status">
        <span className={`status-indicator ${deviceState.isConnected ? 'connected' : 'disconnected'}`} />
        <span>{deviceState.isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      {deviceState.isLoading && <div className="loading-indicator">Processing command...</div>}
      {deviceState.error && <div className="error-message">{deviceState.error}</div>}
    </div>
  );
};

export default BaseDeviceComponent; 
