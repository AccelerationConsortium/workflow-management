import React, { memo } from 'react';
import { BaseNode } from '../BaseNode';
import { FileNode } from './FileNode';
import { DataUploadNode } from './DataUploadNode';
import { OperationNode } from '@/types/workflow';
import { SDLCatalystNodes } from './SDLCatalyst';
import { SDL2Nodes } from './SDL2';

// Create a map to store node components
const nodeComponentMap = new Map();

// Create the node component once and store it in the map
const getNodeComponent = (category: string) => {
  if (!nodeComponentMap.has(category)) {
    const NodeComponent = memo(({ data, id }: { data: OperationNode; id: string }) => {
      console.log('Creating node component:', { category, data, id });

      const nodeData = {
        ...data,
        id,
        category: category || data.category,
      };

      console.log('Final node data:', nodeData);
      return <BaseNode data={nodeData} />;
    });

    // Store the component
    nodeComponentMap.set(category, NodeComponent);
  }

  return nodeComponentMap.get(category);
};

// Export node components using the cached version
export const PowderDispenser = getNodeComponent('Sample Processing');
export const LiquidHandler = getNodeComponent('Sample Processing');
export const Homogenizer = getNodeComponent('Sample Processing');
export const Balancer = getNodeComponent('Sample Processing');
export const SampleLibrary = getNodeComponent('Sample Processing');
export const SampleSplitter = getNodeComponent('Sample Processing');
export const AutoSampler = getNodeComponent('Sample Processing');

export const NMRNode = getNodeComponent('Analysis & Measurement');
export const MassSpectrometerNode = getNodeComponent('Analysis & Measurement');
export const FluorometerNode = getNodeComponent('Analysis & Measurement');
export const FTIRNode = getNodeComponent('Analysis & Measurement');
export const RamanNode = getNodeComponent('Analysis & Measurement');

export const ThermocyclerNode = getNodeComponent('Reaction Control');
export const BioreactorNode = getNodeComponent('Reaction Control');
export const FlowReactorNode = getNodeComponent('Reaction Control');
export const PhotoreactorNode = getNodeComponent('Reaction Control');
export const CrystallizerNode = getNodeComponent('Reaction Control');

export const FilterSystemNode = getNodeComponent('Sample Processing');
export const GelElectrophoresisNode = getNodeComponent('Analysis & Measurement');
export const ColumnChromatographyNode = getNodeComponent('Sample Processing');
export const DataLoggerNode = getNodeComponent('Data Acquisition');
export const MicroscopeNode = getNodeComponent('Analysis & Measurement');
export const MultiChannelAnalyzerNode = getNodeComponent('Data Acquisition');
export const ThermalImagerNode = getNodeComponent('Analysis & Measurement');

export const CO2IncubatorNode = getNodeComponent('Environment Control');
export const CleanBenchNode = getNodeComponent('Environment Control');
export const GloveboxNode = getNodeComponent('Environment Control');
export const TemperatureControllerNode = getNodeComponent('Environment Control');
export const UltraLowFreezerNode = getNodeComponent('Environment Control');

// Data Input nodes
const FileNodeComponent = getNodeComponent('Data Input');
const DataUploadNodeComponent = getNodeComponent('Data Input');

export const PrepareElectrolyte = getNodeComponent('Sample Processing');
export const MixSolution = getNodeComponent('Sample Processing');
export const HeatTreatment = getNodeComponent('Sample Processing');
export const Characterization = getNodeComponent('Analysis & Measurement');

export const PumpControl = getNodeComponent('Device Control');
export const ValveControl = getNodeComponent('Device Control');
export const HotplateControl = getNodeComponent('Device Control');
export const BalanceControl = getNodeComponent('Device Control');
export const Activation = getNodeComponent('Catalyst Workflow');

// Export all node components
export const nodeComponents = {
  FileNode: FileNodeComponent,
  DataUploadNode: DataUploadNodeComponent,
  PrepareElectrolyte,
  PumpControl,
  ValveControl,
  HotplateControl,
  BalanceControl,
  Activation,
  ...SDLCatalystNodes,
  ...SDL2Nodes
};

export {
  FileNodeComponent as FileNode,
  DataUploadNodeComponent as DataUploadNode,
  SDLCatalystNodes,
  SDL2Nodes
};
