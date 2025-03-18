import React from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES } from './constants';
import './styles.css';

const ValveControlPanel = ({ data }) => (
  <div className="valve-control-panel">
    <div className="parameter-group">
      <div className="parameter">
        <label>Position:</label>
        <div className="position-controls">
          <button 
            className={data.parameters?.position === 'open' ? 'active' : ''}
          >
            Open
          </button>
          <button 
            className={data.parameters?.position === 'closed' ? 'active' : ''}
          >
            Closed
          </button>
        </div>
      </div>
      {data.parameters?.isMultiPort && (
        <div className="parameter">
          <label>Port Selection:</label>
          <select 
            value={data.parameters?.selectedPort || DEFAULT_VALUES.selectedPort}
          >
            <option value="1">Port 1</option>
            <option value="2">Port 2</option>
            <option value="3">Port 3</option>
            <option value="4">Port 4</option>
          </select>
        </div>
      )}
      <div className="parameter">
        <label>Switching Time (ms):</label>
        <input 
          type="number" 
          value={data.parameters?.switchingTime || DEFAULT_VALUES.switchingTime}
          min={100}
          max={5000}
          step={100}
        />
      </div>
    </div>
  </div>
);

const ValveControlWrapper = (props) => {
  const BaseNode = createNodeComponent('Medusa');
  return (
    <div className="valve-control-wrapper">
      <BaseNode {...props} />
      <ValveControlPanel data={props.data} />
    </div>
  );
};

export const ValveControl = ValveControlWrapper;
