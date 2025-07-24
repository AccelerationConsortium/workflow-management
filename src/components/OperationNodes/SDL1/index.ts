import './styles.css';

// Import components individually to avoid circular dependencies
import { ExperimentSetupNode, experimentSetupNodeConfig } from './UnitOperations/ExperimentSetup';
import { SolutionPreparationNode, solutionPreparationNodeConfig } from './UnitOperations/SolutionPreparation';
import { ElectrodeSetupNode, electrodeSetupNodeConfig } from './UnitOperations/ElectrodeSetup';
import { ElectrochemicalMeasurementNode, electrochemicalMeasurementNodeConfig } from './UnitOperations/ElectrochemicalMeasurement';
import { WashCleaningNode, washCleaningNodeConfig } from './UnitOperations/WashCleaning';
import { DataExportNode, dataExportNodeConfig } from './UnitOperations/DataExport';
import { SequenceControlNode, sequenceControlNodeConfig } from './UnitOperations/SequenceControl';
import { CycleCounterNode, cycleCounterNodeConfig } from './UnitOperations/CycleCounter';

// Re-export individual components
export { ExperimentSetupNode, experimentSetupNodeConfig };
export { SolutionPreparationNode, solutionPreparationNodeConfig };
export { ElectrodeSetupNode, electrodeSetupNodeConfig };
export { ElectrochemicalMeasurementNode, electrochemicalMeasurementNodeConfig };
export { WashCleaningNode, washCleaningNodeConfig };
export { DataExportNode, dataExportNodeConfig };
export { SequenceControlNode, sequenceControlNodeConfig };
export { CycleCounterNode, cycleCounterNodeConfig };

// Types
export * from './types';

// Export nodes for App.tsx integration - using imported components
export const SDL1Nodes = {
  sdl1ExperimentSetup: ExperimentSetupNode,
  sdl1SolutionPreparation: SolutionPreparationNode,
  sdl1ElectrodeSetup: ElectrodeSetupNode,
  sdl1ElectrochemicalMeasurement: ElectrochemicalMeasurementNode,
  sdl1WashCleaning: WashCleaningNode,
  sdl1DataExport: DataExportNode,
  sdl1SequenceControl: SequenceControlNode,
  sdl1CycleCounter: CycleCounterNode,
};

// Node configs for registration and initialization
export const SDL1NodeConfigs = [
  experimentSetupNodeConfig,
  solutionPreparationNodeConfig,
  electrodeSetupNodeConfig,
  electrochemicalMeasurementNodeConfig,
  washCleaningNodeConfig,
  dataExportNodeConfig,
  sequenceControlNodeConfig,
  cycleCounterNodeConfig,
];

// Node configs for lazy loading (optional - keeping for potential future use)
export const SDL1_NODE_CONFIGS = {
  sdl1ExperimentSetup: () => Promise.resolve(experimentSetupNodeConfig),
  sdl1SolutionPreparation: () => Promise.resolve(solutionPreparationNodeConfig),
  sdl1ElectrodeSetup: () => Promise.resolve(electrodeSetupNodeConfig),
  sdl1ElectrochemicalMeasurement: () => Promise.resolve(electrochemicalMeasurementNodeConfig),
  sdl1WashCleaning: () => Promise.resolve(washCleaningNodeConfig),
  sdl1DataExport: () => Promise.resolve(dataExportNodeConfig),
  sdl1SequenceControl: () => Promise.resolve(sequenceControlNodeConfig),
  sdl1CycleCounter: () => Promise.resolve(cycleCounterNodeConfig),
};