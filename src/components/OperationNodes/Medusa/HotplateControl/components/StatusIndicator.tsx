import React from 'react';
import { DeviceStatus, HotplateParameters } from '../../../../../services/lcp/types';
import { HOTPLATE_CONSTANTS } from '../constants';
import '../styles.css';

interface StatusIndicatorProps {
  status: DeviceStatus<HotplateParameters> | null;
  isConnected: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, isConnected }) => {
  const getStatusColor = () => {
    if (!isConnected) return 'offline';
    if (status?.status === 'error') return 'error';
    if (status?.parameters.heating || status?.parameters.stirring) return 'working';
    return 'online';
  };

  const getStatusText = () => {
    if (!isConnected) return HOTPLATE_CONSTANTS.STATUS_MESSAGES.DISCONNECTED;
    if (status?.status === 'error') return HOTPLATE_CONSTANTS.STATUS_MESSAGES.ERROR;
    
    const actions = [];
    if (status?.parameters.heating) actions.push('Heating');
    if (status?.parameters.stirring) actions.push('Stirring');
    
    return actions.length > 0 
      ? actions.join(' & ') 
      : HOTPLATE_CONSTANTS.STATUS_MESSAGES.CONNECTED;
  };

  return (
    <div className="device-status">
      <div className={`status-indicator status-${getStatusColor()}`} />
      <div className="status-details">
        <span className="status-text">{getStatusText()}</span>
        {status?.parameters && (
          <div className="status-parameters">
            <span className="parameter-value">
              {status.parameters.current_temperature.toFixed(1)}°C
            </span>
            <span className="parameter-separator">|</span>
            <span className="parameter-value">
              {status.parameters.current_stirring_speed} RPM
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 
