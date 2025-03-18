import React from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES } from './constants';
import './styles.css';

const PumpControlPanel = ({ data }) => (
  <div className="pump-control-panel">
    <div className="parameter-group">
      <div className="parameter">
        <label>Flow Rate (mL/min):</label>
        <input 
          type="number" 
          value={data.parameters?.flowRate || DEFAULT_VALUES.flowRate}
          min={0.1}
          max={10}
          step={0.1}
        />
      </div>
      <div className="parameter">
        <label>Duration (seconds):</label>
        <input 
          type="number" 
          value={data.parameters?.duration || DEFAULT_VALUES.duration}
          min={1}
          max={3600}
          step={1}
        />
      </div>
      <div className="parameter">
        <label>Direction:</label>
        <div className="direction-controls">
          <button 
            className={data.parameters?.direction === 'forward' ? 'active' : ''}
          >
            Forward
          </button>
          <button 
            className={data.parameters?.direction === 'reverse' ? 'active' : ''}
          >
            Reverse
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PumpControlWrapper = (props) => {
  const BaseNode = createNodeComponent('Medusa');
  return (
    <div className="pump-control-wrapper">
      <BaseNode {...props} />
      <PumpControlPanel data={props.data} />
    </div>
  );
};

export const PumpControl = PumpControlWrapper;
