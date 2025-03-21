import React, { useState, useCallback, useEffect } from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES, FLOW_RATE_LIMITS, VOLUME_LIMITS } from './constants';
import { useLCPDevice } from '../../../../hooks/useLCPDevice';
import { useWorkflowContext } from '../../../../contexts/WorkflowContext';
import { StatusIndicator } from '../../../../components/StatusIndicator';
import { FlowRateChart } from './components/FlowRateChart';
import { VolumeDisplay } from './components/VolumeDisplay';
import './styles.css';

interface PumpControlPanelProps {
  deviceId: string;
  data: {
    flowRate: number;
    targetVolume: number;
    direction: 'forward' | 'reverse';
    isRunning: boolean;
    mode: 'continuous' | 'volume';
    currentVolume: number;
  };
  onChange?: (data: any) => void;
}

export const PumpControlPanel: React.FC<PumpControlPanelProps> = ({ deviceId, data, onChange }) => {
  const [localData, setLocalData] = useState(data);
  const { state: deviceState, sendCommand } = useLCPDevice(deviceId);
  const { workflowMode, isSimulating } = useWorkflowContext();

  // Update local data when device data changes
  useEffect(() => {
    if (deviceState.data) {
      const newData = {
        flowRate: deviceState.data.flow_rate || localData.flowRate,
        targetVolume: deviceState.data.target_volume || localData.targetVolume,
        direction: deviceState.data.direction || localData.direction,
        isRunning: deviceState.data.is_running || localData.isRunning,
        mode: deviceState.data.mode || localData.mode,
        currentVolume: deviceState.data.current_volume || localData.currentVolume
      };
      setLocalData(newData);
      onChange?.(newData);
    }
  }, [deviceState.data]);

  const handleChange = useCallback(async (field: string, value: any) => {
    if (!isSimulating && workflowMode !== 'edit') {
      console.log('Changes only allowed in edit or simulation mode');
      return;
    }

    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);

    try {
      switch (field) {
        case 'flowRate':
          await sendCommand('set_flow_rate', { flow_rate: value });
          break;
        case 'targetVolume':
          await sendCommand('set_target_volume', { volume: value });
          break;
        case 'direction':
          await sendCommand('set_direction', { direction: value });
          break;
        case 'isRunning':
          if (value) {
            await sendCommand('start_pump', {
              flow_rate: localData.flowRate,
              direction: localData.direction,
              mode: localData.mode,
              target_volume: localData.targetVolume
            });
          } else {
            await sendCommand('stop_pump');
          }
          break;
        case 'mode':
          await sendCommand('set_mode', { mode: value });
          break;
      }
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  }, [localData, sendCommand, isSimulating, workflowMode]);

  const handleNumberInput = useCallback((field: string, value: string, limits: { min: number; max: number }) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= limits.min && numValue <= limits.max) {
      handleChange(field, numValue);
    }
  }, [handleChange]);

  const handleEmergencyStop = useCallback(async () => {
    try {
      await sendCommand('emergency_stop');
      setLocalData(prev => ({ ...prev, isRunning: false }));
    } catch (error) {
      console.error('Failed to execute emergency stop:', error);
    }
  }, [sendCommand]);

  return (
    <div className="pump-control-panel">
      <div className="connection-status">
        <div className={`status-dot ${deviceState.isConnected ? 'connected' : 'disconnected'}`} />
        <span>{deviceState.isConnected ? 'Connected' : 'Disconnected'}</span>
        {deviceState.error && <div className="error-message">{deviceState.error}</div>}
      </div>

      <div className="parameter-group">
        <div className="parameter">
          <label>Flow Rate (mL/min)</label>
          <input
            type="number"
            value={localData.flowRate}
            min={FLOW_RATE_LIMITS.min}
            max={FLOW_RATE_LIMITS.max}
            step={0.1}
            onChange={(e) => handleNumberInput('flowRate', e.target.value, FLOW_RATE_LIMITS)}
            disabled={!deviceState.isConnected || deviceState.isLoading || localData.isRunning}
          />
        </div>

        <div className="parameter">
          <label>Mode</label>
          <select
            value={localData.mode}
            onChange={(e) => handleChange('mode', e.target.value)}
            disabled={!deviceState.isConnected || deviceState.isLoading || localData.isRunning}
          >
            <option value="continuous">Continuous</option>
            <option value="volume">Volume</option>
          </select>
        </div>

        {localData.mode === 'volume' && (
          <div className="parameter">
            <label>Target Volume (mL)</label>
            <input
              type="number"
              value={localData.targetVolume}
              min={VOLUME_LIMITS.min}
              max={VOLUME_LIMITS.max}
              step={0.1}
              onChange={(e) => handleNumberInput('targetVolume', e.target.value, VOLUME_LIMITS)}
              disabled={!deviceState.isConnected || deviceState.isLoading || localData.isRunning}
            />
          </div>
        )}

        <div className="parameter">
          <label>Direction</label>
          <div className="direction-controls">
            <button
              className={`direction-btn ${localData.direction === 'forward' ? 'active' : ''}`}
              onClick={() => handleChange('direction', 'forward')}
              disabled={!deviceState.isConnected || deviceState.isLoading || localData.isRunning}
            >
              Forward
            </button>
            <button
              className={`direction-btn ${localData.direction === 'reverse' ? 'active' : ''}`}
              onClick={() => handleChange('direction', 'reverse')}
              disabled={!deviceState.isConnected || deviceState.isLoading || localData.isRunning}
            >
              Reverse
            </button>
          </div>
        </div>
      </div>

      <div className="control-group">
        <button
          className={`start-stop-btn ${localData.isRunning ? 'stop' : 'start'}`}
          onClick={() => handleChange('isRunning', !localData.isRunning)}
          disabled={!deviceState.isConnected || deviceState.isLoading}
        >
          {localData.isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          className="emergency-stop-btn"
          onClick={handleEmergencyStop}
          disabled={!deviceState.isConnected || !localData.isRunning}
        >
          Emergency Stop
        </button>
      </div>

      <div className="status-section">
        <StatusIndicator
          status={localData.isRunning ? 'running' : 'idle'}
          direction={localData.direction}
          flowRate={localData.flowRate}
        />
        <VolumeDisplay
          currentVolume={localData.currentVolume}
          targetVolume={localData.mode === 'volume' ? localData.targetVolume : null}
        />
      </div>

      <FlowRateChart
        data={deviceState.data?.flow_rate_history || []}
        currentFlowRate={localData.flowRate}
      />

      {deviceState.isLoading && <div className="loading-overlay">Processing...</div>}
    </div>
  );
};

interface PumpNodeProps {
  data: any;
  selected?: boolean;
  onChange?: (data: any) => void;
}

const PumpNode: React.FC<PumpNodeProps> = ({ data, selected, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const BaseNode = createNodeComponent('Medusa');

  return (
    <div className="pump-node">
      <BaseNode
        {...data}
        selected={selected}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      <PumpControlPanel
        deviceId={data.deviceId || 'pump-001'}
        data={data}
        onChange={onChange}
      />
    </div>
  );
};

export const PumpControl = PumpNode;
