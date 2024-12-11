import React from 'react';
import { BaseNode } from '../BaseNode';
import { FileNode } from './FileNode';
import { DataUploadNode } from './DataUploadNode';
import { OperationNode } from '../../types/workflow';

// 基础节点组件
const createNodeComponent = (category: string) => ({ data, id }: { data: OperationNode; id: string }) => {
  // 合并默认数据和传入的数据
  const nodeData = {
    ...data,
    id,  // 确保 ID 被传递
    category,
    // 确保基本属性存在
    description: data.description || '',
    parameters: data.parameters || [],
    constraints: data.constraints || [],
    hardware: data.hardware || {},
    status: data.status || 'idle'
  };

  return <BaseNode data={nodeData} />;
};

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

export {
  FileNode,
  DataUploadNode,
}; 