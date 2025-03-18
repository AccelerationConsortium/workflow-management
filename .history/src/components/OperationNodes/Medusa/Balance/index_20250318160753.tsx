import React, { useState, useCallback } from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES, BALANCE_SPECS } from './constants';
import './styles.css';

interface BalanceControlPanelProps {
  data: {
    targetWeight: number;
    currentWeight: number;
    tolerance: number;
    unit: string;
    isStable: boolean;
    tare: boolean;
  };
  onChange?: (data: any) => void;
}

const BalanceControlPanel: React.FC<BalanceControlPanelProps> = ({ data, onChange }) => {
  const [localData, setLocalData] = useState(data);

  const handleChange = useCallback((field: string, value: number | boolean) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  }, [localData, onChange]);

  const handleNumberInput = useCallback((field: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
      handleChange(field, numValue);
    }
  }, [handleChange]);

  return (
    <div className="balance-control-panel">
      <div className="parameter-group">
        <div className="parameter">
          <label>Target Weight ({localData.unit})</label>
          <input
            type="number"
            value={localData.targetWeight}
            min={0}
            step={0.001}
            onChange={(e) => handleNumberInput('targetWeight', e.target.value)}
          />
        </div>
        <div className="parameter">
          <label>Current Weight ({localData.unit})</label>
          <input
            type="number"
            value={localData.currentWeight}
            readOnly
            className="read-only"
          />
        </div>
        <div className="parameter">
          <label>Tolerance (±{localData.unit})</label>
          <input
            type="number"
            value={localData.tolerance}
            min={0}
            step={0.001}
            onChange={(e) => handleNumberInput('tolerance', e.target.value)}
          />
        </div>
      </div>

      <div className="control-switches">
        <div className="switch-group">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localData.tare}
              onChange={(e) => handleChange('tare', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="switch-label">Tare</span>
        </div>
      </div>

      <div className="status-indicator">
        <div className={`dot ${localData.isStable ? 'active' : ''}`}></div>
        <span className="status-text">
          {localData.isStable ? 'Stable' : 'Unstable'}
        </span>
      </div>
    </div>
  );
};

const BalanceWrapper = (props: any) => {
  const BaseNode = createNodeComponent('Medusa');
  return (
    <div className="balance-control-wrapper">
      <BaseNode {...props} />
      <BalanceControlPanel
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

export const Balance = BalanceWrapper; 
