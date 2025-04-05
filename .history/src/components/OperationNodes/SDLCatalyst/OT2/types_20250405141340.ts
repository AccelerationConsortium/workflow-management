export interface Labware {
  id: string;
  type: string;
  position: string;
  label: string;
}

export interface LiquidHandlingStep {
  id: string;
  sourceLabware: string;
  sourceWell: string;
  destinationLabware: string;
  destinationWell: string;
  volume: number;
}

export interface PositionOffset {
  x: number;
  y: number;
  z: number;
}

export interface TipRack {
  id: string;
  type: string;
  position: string;
}

export interface TipManagement {
  tipRacks: TipRack[];
}

export interface OT2Parameters {
  ipAddress: string;
  pipetteType: string;
  mountPosition: string;
  labwareConfig: Labware[];
  liquidHandlingSteps: LiquidHandlingStep[];
  positionOffset: PositionOffset;
  tipManagement: TipManagement;
}

export interface TabComponentProps {
  parameters: any;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
} 
