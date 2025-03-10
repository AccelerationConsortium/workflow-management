export interface ColorMixingStatus {
  currentPhase: 'idle' | 'running' | 'optimizing' | 'completed';
  currentBrightness: number;
  targetValue: number;
  sensorReading: number;
  optimizationStep: number;
  error?: string;
}

export interface OptimizationResult {
  optimalBrightness: number;
  convergenceSteps: number;
  finalError: number;
  history: Array<{
    step: number;
    brightness: number;
    reading: number;
    error: number;
  }>;
} 