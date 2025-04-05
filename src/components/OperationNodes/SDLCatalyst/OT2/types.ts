export interface LabwareConfig {
  id: string;
  type: string;
  slot: string;
  customDefinition?: string;
}

export interface LiquidHandlingStep {
  sourceLabware: string;
  sourceWell: string;
  targetLabware: string;
  targetWell: string;
  volume: number;
  flowRate: number;
  mixingCycles?: number;
  blowout?: boolean;
}

export interface PositionOffset {
  x: number;
  y: number;
  z: number;
  speed: number;
}

export interface TipRack {
  type: string;
  slot: string;
}

export interface TipManagement {
  tipRacks: TipRack[];
  reuseStrategy: 'single-use' | 'multi-use';
}

export interface OT2Parameters {
  // Basic Configuration
  ipAddress: string;
  pipetteType: string;
  mountPosition: 'left' | 'right';
  
  // Labware Configuration
  labwareConfigs: LabwareConfig[];
  
  // Liquid Handling
  liquidHandlingSteps: LiquidHandlingStep[];
  
  // Position Offset
  positionOffset?: PositionOffset;
  
  // Tip Management
  tipManagement: TipManagement;
}

export interface TabComponentProps {
  parameters: any;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
} 
