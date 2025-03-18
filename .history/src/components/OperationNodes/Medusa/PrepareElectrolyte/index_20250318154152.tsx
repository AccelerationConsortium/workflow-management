import React from 'react';
import { createNodeComponent } from '../../index';
import { DEFAULT_VALUES } from './constants';
import './styles.css';

const PrepareElectrolytePanel = ({ data }) => (
  <div className="prepare-electrolyte-panel">
    <div className="parameter-group">
      <div className="parameter">
        <label>Mixing Speed (RPM):</label>
        <input 
          type="number" 
          value={data.parameters?.mixingSpeed || DEFAULT_VALUES.mixingSpeed}
          min={100}
          max={1000}
          step={10}
        />
      </div>
      <div className="parameter">
        <label>Mixing Time (min):</label>
        <input 
          type="number" 
          value={data.parameters?.mixingTime || DEFAULT_VALUES.mixingTime}
          min={1}
          max={120}
          step={1}
        />
      </div>
    </div>
  </div>
);

const PrepareElectrolyteWrapper = (props) => {
  const BaseNode = createNodeComponent('Medusa');
  return (
    <div className="prepare-electrolyte-wrapper">
      <BaseNode {...props} />
      <PrepareElectrolytePanel data={props.data} />
    </div>
  );
};

export const PrepareElectrolyte_1 = PrepareElectrolyteWrapper; 
