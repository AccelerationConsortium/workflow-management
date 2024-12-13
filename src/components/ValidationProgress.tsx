import React from 'react';
import { ValidationProgress } from '../services/workflowValidator';
import './ValidationProgress.css';

interface ValidationProgressBarProps {
  progress: ValidationProgress;
}

export const ValidationProgressBar: React.FC<ValidationProgressBarProps> = ({ progress }) => {
  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'logic': return 'Logic Validation';
      case 'environment': return 'Environment Validation';
      case 'simulation': return 'Workflow Simulation';
      default: return 'Unknown Stage';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#4BBCD4';
      case 'completed': return '#4CAF50';
      case 'error': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <div className="validation-progress">
      <div className="progress-header">
        <span className="stage-label">
          {getStatusIcon(progress.status)} {getStageLabel(progress.stage)}
        </span>
        <span className="progress-percentage">{Math.round(progress.progress)}%</span>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar"
          style={{ 
            width: `${progress.progress}%`,
            backgroundColor: getStatusColor(progress.status)
          }}
        />
      </div>
      
      {progress.currentItem && (
        <div className="current-item">
          Currently checking: {progress.currentItem}
        </div>
      )}
      
      {progress.details && progress.details.length > 0 && (
        <div className="validation-details">
          {progress.details.map((detail, index) => (
            <div key={index} className="detail-item">
              • {detail}
            </div>
          ))}
        </div>
      )}
      
      {progress.message && (
        <div className="progress-message">
          {progress.message}
        </div>
      )}
    </div>
  );
}; 