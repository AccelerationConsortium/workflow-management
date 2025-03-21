import React, { useState, useEffect, useCallback } from 'react';
import { SensorDataDisplay } from './components/SensorDataDisplay';
import { CalibrationControl } from './components/CalibrationControl';
import {
  DEFAULT_VALUES,
  SENSOR_TYPES,
  UNITS,
  SENSOR_COMMANDS,
  SENSOR_STATUS,
  RECORDING_SETTINGS,
  ALARM_SETTINGS
} from './constants';
import './styles.css';

interface DataPoint {
  value: number;
  timestamp: number;
}

interface SensorControlProps {
  deviceId: string;
  type: keyof typeof SENSOR_TYPES;
  isConnected: boolean;
  isSimulation?: boolean;
  onCommand?: (command: string, params: any) => void;
  onError?: (error: string) => void;
}

export const SensorControl: React.FC<SensorControlProps> = ({
  deviceId,
  type,
  isConnected,
  isSimulation = false,
  onCommand,
  onError
}) => {
  // State
  const [value, setValue] = useState<number>(DEFAULT_VALUES.value);
  const [unit, setUnit] = useState<string>(UNITS[type][0]);
  const [status, setStatus] = useState<keyof typeof SENSOR_STATUS>('normal');
  const [isRecording, setIsRecording] = useState(DEFAULT_VALUES.isRecording);
  const [isCalibrating, setIsCalibrating] = useState(DEFAULT_VALUES.isCalibrating);
  const [historyData, setHistoryData] = useState<DataPoint[]>([]);
  const [alarmThresholds, setAlarmThresholds] = useState<{high: number; low: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleError = (message: string) => {
    setError(message);
    onError?.(message);
  };

  const sendCommand = async (command: string, params: any = {}) => {
    if (!isConnected && !isSimulation) {
      handleError('Device not connected');
      return;
    }

    try {
      onCommand?.(command, { deviceId, type, ...params });
      
      if (isSimulation) {
        // Simulate sensor behavior
        switch (command) {
          case SENSOR_COMMANDS.START_RECORDING:
            setIsRecording(true);
            break;
          case SENSOR_COMMANDS.STOP_RECORDING:
            setIsRecording(false);
            break;
          case SENSOR_COMMANDS.START_CALIBRATION:
            setIsCalibrating(true);
            setStatus('calibrating');
            break;
          case SENSOR_COMMANDS.STOP_CALIBRATION:
            setIsCalibrating(false);
            setStatus('normal');
            break;
          case SENSOR_COMMANDS.SET_ALARM_THRESHOLD:
            setAlarmThresholds(params.thresholds);
            break;
        }
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (UNITS[type].includes(newUnit)) {
      setUnit(newUnit);
    }
  };

  const handleAlarmThresholds = (high: number, low: number) => {
    sendCommand(SENSOR_COMMANDS.SET_ALARM_THRESHOLD, {
      thresholds: { high, low }
    });
  };

  const handleRecording = () => {
    if (isRecording) {
      sendCommand(SENSOR_COMMANDS.STOP_RECORDING);
    } else {
      sendCommand(SENSOR_COMMANDS.START_RECORDING, {
        interval: RECORDING_SETTINGS.defaultInterval
      });
    }
  };

  const handleExport = () => {
    sendCommand(SENSOR_COMMANDS.EXPORT_DATA, {
      format: RECORDING_SETTINGS.exportFormats[0],
      data: historyData
    });
  };

  // Simulation
  const simulateReading = useCallback(() => {
    if (isSimulation && isConnected) {
      const baseValue = 25; // Base value for simulation
      const noise = (Math.random() - 0.5) * 2; // Random noise ±1
      const newValue = baseValue + noise;
      
      setValue(newValue);
      
      if (historyData.length >= RECORDING_SETTINGS.maxPoints) {
        setHistoryData(prev => [...prev.slice(1), { value: newValue, timestamp: Date.now() }]);
      } else {
        setHistoryData(prev => [...prev, { value: newValue, timestamp: Date.now() }]);
      }

      // Check alarm thresholds
      if (alarmThresholds) {
        if (newValue > alarmThresholds.high) {
          setStatus('alarm');
        } else if (newValue < alarmThresholds.low) {
          setStatus('alarm');
        } else {
          setStatus('normal');
        }
      }
    }
  }, [isSimulation, isConnected, alarmThresholds]);

  // Effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSimulation && isConnected) {
      interval = setInterval(simulateReading, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSimulation, isConnected, simulateReading]);

  useEffect(() => {
    if (!isConnected) {
      setStatus('normal');
      setError(null);
      setIsRecording(false);
      setIsCalibrating(false);
    }
  }, [isConnected]);

  return (
    <div className="sensor-control">
      <div className="connection-status">
        <span className={`status-dot ${isConnected ? 'connected' : ''}`} />
        {isConnected ? 'Connected' : 'Disconnected'}
        {isSimulation && ' (Simulation)'}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="sensor-display">
        <SensorDataDisplay
          type={type}
          currentValue={value}
          unit={unit}
          status={status}
          historyData={historyData}
          alarmThresholds={alarmThresholds}
        />
      </div>

      <div className="control-panel">
        <div className="settings-group">
          <div className="unit-selector">
            <label>Unit:</label>
            <select
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              disabled={!isConnected}
            >
              {UNITS[type].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="alarm-settings">
            <label>Alarm Thresholds:</label>
            <div className="threshold-inputs">
              <input
                type="number"
                placeholder="High"
                value={alarmThresholds?.high ?? ''}
                onChange={(e) => handleAlarmThresholds(
                  parseFloat(e.target.value),
                  alarmThresholds?.low ?? 0
                )}
                disabled={!isConnected}
              />
              <input
                type="number"
                placeholder="Low"
                value={alarmThresholds?.low ?? ''}
                onChange={(e) => handleAlarmThresholds(
                  alarmThresholds?.high ?? 0,
                  parseFloat(e.target.value)
                )}
                disabled={!isConnected}
              />
            </div>
          </div>
        </div>

        <div className="recording-controls">
          <button
            onClick={handleRecording}
            disabled={!isConnected}
            className={isRecording ? 'stop-recording' : 'start-recording'}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <button
            onClick={handleExport}
            disabled={!isConnected || historyData.length === 0}
            className="export-button"
          >
            Export Data
          </button>
        </div>
      </div>

      <CalibrationControl
        type={type}
        isCalibrating={isCalibrating}
        onCommand={sendCommand}
        disabled={!isConnected || isRecording}
      />
    </div>
  );
}; 
