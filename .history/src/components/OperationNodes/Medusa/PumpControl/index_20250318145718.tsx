import React from 'react';
import { BaseNode } from '../../../BaseNode';
import { PumpControlProps } from './types';
import { DEFAULT_VALUES, PUMP_SPECS } from './constants';
import './styles.css';

export const PumpControl: React.FC<PumpControlProps> = ({ data, id }) => {
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
        range: [0.1, 10],
        default: DEFAULT_VALUES.flowRate
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'number',
        unit: 'seconds',
        range: [1, 3600],
        default: DEFAULT_VALUES.duration
      },
      {
        name: 'direction',
        label: 'Direction',
        type: 'string',
        default: DEFAULT_VALUES.direction
      }
    ],
    inputs: [
      {
        id: 'liquid-in',
        label: 'Liquid Input',
        type: 'liquid',
        required: true,
        description: 'Input liquid to be pumped'
      }
    ],
    outputs: [
      {
        id: 'liquid-out',
        label: 'Liquid Output',
        type: 'liquid',
        description: 'Pumped liquid output'
      }
    ],
    primitives: [
      {
        id: 'start-pump',
        name: 'Start Pump',
        description: 'Start the pump with specified flow rate',
        order: 1,
        pythonCode: `def start_pump(flow_rate: float, direction: str = 'forward'):
    pump.set_direction(direction)
    pump.start(flow_rate)
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'float',
            default: DEFAULT_VALUES.flowRate,
            description: 'Flow rate in mL/min'
          },
          {
            name: 'direction',
            type: 'string',
            default: DEFAULT_VALUES.direction,
            description: 'Pump direction (forward/reverse)'
          }
        ]
      },
      {
        id: 'stop-pump',
        name: 'Stop Pump',
        description: 'Stop the pump',
        order: 2,
        pythonCode: `def stop_pump():
    pump.stop()
    return True`
      },
      {
        id: 'run-timed',
        name: 'Run for Duration',
        description: 'Run pump for specified duration',
        order: 3,
        pythonCode: `def run_timed(flow_rate: float, duration: int, direction: str = 'forward'):
    pump.set_direction(direction)
    pump.start(flow_rate)
    time.sleep(duration)
    pump.stop()
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'float',
            default: DEFAULT_VALUES.flowRate,
            description: 'Flow rate in mL/min'
          },
          {
            name: 'duration',
            type: 'int',
            default: DEFAULT_VALUES.duration,
            description: 'Duration in seconds'
          },
          {
            name: 'direction',
            type: 'string',
            default: DEFAULT_VALUES.direction,
            description: 'Pump direction (forward/reverse)'
          }
        ]
      }
    ]
  };

  return <BaseNode data={nodeData} />;
};
