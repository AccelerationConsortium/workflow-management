import { NodeProps } from 'reactflow';
import { OperationNode } from '../../../types/workflow';

// Base node type
export interface SDL2Node extends OperationNode {
  category: 'SDL2';
}

// Export configuration type
export interface UOExportConfig {
  uo_type: string;
  parameters: Record<string, any>;
}

// Parameter type definition
export interface ParameterDefinition {
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  description: string;
  required: boolean;
  unit?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  options?: string[];
}

// Base props for all SDL2 nodes
export interface SDL2NodeProps extends NodeProps {
  data: SDL2Node;
}

// CompoundPreparation types
export interface CompoundPreparationData extends SDL2Node {
  metal: string;
  metalVolume: number;
  metalConcentration: number;
  ligand: string;
  ligandVolume: number;
  ligandConcentration: number;
  bufferType: string;
  bufferVolume: number;
  mixingTime: number;
  outputDestination: string;
}

// ElectrochemicalMeasurement types
export interface ElectrochemicalMeasurementData extends SDL2Node {
  measurementType: string;
  startPotential: number;
  endPotential: number;
  scanRate: number;
  sampleInterval: number;
  duration: number;
  electrodeType: string;
  referenceElectrode: string;
  saveDataPath: string;
}

// Cleaning types
export interface CleaningData extends SDL2Node {
  cleaningAgent: string;
  cleaningVolume: number;
  cleaningCycles: number;
  flowRate: number;
  dryingTime?: number;
  cleaningTarget: string;
}

// DataAnalysis types
export interface DataAnalysisData extends SDL2Node {
  dataSource: string;
  analysisType: string;
  smoothingFactor?: number;
  baselineCorrectionMethod?: string;
  peakDetectionThreshold?: number;
  exportFormat: string;
  saveResultsPath: string;
  generatePlots: boolean;
}
