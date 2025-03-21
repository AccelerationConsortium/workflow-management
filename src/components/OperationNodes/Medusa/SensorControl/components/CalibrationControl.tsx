import React, { useState } from 'react';
import { SENSOR_TYPES, CALIBRATION_POINTS, SENSOR_COMMANDS } from '../constants';
import './CalibrationControl.css';

interface CalibrationControlProps {
  type: keyof typeof SENSOR_TYPES;
  isCalibrating: boolean;
  onCommand: (command: string, params: any) => void;
  disabled?: boolean;
}

export const CalibrationControl: React.FC<CalibrationControlProps> = ({
  type,
  isCalibrating,
  onCommand,
  disabled = false
}) => {
  const [currentPoint, setCurrentPoint] = useState<number>(0);
  const [calibrationValue, setCalibrationValue] = useState<string>('');
  const calibrationPoints = CALIBRATION_POINTS[type];

  const handleStartCalibration = () => {
    setCurrentPoint(0);
    setCalibrationValue('');
    onCommand(SENSOR_COMMANDS.START_CALIBRATION, { type });
  };

  const handleStopCalibration = () => {
    onCommand(SENSOR_COMMANDS.STOP_CALIBRATION, { type });
    setCurrentPoint(0);
    setCalibrationValue('');
  };

  const handleCalibrationPoint = () => {
    const value = parseFloat(calibrationValue);
    if (isNaN(value)) {
      return;
    }

    if (currentPoint === 0) {
      onCommand(SENSOR_COMMANDS.ZERO_CALIBRATION, { 
        type,
        value,
        point: calibrationPoints[currentPoint]
      });
    } else {
      onCommand(SENSOR_COMMANDS.SPAN_CALIBRATION, {
        type,
        value,
        point: calibrationPoints[currentPoint]
      });
    }

    if (currentPoint < calibrationPoints.length - 1) {
      setCurrentPoint(prev => prev + 1);
      setCalibrationValue('');
    } else {
      handleStopCalibration();
    }
  };

  return (
    <div className="calibration-control">
      <div className="calibration-header">
        <h3>Sensor Calibration</h3>
        {!isCalibrating ? (
          <button
            className="start-calibration-button"
            onClick={handleStartCalibration}
            disabled={disabled}
          >
            Start Calibration
          </button>
        ) : (
          <button
            className="stop-calibration-button"
            onClick={handleStopCalibration}
          >
            Cancel Calibration
          </button>
        )}
      </div>

      {isCalibrating && (
        <div className="calibration-content">
          <div className="calibration-progress">
            <div className="progress-indicator">
              {calibrationPoints.map((point, index) => (
                <div
                  key={point}
                  className={`point ${index === currentPoint ? 'current' : ''} ${
                    index < currentPoint ? 'completed' : ''
                  }`}
                >
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="calibration-input">
            <label>
              Enter value for {calibrationPoints[currentPoint]} point:
            </label>
            <div className="input-group">
              <input
                type="number"
                value={calibrationValue}
                onChange={(e) => setCalibrationValue(e.target.value)}
                placeholder="Enter calibration value"
              />
              <button
                onClick={handleCalibrationPoint}
                disabled={!calibrationValue}
              >
                Confirm
              </button>
            </div>
          </div>

          <div className="calibration-instructions">
            <h4>Instructions:</h4>
            <ol>
              <li>Ensure the sensor is in a stable environment</li>
              <li>Wait for the reading to stabilize</li>
              <li>Enter the actual value from your reference</li>
              <li>Click confirm to proceed to the next point</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}; 
