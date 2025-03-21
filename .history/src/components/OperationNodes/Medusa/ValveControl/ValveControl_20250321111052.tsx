import React, { useState, useEffect } from 'react';
import { ValvePositionDisplay } from './components/ValvePositionDisplay';
import { 
  DEFAULT_VALUES, 
  VALVE_COMMANDS, 
  VALVE_MODES,
  FLOW_PATHS,
  VALVE_POSITIONS,
  VALVE_STATUS
} from './constants';
import './styles.css';

interface ValveControlProps {
  deviceId: string;
  isConnected: boolean;
  isSimulation?: boolean;
  onCommand?: (command: string, params: any) => void;
  onError?: (error: string) => void;
}

export const ValveControl: React.FC<ValveControlProps> = ({
  deviceId,
  isConnected,
  isSimulation = false,
  onCommand,
  onError
}) => {
  // State
  const [position, setPosition] = useState(DEFAULT_VALUES.position);
  const [isMoving, setIsMoving] = useState(DEFAULT_VALUES.isMoving);
  const [mode, setMode] = useState(DEFAULT_VALUES.mode);
  const [flowPath, setFlowPath] = useState(DEFAULT_VALUES.flowPath);
  const [status, setStatus] = useState<keyof typeof VALVE_STATUS>('idle');
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
      onCommand?.(command, params);
      
      if (isSimulation) {
        // Simulate valve movement
        setIsMoving(true);
        setTimeout(() => {
          setIsMoving(false);
          switch (command) {
            case VALVE_COMMANDS.SET_POSITION:
              setPosition(params.position);
              break;
            case VALVE_COMMANDS.SET_FLOW_PATH:
              setFlowPath(params.flowPath);
              setPosition(FLOW_PATHS[params.flowPath].position);
              break;
            case VALVE_COMMANDS.HOME:
              setPosition(1);
              break;
          }
        }, 1000);
      }
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handlePositionChange = (newPosition: number) => {
    if (newPosition < VALVE_POSITIONS.min || newPosition > VALVE_POSITIONS.max) {
      handleError('Invalid position');
      return;
    }
    sendCommand(VALVE_COMMANDS.SET_POSITION, { position: newPosition });
  };

  const handleFlowPathChange = (newFlowPath: keyof typeof FLOW_PATHS) => {
    sendCommand(VALVE_COMMANDS.SET_FLOW_PATH, { flowPath: newFlowPath });
  };

  const handleHome = () => {
    sendCommand(VALVE_COMMANDS.HOME);
  };

  const handleStop = () => {
    sendCommand(VALVE_COMMANDS.STOP);
    setIsMoving(false);
  };

  const handleEmergencyStop = () => {
    sendCommand(VALVE_COMMANDS.EMERGENCY_STOP);
    setIsMoving(false);
    setStatus('error');
  };

  const handleModeChange = (newMode: keyof typeof VALVE_MODES) => {
    setMode(newMode);
  };

  // Effects
  useEffect(() => {
    if (!isConnected) {
      setStatus('idle');
      setError(null);
    }
  }, [isConnected]);

  return (
    <div className="valve-control">
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

      <div className="valve-display">
        <ValvePositionDisplay
          currentPosition={position}
          isMoving={isMoving}
          flowPath={flowPath}
        />
      </div>

      <div className="control-panel">
        <div className="mode-selector">
          <label>Mode:</label>
          <select
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as keyof typeof VALVE_MODES)}
            disabled={isMoving || !isConnected}
          >
            {Object.entries(VALVE_MODES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>

        {mode === 'position' ? (
          <div className="position-controls">
            <label>Position:</label>
            <input
              type="number"
              min={VALVE_POSITIONS.min}
              max={VALVE_POSITIONS.max}
              value={position}
              onChange={(e) => handlePositionChange(parseInt(e.target.value))}
              disabled={isMoving || !isConnected}
            />
          </div>
        ) : (
          <div className="flow-path-controls">
            <label>Flow Path:</label>
            <select
              value={flowPath}
              onChange={(e) => handleFlowPathChange(e.target.value as keyof typeof FLOW_PATHS)}
              disabled={isMoving || !isConnected}
            >
              {Object.entries(FLOW_PATHS).map(([key, value]) => (
                <option key={key} value={key}>{`${value.from} → ${value.to}`}</option>
              ))}
            </select>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={handleHome}
            disabled={isMoving || !isConnected}
            className="home-button"
          >
            Home
          </button>
          <button
            onClick={handleStop}
            disabled={!isMoving || !isConnected}
            className="stop-button"
          >
            Stop
          </button>
          <button
            onClick={handleEmergencyStop}
            className="emergency-stop-button"
          >
            Emergency Stop
          </button>
        </div>
      </div>

      <div className="status-display">
        <div>Status: {VALVE_STATUS[status]}</div>
        <div>Current Position: {position}</div>
        {mode === 'flow_path' && (
          <div>Flow Path: {`${FLOW_PATHS[flowPath].from} → ${FLOW_PATHS[flowPath].to}`}</div>
        )}
      </div>
    </div>
  );
}; 
