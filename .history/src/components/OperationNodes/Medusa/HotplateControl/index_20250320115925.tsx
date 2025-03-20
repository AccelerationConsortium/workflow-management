import React, { useState, useCallback, useEffect } from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES, TEMPERATURE_LIMITS, STIRRING_LIMITS } from './constants';
import { useLCPDevice } from '../../../../hooks/useLCPDevice';
import { ParametersPanel } from './ParametersPanel';
import './styles.css';
import { useDeviceControl } from '../../../../hooks/useDeviceControl';
import { HotplateParameters } from '../../../../services/lcp/types';

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
  data: {
    id: string;
    inputs?: {
      id: string;
      label: string;
      value?: any;
    }[];
    onDataChange?: (data: any) => void;
  };
}

export const HotplateControl: React.FC<HotplateControlProps> = ({ data }) => {
  const deviceId = 'hotplate-001';
  const {
    status,
    error,
    isConnected,
    sendCommand,
    executeBatch
  } = useDeviceControl<HotplateParameters>(deviceId);

  // Handle file upload complete
  const handleUploadComplete = (inputId: string) => (result: any) => {
    try {
      const commands = parseCommandsFromFile(result.data);
      executeBatch(commands);
      
      // Update node data with file info
      if (data.onDataChange) {
        data.onDataChange({
          ...data,
          inputs: data.inputs?.map(input => 
            input.id === inputId 
              ? { 
                  ...input, 
                  value: {
                    fileName: result.fileName,
                    fileType: result.fileType,
                    data: result.data
                  }
                }
              : input
          )
        });
      }
    } catch (err) {
      console.error('Error executing commands:', err);
    }
  };

  // Parse commands from uploaded file
  const parseCommandsFromFile = (fileContent: string): Array<any> => {
    try {
      const commands = JSON.parse(fileContent);
      return commands.parameters.map((params: any) => ({
        device_id: deviceId,
        command: 'set_parameters',
        parameters: {
          target_temperature: params.target_temperature,
          target_stirring_speed: params.target_stirring_speed,
          heating: params.heating,
          stirring: params.stirring
        }
      }));
    } catch (err) {
      console.error('Error parsing file:', err);
      throw err;
    }
  };

  // Monitor device status
  useEffect(() => {
    if (status) {
      console.log('Hotplate status:', status);
    }
  }, [status]);

  return (
    <div className="hotplate-control">
      <div className="status-indicator">
        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      {status && (
        <div className="parameters">
          <div className="parameter">
            <label>Current Temperature:</label>
            <span>{status.parameters.current_temperature}°C</span>
          </div>
          <div className="parameter">
            <label>Target Temperature:</label>
            <span>{status.parameters.target_temperature}°C</span>
          </div>
          <div className="parameter">
            <label>Current Stirring Speed:</label>
            <span>{status.parameters.current_stirring_speed} rpm</span>
          </div>
          <div className="parameter">
            <label>Target Stirring Speed:</label>
            <span>{status.parameters.target_stirring_speed} rpm</span>
          </div>
          <div className="parameter">
            <label>Heating:</label>
            <span>{status.parameters.heating ? 'On' : 'Off'}</span>
          </div>
          <div className="parameter">
            <label>Stirring:</label>
            <span>{status.parameters.stirring ? 'On' : 'Off'}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
    </div>
  );
};
