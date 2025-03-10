import { UnitOperationType } from '../types';

export const demoComponents: UnitOperationType[] = [
  {
    id: 'demo-category',
    label: 'Demonstration',
    description: 'Components for demonstration purposes',
    components: [
      {
        id: 'color-mixing',
        label: 'Color Mixing Demo',
        description: 'Components for color mixing demonstration',
        nodes: [
          {
            type: 'led-control',
            category: 'hardware',
            label: 'LED Controller',
            description: 'Controls LED brightness and color settings',
            inputs: [],
            outputs: ['brightness'],
            config: {
              parameters: [
                {
                  id: 'brightness',
                  label: 'Brightness',
                  type: 'number',
                  default: 50,
                  min: 0,
                  max: 100,
                  step: 1,
                  unit: '%'
                },
                {
                  id: 'update_rate',
                  label: 'Update Rate',
                  type: 'number',
                  default: 100,
                  min: 10,
                  max: 1000,
                  unit: 'ms'
                }
              ],
              deviceType: 'pico-w',
              communicationType: 'mqtt'
            }
          },
          {
            type: 'light-sensor',
            category: 'hardware',
            label: 'Light Sensor',
            description: 'Reads light intensity values',
            inputs: [],
            outputs: ['intensity'],
            config: {
              parameters: [
                {
                  id: 'sampling_rate',
                  label: 'Sampling Rate',
                  type: 'number',
                  default: 10,
                  min: 1,
                  max: 100,
                  unit: 'Hz'
                },
                {
                  id: 'averaging_window',
                  label: 'Averaging Window',
                  type: 'number',
                  default: 5,
                  min: 1,
                  max: 20,
                  unit: 'samples'
                }
              ],
              deviceType: 'pico-w',
              communicationType: 'mqtt'
            }
          },
          {
            type: 'bayesian-optimizer',
            category: 'optimization',
            label: 'Color Optimizer',
            description: 'Optimizes LED settings using Bayesian optimization',
            inputs: ['sensor_reading'],
            outputs: ['optimal_brightness'],
            config: {
              parameters: [
                {
                  id: 'target_value',
                  label: 'Target Value',
                  type: 'number',
                  default: 50,
                  min: 0,
                  max: 100
                },
                {
                  id: 'optimization_rounds',
                  label: 'Optimization Rounds',
                  type: 'number',
                  default: 10,
                  min: 5,
                  max: 50
                },
                {
                  id: 'exploration_weight',
                  label: 'Exploration Weight',
                  type: 'number',
                  default: 0.1,
                  min: 0,
                  max: 1,
                  step: 0.1
                }
              ]
            }
          },
          {
            type: 'data-logger',
            category: 'data',
            label: 'Data Logger',
            description: 'Logs experiment data to MongoDB',
            inputs: ['brightness', 'sensor_reading', 'optimization_result'],
            outputs: [],
            config: {
              parameters: [
                {
                  id: 'logging_interval',
                  label: 'Logging Interval',
                  type: 'number',
                  default: 1000,
                  min: 100,
                  max: 5000,
                  unit: 'ms'
                }
              ],
              database: {
                type: 'mongodb',
                collection: 'color_mixing_experiments'
              }
            }
          }
        ]
      }
    ]
  }
]; 