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
import { StatusIndicator } from './components/StatusIndicator';
import { ParameterChart } from './components/ParameterChart';
import { DeviceCommand } from '../../../../services/lcp/types';

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
  const { state, sendCommand, clearError } = useLCPDevice(deviceId);
  const [parameters, setParameters] = useState({
    targetTemperature: DEFAULT_VALUES.temperature,
    stirringSpeed: DEFAULT_VALUES.stirringSpeed,
    rampRate: DEFAULT_VALUES.rampRate,
    isHeating: false,
    isStirring: false
  });

  // Update parameters when device state changes
  useEffect(() => {
    if (state.data) {
      setParameters(prev => ({
        ...prev,
        targetTemperature: state.data.target_temperature ?? prev.targetTemperature,
        stirringSpeed: state.data.stirring_speed ?? prev.stirringSpeed,
        rampRate: state.data.ramp_rate ?? prev.rampRate,
        isHeating: state.data.is_heating ?? prev.isHeating,
        isStirring: state.data.is_stirring ?? prev.isStirring
      }));
      onDataChange?.(state.data);
    }
  }, [state.data, onDataChange]);

  const handleParameterChange = useCallback(async (field: string, value: number | boolean) => {
    try {
      let command: DeviceCommand<any>;
      switch (field) {
        case 'targetTemperature':
          command = {
            command: 'set_temperature',
            parameters: { temperature: value }
          };
          break;
        case 'stirringSpeed':
          command = {
            command: 'set_stirring_speed',
            parameters: { speed: value }
          };
          break;
        case 'rampRate':
          command = {
            command: 'set_ramp_rate',
            parameters: { rate: value }
          };
          break;
        case 'isHeating':
          command = {
            command: value ? 'start_heating' : 'stop_heating',
            parameters: value ? { temperature: parameters.targetTemperature } : undefined
          };
          break;
        case 'isStirring':
          command = {
            command: value ? 'start_stirring' : 'stop_stirring',
            parameters: value ? { speed: parameters.stirringSpeed } : undefined
          };
          break;
        default:
          return;
      }

      await sendCommand(command);
      setParameters(prev => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    }
  }, [parameters, sendCommand]);

  const handleNumberInput = useCallback((field: string, value: string, limits: { min: number; max: number }) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= limits.min && numValue <= limits.max) {
      handleParameterChange(field, numValue);
    }
  }, [handleParameterChange]);

  return (
    <div className="hotplate-control">
      <StatusIndicator
        isConnected={state.isConnected}
        status={state.data?.status}
        temperature={state.data?.temperature}
        stirringSpeed={state.data?.stirring_speed}
        error={state.error}
        onErrorClear={clearError}
      />

      <ParameterChart
        status={state.data}
        targetTemperature={parameters.targetTemperature}
        targetStirringSpeed={parameters.stirringSpeed}
      />

      <div className="control-panel">
        <div className="parameter-group">
          <div className="parameter-row">
            <label className="parameter-label">Target Temperature</label>
            <input
              type="number"
              className="parameter-input"
              value={parameters.targetTemperature}
              min={TEMPERATURE_LIMITS.min}
              max={TEMPERATURE_LIMITS.max}
              onChange={(e) => handleNumberInput('targetTemperature', e.target.value, TEMPERATURE_LIMITS)}
              disabled={!state.isConnected || state.isLoading}
            />
            <span className="parameter-unit">°C</span>
          </div>

          <div className="parameter-row">
            <label className="parameter-label">Stirring Speed</label>
            <input
              type="number"
              className="parameter-input"
              value={parameters.stirringSpeed}
              min={STIRRING_LIMITS.min}
              max={STIRRING_LIMITS.max}
              onChange={(e) => handleNumberInput('stirringSpeed', e.target.value, STIRRING_LIMITS)}
              disabled={!state.isConnected || state.isLoading}
            />
            <span className="parameter-unit">rpm</span>
          </div>

          <div className="parameter-row">
            <label className="parameter-label">Ramp Rate</label>
            <input
              type="number"
              className="parameter-input"
              value={parameters.rampRate}
              min={1}
              max={20}
              onChange={(e) => handleNumberInput('rampRate', e.target.value, { min: 1, max: 20 })}
              disabled={!state.isConnected || state.isLoading}
            />
            <span className="parameter-unit">°C/min</span>
          </div>
        </div>

        <div className="control-buttons">
          <button
            className={`control-button ${parameters.isHeating ? 'stop-button' : 'start-button'}`}
            onClick={() => handleParameterChange('isHeating', !parameters.isHeating)}
            disabled={!state.isConnected || state.isLoading}
          >
            {parameters.isHeating ? 'Stop Heating' : 'Start Heating'}
          </button>
          <button
            className={`control-button ${parameters.isStirring ? 'stop-button' : 'start-button'}`}
            onClick={() => handleParameterChange('isStirring', !parameters.isStirring)}
            disabled={!state.isConnected || state.isLoading}
          >
            {parameters.isStirring ? 'Stop Stirring' : 'Start Stirring'}
          </button>
        </div>

        {state.isLoading && <div className="loading-overlay">Processing...</div>}
      </div>
    </div>
  );
};
