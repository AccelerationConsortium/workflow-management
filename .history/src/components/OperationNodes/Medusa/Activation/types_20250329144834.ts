import { OperationNode } from '../../../../types/workflow';

export interface ActivationProps {
  data: OperationNode;
  id: string;
}

export interface ActivationData extends OperationNode {
  isActive: boolean;
  activationTime: number;
  deactivationTime: number;
  mode: 'manual' | 'timed';
}

export interface ActivationParameters {
  mode: {
    value: 'manual' | 'timed';
  };
  activationTime: {
    value: number;
    unit: 'seconds';
    range: [number, number];
  };
  deactivationTime: {
    value: number;
    unit: 'seconds';
    range: [number, number];
  };
} 
