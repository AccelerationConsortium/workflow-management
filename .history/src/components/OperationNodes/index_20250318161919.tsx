import React from 'react';
import { BaseNode } from '../BaseNode';
import { FileNode } from './FileNode';
import { DataUploadNode } from './DataUploadNode';
import { OperationNode } from '../../types/workflow';

// 基础节点组件
export const createNodeComponent = (category: string) => ({ data, id }: { data: OperationNode; id: string }) => {
  console.log('Creating node component:', { category, data, id });
  
  // 保留原始数据，只添加必要的字段
  const nodeData = {
    ...data,
    id,
    category: category || data.category,
  };

  // 确保所有必要的属性都存在
  if (!nodeData.type || !nodeData.label) {
    console.warn('Missing required node data:', nodeData);
  }

  console.log('Final node data:', nodeData);
  return <BaseNode data={nodeData} />;
};

// 测试节点
export const PrepareElectrolyte = createNodeComponent('Test');
export const MixSolution = createNodeComponent('Test');
export const HeatTreatment = createNodeComponent('Test');
export const Characterization = createNodeComponent('Test');

// 样品处理类
export const PowderDispenser = createNodeComponent('Sample Processing');
export const LiquidHandler = createNodeComponent('Sample Processing');
export const Homogenizer = createNodeComponent('Sample Processing');
export const Balancer = createNodeComponent('Sample Processing');
export const SampleLibrary = createNodeComponent('Sample Processing');
export const SampleSplitter = createNodeComponent('Sample Processing');
export const AutoSampler = createNodeComponent('Sample Processing');

// 分析测量类
export const NMRNode = createNodeComponent('Analysis & Measurement');
export const MassSpectrometerNode = createNodeComponent('Analysis & Measurement');
export const FluorometerNode = createNodeComponent('Analysis & Measurement');
export const FTIRNode = createNodeComponent('Analysis & Measurement');
export const RamanNode = createNodeComponent('Analysis & Measurement');

// 反应控制类
export const ThermocyclerNode = createNodeComponent('Reaction Control');
export const BioreactorNode = createNodeComponent('Reaction Control');
export const FlowReactorNode = createNodeComponent('Reaction Control');
export const PhotoreactorNode = createNodeComponent('Reaction Control');

// 分离纯化类
export const CrystallizerNode = createNodeComponent('Separation & Purification');
export const FilterSystemNode = createNodeComponent('Separation & Purification');
export const GelElectrophoresisNode = createNodeComponent('Separation & Purification');
export const ColumnChromatographyNode = createNodeComponent('Separation & Purification');

// 数据采集类
export const DataLoggerNode = createNodeComponent('Data Acquisition');
export const MicroscopeNode = createNodeComponent('Data Acquisition');
export const MultiChannelAnalyzerNode = createNodeComponent('Data Acquisition');
export const ThermalImagerNode = createNodeComponent('Data Acquisition');

// 环境控制类
export const CO2IncubatorNode = createNodeComponent('Environment Control');
export const CleanBenchNode = createNodeComponent('Environment Control');
export const GloveboxNode = createNodeComponent('Environment Control');
export const TemperatureControllerNode = createNodeComponent('Environment Control');
export const UltraLowFreezerNode = createNodeComponent('Environment Control');

// Medusa 节点
export const PumpControl = createNodeComponent('Medusa');
export const ValveControl = createNodeComponent('Medusa');
export const HotplateControl = createNodeComponent('Medusa');
export const BalanceControl = createNodeComponent('Medusa');

// 导出所有节点组件
export const nodeComponents = {
  FileNode,
  DataUploadNode,
  PrepareElectrolyte,
  PumpControl,
  ValveControl,
  HotplateControl,
  BalanceControl,
};

export {
  FileNode,
  DataUploadNode,
}; 
