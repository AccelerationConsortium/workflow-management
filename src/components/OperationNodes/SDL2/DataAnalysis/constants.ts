import { ParameterDefinition } from '../types';

export const ANALYSIS_TYPES = ['Peak Analysis', 'Kinetic Analysis', 'Impedance Analysis', 'Stability Analysis'];
export const BASELINE_CORRECTION_METHODS = ['Linear', 'Polynomial', 'Moving Average', 'None'];
export const EXPORT_FORMATS = ['CSV', 'JSON', 'Excel', 'PDF'];

export const DEFAULT_VALUES = {
  dataSource: '',
  analysisType: 'Peak Analysis',
  smoothingFactor: 0.2,
  baselineCorrectionMethod: 'Linear',
  peakDetectionThreshold: 0.1,
  exportFormat: 'CSV',
  saveResultsPath: './data/results/',
  generatePlots: true
};

export const PARAMETERS: Record<string, ParameterDefinition> = {
  dataSource: {
    type: 'string',
    label: 'Data Source',
    description: 'Path to data file for analysis',
    required: true,
    defaultValue: DEFAULT_VALUES.dataSource
  },
  analysisType: {
    type: 'select',
    label: 'Analysis Type',
    description: 'Type of analysis to perform',
    required: true,
    options: ANALYSIS_TYPES,
    defaultValue: DEFAULT_VALUES.analysisType
  },
  smoothingFactor: {
    type: 'number',
    label: 'Smoothing Factor',
    description: 'Intensity of data smoothing',
    min: 0,
    max: 1,
    defaultValue: DEFAULT_VALUES.smoothingFactor,
    required: false
  },
  baselineCorrectionMethod: {
    type: 'select',
    label: 'Baseline Correction Method',
    description: 'Method for baseline correction',
    required: false,
    options: BASELINE_CORRECTION_METHODS,
    defaultValue: DEFAULT_VALUES.baselineCorrectionMethod
  },
  peakDetectionThreshold: {
    type: 'number',
    label: 'Peak Detection Threshold',
    description: 'Sensitivity threshold for peak detection',
    min: 0.01,
    max: 1.0,
    defaultValue: DEFAULT_VALUES.peakDetectionThreshold,
    required: false
  },
  exportFormat: {
    type: 'select',
    label: 'Export Format',
    description: 'Format for exporting analysis results',
    required: true,
    options: EXPORT_FORMATS,
    defaultValue: DEFAULT_VALUES.exportFormat
  },
  saveResultsPath: {
    type: 'string',
    label: 'Results Save Path',
    description: 'Path to save analysis results',
    required: true,
    defaultValue: DEFAULT_VALUES.saveResultsPath
  },
  generatePlots: {
    type: 'boolean',
    label: 'Generate Plots',
    description: 'Whether to generate analysis plots',
    required: false,
    defaultValue: DEFAULT_VALUES.generatePlots
  }
};
