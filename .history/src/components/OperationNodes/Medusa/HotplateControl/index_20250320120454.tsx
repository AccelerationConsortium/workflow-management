import React, { useState, useCallback, useEffect } from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES, TEMPERATURE_LIMITS, STIRRING_LIMITS } from './constants';
import { useLCPDevice } from '../../../../hooks/useLCPDevice';
import { ParametersPanel } from './ParametersPanel';
import './styles.css';
import { useDeviceControl } from '../../../../hooks/useDeviceControl';
import { HotplateParameters } from '../../../../services/lcp/types';
import { HOTPLATE_CONSTANTS } from './constants';
import { FileUploader } from '../../../../components/FileUploader';

interface HotplateControlPanelProps {
  deviceId: string;
  data: {
    temperature: number;
    stirringSpeed: number;
    heatingOn: boolean;
    stirringOn: boolean;
    targetTemp: number;
    rampRate: number;
  };
  onChange?: (data: any) => void;
}

export const HotplateControlPanel: React.FC<HotplateControlPanelProps> = ({ deviceId, data, onChange }) => {
  const [localData, setLocalData] = useState(data);
  const { state: deviceState, sendCommand } = useLCPDevice(deviceId);

  // Update local data when device data changes
  useEffect(() => {
    if (deviceState.data) {
      const newData = {
        temperature: deviceState.data.temperature || localData.temperature,
        stirringSpeed: deviceState.data.stirring_speed || localData.stirringSpeed,
        heatingOn: deviceState.data.is_heating || localData.heatingOn,
        stirringOn: deviceState.data.is_stirring || localData.stirringOn,
        targetTemp: deviceState.data.target_temperature || localData.targetTemp,
        rampRate: deviceState.data.ramp_rate || localData.rampRate
      };
      setLocalData(newData);
      onChange?.(newData);
    }
  }, [deviceState.data]);

  const handleChange = useCallback(async (field: string, value: number | boolean) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);

    try {
      switch (field) {
        case 'targetTemp':
          await sendCommand('set_temperature', { temperature: value });
          break;
        case 'stirringSpeed':
          await sendCommand('set_stirring_speed', { speed: value });
          break;
        case 'heatingOn':
          if (!value) {
            await sendCommand('stop_heating');
          } else {
            await sendCommand('set_temperature', { temperature: localData.targetTemp });
          }
          break;
        case 'stirringOn':
          if (!value) {
            await sendCommand('stop_stirring');
          } else {
            await sendCommand('set_stirring_speed', { speed: localData.stirringSpeed });
          }
          break;
        case 'rampRate':
          await sendCommand('set_ramp_rate', { rate: value });
          break;
      }
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  }, [localData, sendCommand]);

  const handleNumberInput = useCallback((field: string, value: string, limits: { min: number; max: number }) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= limits.min && numValue <= limits.max) {
      handleChange(field, numValue);
    }
  }, [handleChange]);

  return (
    <div className="hotplate-control-panel">
      <div className="connection-status">
        <div className={`status-dot ${deviceState.isConnected ? 'connected' : 'disconnected'}`} />
        <span>{deviceState.isConnected ? 'Connected' : 'Disconnected'}</span>
        {deviceState.error && <div className="error-message">{deviceState.error}</div>}
      </div>

      <div className="parameter-group">
        <div className="parameter">
          <label>Target Temperature (°C)</label>
          <input
            type="number"
            value={localData.targetTemp}
            min={TEMPERATURE_LIMITS.min}
            max={TEMPERATURE_LIMITS.max}
            onChange={(e) => handleNumberInput('targetTemp', e.target.value, TEMPERATURE_LIMITS)}
            disabled={!deviceState.isConnected || deviceState.isLoading}
          />
        </div>
        <div className="parameter">
          <label>Current Temperature (°C)</label>
          <div className="current-value">{localData.temperature.toFixed(1)}°C</div>
        </div>
        <div className="parameter">
          <label>Stirring Speed (rpm)</label>
          <input
            type="number"
            value={localData.stirringSpeed}
            min={STIRRING_LIMITS.min}
            max={STIRRING_LIMITS.max}
            onChange={(e) => handleNumberInput('stirringSpeed', e.target.value, STIRRING_LIMITS)}
            disabled={!deviceState.isConnected || deviceState.isLoading}
          />
        </div>
        <div className="parameter">
          <label>Temperature Ramp Rate (°C/min)</label>
          <input
            type="number"
            value={localData.rampRate}
            min={1}
            max={20}
            onChange={(e) => handleNumberInput('rampRate', e.target.value, { min: 1, max: 20 })}
            disabled={!deviceState.isConnected || deviceState.isLoading}
          />
        </div>
      </div>

      <div className="control-switches">
        <div className="switch-group">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localData.heatingOn}
              onChange={(e) => handleChange('heatingOn', e.target.checked)}
              disabled={!deviceState.isConnected || deviceState.isLoading}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="switch-label">Heating</span>
        </div>
        <div className="switch-group">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localData.stirringOn}
              onChange={(e) => handleChange('stirringOn', e.target.checked)}
              disabled={!deviceState.isConnected || deviceState.isLoading}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="switch-label">Stirring</span>
        </div>
      </div>

      <div className="status-indicator">
        <div className={`dot ${localData.heatingOn || localData.stirringOn ? 'active' : ''}`}></div>
        <span className="status-text">
          {localData.heatingOn && localData.stirringOn
            ? 'Heating and Stirring'
            : localData.heatingOn
            ? 'Heating Only'
            : localData.stirringOn
            ? 'Stirring Only'
            : 'Idle'}
        </span>
      </div>

      {deviceState.isLoading && <div className="loading-overlay">Processing...</div>}
    </div>
  );
};

interface HotplateNodeProps {
  data: any;
  selected?: boolean;
  onChange?: (data: any) => void;
}

const HotplateNode: React.FC<HotplateNodeProps> = ({ data, selected, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const BaseNode = createNodeComponent('Medusa');

  return (
    <div className="hotplate-node">
      <BaseNode
        {...data}
        selected={selected}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      <ParametersPanel
        deviceId={data.deviceId || 'hotplate-001'}
        data={data}
        onChange={onChange}
        isExpanded={isExpanded}
      />
    </div>
  );
};

export const HotplateControl = HotplateNode;

interface HotplateControlProps {
  deviceId: string;
  onDataChange?: (data: any) => void;
}

export const HotplateControl: React.FC<HotplateControlProps> = ({ deviceId, onDataChange }) => {
  const {
    status,
    error,
    isConnected,
    sendCommand,
    executeBatch,
    clearError
  } = useDeviceControl<HotplateParameters>(deviceId);

  const [parameters, setParameters] = useState({
    target_temperature: HOTPLATE_CONSTANTS.TEMPERATURE.DEFAULT,
    target_stirring_speed: HOTPLATE_CONSTANTS.STIRRING_SPEED.DEFAULT,
    heating: false,
    stirring: false
  });

  const handleParameterChange = useCallback((key: string, value: number | boolean) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStart = useCallback(async () => {
    try {
      await sendCommand({
        command: 'start',
        parameters: parameters
      });
    } catch (err) {
      console.error('Error starting hotplate:', err);
    }
  }, [parameters, sendCommand]);

  const handleStop = useCallback(async () => {
    try {
      await sendCommand({
        command: 'stop',
        parameters: {
          ...parameters,
          heating: false,
          stirring: false
        }
      });
    } catch (err) {
      console.error('Error stopping hotplate:', err);
    }
  }, [parameters, sendCommand]);

  const handleFileUpload = useCallback(async (result: any) => {
    try {
      if (!result.data) return;
      
      const commands = JSON.parse(result.data);
      if (Array.isArray(commands)) {
        await executeBatch(commands.map(cmd => ({
          ...cmd,
          device_id: deviceId
        })));
      }
    } catch (err) {
      console.error('Error processing batch commands:', err);
    }
  }, [deviceId, executeBatch]);

  return (
    <div className="hotplate-control">
      <div className="hotplate-header">
        <div className="hotplate-status">
          <div className={`status-indicator status-${status?.status || 'offline'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="parameter-group">
        <div className="parameter-row">
          <span className="parameter-label">Temperature</span>
          <input
            type="number"
            className="parameter-input"
            value={parameters.target_temperature}
            onChange={e => handleParameterChange('target_temperature', Number(e.target.value))}
            min={HOTPLATE_CONSTANTS.TEMPERATURE.MIN}
            max={HOTPLATE_CONSTANTS.TEMPERATURE.MAX}
            step={HOTPLATE_CONSTANTS.TEMPERATURE.STEP}
          />
          <span className="parameter-unit">°C</span>
        </div>

        <div className="parameter-row">
          <span className="parameter-label">Stirring Speed</span>
          <input
            type="number"
            className="parameter-input"
            value={parameters.target_stirring_speed}
            onChange={e => handleParameterChange('target_stirring_speed', Number(e.target.value))}
            min={HOTPLATE_CONSTANTS.STIRRING_SPEED.MIN}
            max={HOTPLATE_CONSTANTS.STIRRING_SPEED.MAX}
            step={HOTPLATE_CONSTANTS.STIRRING_SPEED.STEP}
          />
          <span className="parameter-unit">RPM</span>
        </div>

        <div className="parameter-row">
          <label>
            <input
              type="checkbox"
              checked={parameters.heating}
              onChange={e => handleParameterChange('heating', e.target.checked)}
            />
            Heating
          </label>
          <label>
            <input
              type="checkbox"
              checked={parameters.stirring}
              onChange={e => handleParameterChange('stirring', e.target.checked)}
            />
            Stirring
          </label>
        </div>
      </div>

      <div className="control-buttons">
        <button
          className="control-button start-button"
          onClick={handleStart}
          disabled={!isConnected}
        >
          Start
        </button>
        <button
          className="control-button stop-button"
          onClick={handleStop}
          disabled={!isConnected}
        >
          Stop
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError}>Clear</button>
        </div>
      )}

      <div className="file-upload-section">
        <FileUploader
          inputId="batch-commands"
          nodeId={deviceId}
          onUploadComplete={handleFileUpload}
        />
      </div>

      {status && status.parameters && (
        <div className="parameter-chart">
          <div>Current Temperature: {status.parameters.current_temperature}°C</div>
          <div>Current Stirring Speed: {status.parameters.current_stirring_speed} RPM</div>
        </div>
      )}
    </div>
  );
};
