import React, { useEffect, useState } from 'react';
import { BaseDeviceComponent, BaseDeviceProps, DeviceState } from './BaseDeviceComponent';
import { DeviceData } from '../../services/DeviceService';

interface HotplateData {
  temperature: number;
  target_temperature: number;
  stirring_speed: number;
  target_stirring_speed: number;
  is_heating: boolean;
  is_stirring: boolean;
}

interface HotplateControlProps extends BaseDeviceProps {
  onDataUpdate?: (data: HotplateData) => void;
}

export const HotplateControl: React.FC<HotplateControlProps> = ({
  deviceId,
  onError,
  onDataUpdate
}) => {
  const [hotplateData, setHotplateData] = useState<HotplateData>({
    temperature: 0,
    target_temperature: 0,
    stirring_speed: 0,
    target_stirring_speed: 0,
    is_heating: false,
    is_stirring: false
  });

  const [deviceState, setDeviceState] = useState<DeviceState>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastUpdate: null
  });

  useEffect(() => {
    const handleDeviceData = (data: DeviceData) => {
      const params = data.parameters as HotplateData;
      setHotplateData(params);
      setDeviceState(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        lastUpdate: data.timestamp
      }));
      if (onDataUpdate) {
        onDataUpdate(params);
      }
    };

    deviceService.subscribeToDevice(deviceId, handleDeviceData);

    return () => {
      deviceService.unsubscribeFromDevice(deviceId);
    };
  }, [deviceId, onDataUpdate]);

  const handleSetTemperature = async (temperature: number) => {
    try {
      setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));
      await deviceService.sendCommand(deviceId, 'set_temperature', { temperature });
      setDeviceState(prev => ({ ...prev, isLoading: false }));
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
    }
  };

  const handleSetStirringSpeed = async (speed: number) => {
    try {
      setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));
      await deviceService.sendCommand(deviceId, 'set_stirring_speed', { speed });
      setDeviceState(prev => ({ ...prev, isLoading: false }));
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
    }
  };

  const handleStop = async () => {
    try {
      setDeviceState(prev => ({ ...prev, isLoading: true, error: null }));
      await deviceService.sendCommand(deviceId, 'stop');
      setDeviceState(prev => ({ ...prev, isLoading: false }));
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
    }
  };

  return (
    <div className="hotplate-control">
      <BaseDeviceComponent deviceId={deviceId} onError={onError} />
      
      <div className="control-panel">
        <div className="temperature-control">
          <h3>Temperature Control</h3>
          <div className="current-value">
            Current: {hotplateData.temperature}°C
            {hotplateData.is_heating && <span className="heating-indicator">Heating</span>}
          </div>
          <div className="target-value">
            Target: {hotplateData.target_temperature}°C
          </div>
          <input
            type="number"
            value={hotplateData.target_temperature}
            onChange={(e) => handleSetTemperature(Number(e.target.value))}
            disabled={deviceState.isLoading || !deviceState.isConnected}
          />
        </div>

        <div className="stirring-control">
          <h3>Stirring Control</h3>
          <div className="current-value">
            Current: {hotplateData.stirring_speed} RPM
            {hotplateData.is_stirring && <span className="stirring-indicator">Stirring</span>}
          </div>
          <div className="target-value">
            Target: {hotplateData.target_stirring_speed} RPM
          </div>
          <input
            type="number"
            value={hotplateData.target_stirring_speed}
            onChange={(e) => handleSetStirringSpeed(Number(e.target.value))}
            disabled={deviceState.isLoading || !deviceState.isConnected}
          />
        </div>

        <button
          className="stop-button"
          onClick={handleStop}
          disabled={deviceState.isLoading || !deviceState.isConnected}
        >
          Emergency Stop
        </button>
      </div>
    </div>
  );
};

export default HotplateControl; 
