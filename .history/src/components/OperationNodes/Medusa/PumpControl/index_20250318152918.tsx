import React, { useState } from 'react';
import { BaseNode } from '../../../BaseNode';
import { PumpControlProps } from './types';
import { DEFAULT_VALUES, PUMP_SPECS } from './constants';
import './styles.css';

export const PumpControl: React.FC<PumpControlProps> = ({ data, id }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Combine default values with provided data
  const nodeData = {
    ...data,
    id,
    specs: PUMP_SPECS,
    parameters: [
      {
        name: 'flowRate',
        label: 'Flow Rate',
        type: 'number',
        unit: 'mL/min',
        range: { min: 0.1, max: 10 },
        default: DEFAULT_VALUES.flowRate
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'number',
        unit: 'min',
        range: { min: 0.1, max: 60 },
        default: DEFAULT_VALUES.duration
      },
      {
        name: 'direction',
        label: 'Direction',
        type: 'select',
        options: ['forward', 'reverse'],
        default: DEFAULT_VALUES.direction
      }
    ],
    inputs: [
      {
        name: 'liquid',
        label: 'Liquid Input',
        type: 'liquid',
        required: true
      }
    ],
    outputs: [
      {
        name: 'pumped_liquid',
        label: 'Pumped Liquid',
        type: 'liquid'
      }
    ],
    primitives: [
      {
        name: 'start-pump',
        description: 'Start the pump with specified flow rate and direction',
        code: `
def start_pump(flow_rate: float, direction: str):
    pump.set_flow_rate(flow_rate)
    pump.set_direction(direction)
    pump.start()
`,
        parameters: ['flowRate', 'direction']
      },
      {
        name: 'stop-pump',
        description: 'Stop the pump',
        code: `
def stop_pump():
    pump.stop()
`,
        parameters: []
      },
      {
        name: 'run-timed',
        description: 'Run the pump for a specified duration',
        code: `
def run_timed(flow_rate: float, duration: float, direction: str):
    pump.set_flow_rate(flow_rate)
    pump.set_direction(direction)
    pump.run_for_duration(duration)
`,
        parameters: ['flowRate', 'duration', 'direction']
      }
    ]
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="pump-control-wrapper">
      <BaseNode data={nodeData} onClick={handleClick} />
      {isExpanded && (
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
              <label>Duration (min):</label>
              <input 
                type="number" 
                value={data.parameters?.duration || DEFAULT_VALUES.duration}
                min={0.1}
                max={60}
                step={0.1}
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
      )}
    </div>
  );
};
