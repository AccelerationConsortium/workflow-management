import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface VolumeDisplayProps {
  currentVolume: number;
  targetVolume: number | null;
}

export const VolumeDisplay: React.FC<VolumeDisplayProps> = ({ currentVolume, targetVolume }) => {
  const percentage = targetVolume ? (currentVolume / targetVolume) * 100 : 0;
  const formattedVolume = currentVolume.toFixed(1);
  const formattedTarget = targetVolume?.toFixed(1) || 'N/A';

  return (
    <div className="volume-display">
      <div className="volume-progress">
        <CircularProgressbar
          value={percentage}
          text={`${formattedVolume}mL`}
          styles={buildStyles({
            textSize: '16px',
            pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
            textColor: '#333',
            trailColor: '#d6d6d6',
            pathTransitionDuration: 0.5
          })}
        />
      </div>
      <div className="volume-info">
        <div className="volume-item">
          <label>Current Volume:</label>
          <span>{formattedVolume} mL</span>
        </div>
        <div className="volume-item">
          <label>Target Volume:</label>
          <span>{formattedTarget} mL</span>
        </div>
        {targetVolume && (
          <div className="volume-item">
            <label>Progress:</label>
            <span>{percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}; 
