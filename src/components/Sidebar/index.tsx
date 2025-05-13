import React from 'react';
import './styles.css';

const operationGroups = {
  'Workflow Control': [
    // { type: 'conditional', label: '条件节点' } // 移除条件节点
  ],
  'Test': [
    { type: 'prepare_electrolyte', label: 'Prepare Electrolyte' },
    { type: 'mix_solution', label: 'Mix Solution' },
    { type: 'heat_treatment', label: 'Heat Treatment' },
    { type: 'characterization', label: 'Characterization' }
  ],
  'Sample Handling': [
    { type: 'powderDispenser', label: 'Powder Dispenser' },
    { type: 'liquidHandler', label: 'Liquid Handler' },
    { type: 'homogenizer', label: 'Homogenizer' },
    { type: 'balancer', label: 'Balancer' },
    { type: 'sampleLibrary', label: 'Sample Library' },
    { type: 'sampleSplitter', label: 'Sample Splitter' },
    { type: 'autoSampler', label: 'Auto Sampler' },
  ],
  'Analysis': [
    { type: 'nmr', label: 'NMR' },
    { type: 'massSpectrometer', label: 'Mass Spectrometer' },
    { type: 'fluorometer', label: 'Fluorometer' },
    { type: 'ftir', label: 'FTIR' },
    { type: 'raman', label: 'Raman' },
  ],
  'Reaction': [
    { type: 'thermocycler', label: 'Thermocycler' },
    { type: 'bioreactor', label: 'Bioreactor' },
    { type: 'flowReactor', label: 'Flow Reactor' },
    { type: 'photoreactor', label: 'Photoreactor' },
  ],
  'Separation': [
    { type: 'crystallizer', label: 'Crystallizer' },
    { type: 'filterSystem', label: 'Filter System' },
    { type: 'gelElectrophoresis', label: 'Gel Electrophoresis' },
    { type: 'columnChromatography', label: 'Column Chromatography' },
  ],
  'Data & Imaging': [
    { type: 'dataLogger', label: 'Data Logger' },
    { type: 'microscope', label: 'Microscope' },
    { type: 'multiChannelAnalyzer', label: 'Multi-Channel Analyzer' },
    { type: 'thermalImager', label: 'Thermal Imager' },
  ],
  'Environment': [
    { type: 'co2Incubator', label: 'CO2 Incubator' },
    { type: 'cleanBench', label: 'Clean Bench' },
    { type: 'glovebox', label: 'Glovebox' },
    { type: 'temperatureController', label: 'Temperature Controller' },
    { type: 'ultraLowFreezer', label: 'Ultra-Low Freezer' },
  ],
  'File Operations': [
    { type: 'fileInput', label: 'File Input' },
  ],
};

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Unit Operations</h3>
      </div>
      <div className="sidebar-content">
        {Object.entries(operationGroups).map(([groupName, operations]) => (
          <div key={groupName} className="operation-group">
            <h4>{groupName}</h4>
            <div className="operation-list">
              {operations.map((op) => (
                <div
                  key={op.type}
                  className="operation-item"
                  onDragStart={(event) => onDragStart(event, op.type)}
                  draggable
                >
                  {op.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
