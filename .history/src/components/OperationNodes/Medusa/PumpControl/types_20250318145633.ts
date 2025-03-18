import { OperationNode } from '../../../../types/workflow';

export interface PumpControlProps {
  data: OperationNode;
  id: string;
}

export interface PumpControlData extends OperationNode {
  flowRate: number;
  duration: number;
  direction: 'forward' | 'reverse';
}

export interface PumpControlParameters {
  flowRate: {
    value: number;
    unit: 'mL/min';
    range: [number, number];
  };
  duration: {
    value: number;
    unit: 'seconds';
    range: [number, number];
  };
  direction: {
    value: 'forward' | 'reverse';
  };
}
