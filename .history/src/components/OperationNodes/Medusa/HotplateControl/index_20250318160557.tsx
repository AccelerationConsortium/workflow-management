import React, { useState, useCallback } from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES, TEMPERATURE_LIMITS, STIRRING_LIMITS } from './constants';
import './styles.css';

interface HotplateControlPanelProps {
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

const HotplateControlPanel: React.FC<HotplateControlPanelProps> = ({ data, onChange }) => {
  const [localData, setLocalData] = useState(data);

  const handleChange = useCallback((field: string, value: number | boolean) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  }, [localData, onChange]);

  const handleNumberInput = useCallback((field: string, value: string, limits: { min: number; max: number }) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= limits.min && numValue <= limits.max) {
      handleChange(field, numValue);
    }
  }, [handleChange]);

  return (
    <div className="hotplate-control-panel">
      <div className="parameter-group">
        <div className="parameter">
          <label>Target Temperature (°C)</label>
          <input
            type="number"
            value={localData.targetTemp}
            min={TEMPERATURE_LIMITS.min}
            max={TEMPERATURE_LIMITS.max}
            onChange={(e) => handleNumberInput('targetTemp', e.target.value, TEMPERATURE_LIMITS)}
          />
        </div>
        <div className="parameter">
          <label>Current Temperature (°C)</label>
          <input
            type="number"
            value={localData.temperature}
            min={TEMPERATURE_LIMITS.min}
            max={TEMPERATURE_LIMITS.max}
            onChange={(e) => handleNumberInput('temperature', e.target.value, TEMPERATURE_LIMITS)}
          />
        </div>
        <div className="parameter">
          <label>Stirring Speed (rpm)</label>
          <input
            type="number"
            value={localData.stirringSpeed}
            min={STIRRING_LIMITS.min}
            max={STIRRING_LIMITS.max}
            onChange={(e) => handleNumberInput('stirringSpeed', e.target.value, STIRRING_LIMITS)}
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
    </div>
  );
};

const HotplateControlWrapper = (props: any) => {
  const BaseNode = createNodeComponent('Medusa');
  return (
    <div className="hotplate-control-wrapper">
      <BaseNode {...props} />
      <HotplateControlPanel
        data={props.data || DEFAULT_VALUES}
        onChange={(newData) => {
          props.onChange?.({
            ...props.data,
            ...newData,
          });
        }}
      />
    </div>
  );
};

export const HotplateControl = HotplateControlWrapper;
