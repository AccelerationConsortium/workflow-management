export interface OperationNode {
  type: string;
  label: string;
  description: string;
  category: 'Sample Processing' | 'Analysis & Measurement' | 'Reaction Control' | 
             'Separation & Purification' | 'Data Acquisition' | 'Environment Control';
  parameters?: {
    name: string;
    type: 'number' | 'string' | 'boolean';
    label: string;
    unit?: string;
    range?: [number, number];
  }[];
  inputs?: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    description?: string;
  }[];
  outputs?: {
    id: string;
    label: string;
    type: string;
    description?: string;
  }[];
  specs?: {
    model: string;
    manufacturer: string;
    range: string;
    precision: string;
  };
}

export const operationNodes: OperationNode[] = [
  {
    type: 'dataUpload',
    label: 'Data Upload',
    description: 'Upload and parse data files',
    category: 'Data Acquisition',
    parameters: [
      {
        name: 'fileType',
        type: 'select',
        label: 'File Type',
        options: ['CSV', 'Excel'],
        required: true,
        description: 'Select the format of the uploaded file'
      },
      {
        name: 'file',
        type: 'file',
        label: 'Data File',
        fileTypes: ['.csv', '.xlsx', '.xls'],
        required: true,
        description: 'Select the data file to upload'
      },
      {
        name: 'headerRow',
        type: 'number',
        label: 'Header Row Number',
        range: [1, 10],
        default: 1,
        description: 'Specify the row number of the header'
      }
    ],
    outputs: [
      {
        id: 'data',
        label: 'Data Output',
        type: 'dataset'
      }
    ]
  },
  // 修改现有组件，添加更多参数
  {
    type: 'powderDispenser',
    label: 'Powder Dispenser',
    description: 'Precise powder sample dispensing',
    category: 'Sample Processing',
    specs: {
      model: 'Mettler Toledo QS64',
      manufacturer: 'Mettler Toledo',
      range: '0.1mg - 100mg',
      precision: '±0.1mg'
    },
    inputs: [
      {
        id: 'powder-in',
        label: 'Powder Input',
        type: 'powder',
        required: true,
        description: 'Bulk powder source'
      }
    ],
    outputs: [
      {
        id: 'powder-out',
        label: 'Powder Output',
        type: 'powder',
        description: 'Dispensed powder sample'
      }
    ],
    parameters: [
      {
        name: 'weight',
        type: 'number',
        label: 'Target Weight',
        unit: 'mg',
        range: [0.1, 100],
        required: true
      },
      {
        name: 'speed',
        type: 'number',
        label: 'Dispensing Speed',
        unit: 'mg/s',
        range: [0.1, 10],
        default: 1
      }
    ]
  },
  // 样品处理类
  {
    type: 'sampleSplitter',
    label: 'Sample Splitter',
    description: 'Automatically split samples into multiple containers',
    category: 'Sample Processing',
    parameters: [
      { name: 'volume', type: 'number', label: 'Split Volume', unit: 'μL', range: [10, 1000] }
    ]
  },
  {
    type: 'autoSampler',
    label: 'Auto Sampler',
    description: 'Automated sample handling system',
    category: 'Sample Processing',
    specs: {
      model: 'Agilent G7129A',
      manufacturer: 'Agilent',
      range: '1-100 samples',
      precision: '±0.1% RSD'
    },
    inputs: [
      {
        id: 'sample-tray',
        label: 'Sample Tray',
        type: 'tray',
        required: true,
        description: 'Sample source tray'
      }
    ],
    outputs: [
      {
        id: 'sample-out',
        label: 'Sample Output',
        type: 'liquid',
        description: 'Processed sample'
      },
      {
        id: 'data-out',
        label: 'Sample Data',
        type: 'dataset',
        description: 'Sample metadata'
      }
    ],
    parameters: [
      {
        name: 'sampleVolume',
        type: 'number',
        label: 'Sample Volume',
        unit: 'μL',
        range: [1, 100],
        required: true
      },
      {
        name: 'injectionSpeed',
        type: 'number',
        label: 'Injection Speed',
        unit: 'μL/s',
        range: [0.1, 10],
        default: 1
      }
    ]
  },

  // 分析测量类
  {
    type: 'ftir',
    label: 'FTIR',
    description: 'Molecular structure analysis',
    category: 'Analysis & Measurement',
    parameters: [
      { name: 'resolution', type: 'number', label: 'Resolution', unit: 'cm⁻¹', range: [0.5, 16] }
    ]
  },
  {
    type: 'raman',
    label: 'Raman Spectrometer',
    description: 'Molecular vibration analysis',
    category: 'Analysis & Measurement',
    parameters: [
      { name: 'laserPower', type: 'number', label: 'Laser Power', unit: 'mW', range: [1, 500] }
    ]
  },
  {
    type: 'nmr',
    label: 'NMR Spectrometer',
    description: 'Nuclear Magnetic Resonance analysis',
    category: 'Analysis & Measurement',
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Input',
        type: 'liquid',
        required: true,
        description: 'Liquid sample for NMR analysis'
      }
    ],
    outputs: [
      {
        id: 'spectrum-out',
        label: 'NMR Spectrum',
        type: 'dataset',
        description: '1D/2D NMR spectral data'
      },
      {
        id: 'sample-return',
        label: 'Sample Return',
        type: 'liquid',
        description: 'Recovered sample after analysis'
      }
    ],
    specs: {
      model: 'Bruker AVANCE NEO 600',
      manufacturer: 'Bruker BioSpin',
      range: '600 MHz',
      precision: '0.1 Hz'
    },
    parameters: [
      {
        name: 'frequency',
        type: 'number',
        label: 'Frequency',
        unit: 'MHz',
        range: [300, 900],
        required: true,
        description: 'Operating frequency of the spectrometer'
      },
      {
        name: 'scanNumber',
        type: 'number',
        label: 'Number of Scans',
        range: [1, 1024],
        default: 16,
        description: 'Number of scans to accumulate'
      },
      {
        name: 'pulseWidth',
        type: 'number',
        label: 'Pulse Width',
        unit: 'μs',
        range: [1, 100],
        default: 10,
        description: 'Width of the RF pulse'
      },
      {
        name: 'relaxationDelay',
        type: 'number',
        label: 'Relaxation Delay',
        unit: 's',
        range: [0.1, 60],
        default: 1,
        description: 'Delay between scans'
      },
      {
        name: 'temperature',
        type: 'number',
        label: 'Temperature',
        unit: 'K',
        range: [273, 373],
        default: 298,
        description: 'Sample temperature during measurement'
      }
    ]
  },

  // 分离纯化类
  {
    type: 'columnChromatography',
    label: 'Column Chromatography',
    description: 'Automated column chromatography system',
    category: 'Separation & Purification',
    parameters: [
      {
        name: 'flowRate',
        type: 'number',
        label: 'Flow Rate',
        unit: 'mL/min',
        range: [0.1, 100],
        required: true,
        description: 'Mobile phase flow rate'
      },
      {
        name: 'pressure',
        type: 'number',
        label: 'System Pressure',
        unit: 'bar',
        range: [0, 400],
        required: true,
        description: 'Maximum system pressure'
      },
      {
        name: 'gradientProfile',
        type: 'string',
        label: 'Gradient Profile',
        description: 'Solvent gradient program'
      },
      {
        name: 'columnTemp',
        type: 'number',
        label: 'Column Temperature',
        unit: '°C',
        range: [4, 80],
        default: 25,
        description: 'Column compartment temperature'
      },
      {
        name: 'injectionVolume',
        type: 'number',
        label: 'Injection Volume',
        unit: 'μL',
        range: [1, 2000],
        required: true,
        description: 'Sample injection volume'
      },
      {
        name: 'runTime',
        type: 'number',
        label: 'Run Time',
        unit: 'min',
        range: [1, 999],
        required: true,
        description: 'Total analysis time'
      }
    ],
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Input',
        type: 'liquid',
        required: true
      },
      {
        id: 'solvent-a',
        label: 'Solvent A',
        type: 'liquid',
        required: true
      },
      {
        id: 'solvent-b',
        label: 'Solvent B',
        type: 'liquid',
        required: true
      }
    ],
    outputs: [
      {
        id: 'fraction-out',
        label: 'Fraction Collector',
        type: 'liquid'
      },
      {
        id: 'waste-out',
        label: 'Waste',
        type: 'liquid'
      },
      {
        id: 'data-out',
        label: 'Detector Data',
        type: 'dataset'
      }
    ]
  },
  {
    type: 'crystallizer',
    label: 'Crystallizer',
    description: 'Compound crystallization and purification',
    category: 'Separation & Purification',
    parameters: [
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [-20, 100] }
    ]
  },

  // 反应控制类
  {
    type: 'flowReactor',
    label: 'Flow Reactor',
    description: 'Continuous flow reaction control',
    category: 'Reaction Control',
    parameters: [
      { name: 'flowRate', type: 'number', label: 'Flow Rate', unit: 'mL/min', range: [0.01, 10] },
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [0, 200] }
    ]
  },
  {
    type: 'photoreactor',
    label: 'Photoreactor',
    description: 'Photochemical reaction control',
    category: 'Reaction Control',
    parameters: [
      { name: 'wavelength', type: 'number', label: 'Wavelength', unit: 'nm', range: [200, 800] },
      { name: 'intensity', type: 'number', label: 'Intensity', unit: 'mW/cm²', range: [1, 1000] }
    ]
  },

  // 环境控制类
  {
    type: 'glovebox',
    label: 'Glovebox',
    description: 'Inert atmosphere operation environment',
    category: 'Environment Control',
    parameters: [
      { name: 'oxygen', type: 'number', label: 'Oxygen Content', unit: 'ppm', range: [0, 100] },
      { name: 'humidity', type: 'number', label: 'Humidity', unit: 'ppm', range: [0, 100] }
    ]
  },
  {
    type: 'temperatureController',
    label: 'Temperature Controller',
    description: 'Precise temperature control',
    category: 'Environment Control',
    parameters: [
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [-80, 200] },
      { name: 'rampRate', type: 'number', label: 'Ramp Rate', unit: '°C/min', range: [0.1, 20] }
    ]
  },

  // 数据采集类
  {
    type: 'multiChannelAnalyzer',
    label: 'Multi-Channel Analyzer',
    description: 'Multi-parameter synchronous acquisition',
    category: 'Data Acquisition',
    parameters: [
      { name: 'channels', type: 'number', label: 'Channel Number', range: [1, 32] },
      { name: 'sampleRate', type: 'number', label: 'Sampling Rate', unit: 'Hz', range: [1, 10000] }
    ]
  },
  {
    type: 'thermalImager',
    label: 'Thermal Imager',
    description: 'Temperature distribution imaging',
    category: 'Data Acquisition',
    parameters: [
      { name: 'resolution', type: 'number', label: 'Resolution', unit: 'px', range: [160, 1024] },
      { name: 'frameRate', type: 'number', label: 'Frame Rate', unit: 'fps', range: [9, 60] }
    ]
  },

  // 样品制备类
  {
    type: 'balancer',
    label: 'Electronic Balance',
    description: 'High-precision sample weighing',
    category: 'Sample Processing',
    parameters: [
      { name: 'maxWeight', type: 'number', label: 'Maximum Weight', unit: 'g', range: [0, 1000] },
      { name: 'precision', type: 'number', label: 'Precision', unit: 'mg', range: [0.01, 1] },
      { name: 'stabilityTime', type: 'number', label: 'Stability Time', unit: 's', range: [1, 10] }
    ]
  },
  {
    type: 'homogenizer',
    label: 'Homogenizer',
    description: 'Sample homogenization processing',
    category: 'Sample Processing',
    parameters: [
      { name: 'speed', type: 'number', label: 'Speed', unit: 'rpm', range: [1000, 30000] },
      { name: 'time', type: 'number', label: 'Processing Time', unit: 'min', range: [1, 30] },
      { name: 'temperature', type: 'number', label: 'Temperature Control', unit: '°C', range: [0, 40] }
    ]
  },

  // 分离纯化类
  {
    type: 'filterSystem',
    label: 'Filter System',
    description: 'Sample filtration and purification',
    category: 'Separation & Purification',
    parameters: [
      { name: 'poreSize', type: 'number', label: 'Pore Size', unit: 'μm', range: [0.22, 100] },
      { name: 'pressure', type: 'number', label: 'Pressure', unit: 'bar', range: [0, 6] },
      { name: 'flowRate', type: 'number', label: 'Flow Rate', unit: 'mL/min', range: [0.1, 100] }
    ]
  },
  {
    type: 'gelElectrophoresis',
    label: 'Gel Electrophoresis',
    description: 'Biomolecular separation',
    category: 'Separation & Purification',
    parameters: [
      { name: 'voltage', type: 'number', label: 'Voltage', unit: 'V', range: [50, 300] },
      { name: 'time', type: 'number', label: 'Electrophoresis Time', unit: 'min', range: [30, 180] },
      { name: 'gelConcentration', type: 'number', label: 'Gel Concentration', unit: '%', range: [0.8, 2] }
    ]
  },

  // 分析测量类
  {
    type: 'massSpectrometer',
    label: 'Mass Spectrometer',
    description: 'Molecular mass analysis',
    category: 'Analysis & Measurement',
    parameters: [
      { name: 'massRange', type: 'number', label: 'Mass Range', unit: 'm/z', range: [50, 2000] },
      { name: 'resolution', type: 'number', label: 'Resolution', unit: 'FWHM', range: [1000, 100000] },
      { name: 'ionizationMode', type: 'string', label: 'Ionization Mode' }
    ]
  },
  {
    type: 'fluorometer',
    label: 'Fluorometer',
    description: 'Fluorescence intensity measurement',
    category: 'Analysis & Measurement',
    parameters: [
      { name: 'excitationWavelength', type: 'number', label: 'Excitation Wavelength', unit: 'nm', range: [200, 1000] },
      { name: 'emissionWavelength', type: 'number', label: 'Emission Wavelength', unit: 'nm', range: [200, 1000] },
      { name: 'sensitivity', type: 'number', label: 'Sensitivity', range: [1, 5] }
    ]
  },

  // 反应控制类
  {
    type: 'thermocycler',
    label: 'Thermocycler',
    description: 'PCR amplification reaction',
    category: 'Reaction Control',
    parameters: [
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [4, 100] },
      { name: 'rampRate', type: 'number', label: 'Ramp Rate', unit: '°C/s', range: [0.1, 5] },
      { name: 'cycleCount', type: 'number', label: 'Cycle Count', range: [1, 99] }
    ]
  },
  {
    type: 'bioreactor',
    label: 'Bioreactor',
    description: 'Cell culture process control',
    category: 'Reaction Control',
    parameters: [
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [4, 60] },
      { name: 'pH', type: 'number', label: 'pH Value', range: [2, 12] },
      { name: 'stirringSpeed', type: 'number', label: 'Stirring Speed', unit: 'rpm', range: [50, 1200] },
      { name: 'dissolvedOxygen', type: 'number', label: 'Dissolved Oxygen', unit: '%', range: [0, 100] }
    ]
  },

  // 环境控制类
  {
    type: 'co2Incubator',
    label: 'CO2 Incubator',
    description: 'Cell culture environment control',
    category: 'Environment Control',
    parameters: [
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [20, 50] },
      { name: 'co2Level', type: 'number', label: 'CO2 Level', unit: '%', range: [0, 20] },
      { name: 'humidity', type: 'number', label: 'Humidity', unit: '%', range: [60, 95] }
    ]
  },
  {
    type: 'cleanBench',
    label: 'Clean Bench',
    description: 'Sterile operation environment',
    category: 'Environment Control',
    parameters: [
      { name: 'flowRate', type: 'number', label: 'Flow Rate', unit: 'm/s', range: [0.3, 0.5] },
      { name: 'uvSterilization', type: 'boolean', label: 'UV Sterilization' },
      { name: 'filterEfficiency', type: 'number', label: 'Filter Efficiency', unit: '%', range: [99, 99.999] }
    ]
  },

  // 数据采集类
  {
    type: 'dataLogger',
    label: 'Data Logger',
    description: 'Multi-parameter real-time monitoring',
    category: 'Data Acquisition',
    parameters: [
      { name: 'samplingRate', type: 'number', label: 'Sampling Rate', unit: 'Hz', range: [0.1, 1000] },
      { name: 'channelCount', type: 'number', label: 'Channel Number', range: [1, 32] },
      { name: 'storageCapacity', type: 'number', label: 'Storage Capacity', unit: 'GB', range: [1, 128] }
    ]
  },
  {
    type: 'microscope',
    label: 'Microscope',
    description: 'Sample microscopic observation',
    category: 'Data Acquisition',
    parameters: [
      { name: 'magnification', type: 'number', label: 'Magnification', range: [40, 1000] },
      { name: 'resolution', type: 'number', label: 'Resolution', unit: 'MP', range: [1, 20] },
      { name: 'exposureTime', type: 'number', label: 'Exposure Time', unit: 'ms', range: [1, 1000] }
    ]
  },

  // 样品储存类
  {
    type: 'ultraLowFreezer',
    label: 'Ultra-Low Freezer',
    description: 'Sample low-temperature storage',
    category: 'Environment Control',
    parameters: [
      { name: 'temperature', type: 'number', label: 'Temperature', unit: '°C', range: [-150, -20] },
      { name: 'alarmThreshold', type: 'number', label: 'Alarm Threshold', unit: '°C', range: [-140, -30] },
      { name: 'backupSystem', type: 'boolean', label: 'Backup System' }
    ]
  },
  {
    type: 'sampleLibrary',
    label: 'Sample Library',
    description: 'Sample classification storage',
    category: 'Sample Processing',
    parameters: [
      { name: 'capacity', type: 'number', label: 'Storage Capacity', unit: '位', range: [100, 10000] },
      { name: 'temperature', type: 'number', label: 'Storage Temperature', unit: '°C', range: [-80, 25] },
      { name: 'humidity', type: 'number', label: 'Humidity Control', unit: '%', range: [10, 60] }
    ]
  },

  {
    type: 'hplc',
    label: 'HPLC System',
    description: 'High Performance Liquid Chromatography',
    category: 'Separation & Purification',
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Input',
        type: 'liquid',
        required: true,
        description: 'Sample for separation'
      },
      {
        id: 'mobile-phase-a',
        label: 'Mobile Phase A',
        type: 'liquid',
        required: true,
        description: 'Primary mobile phase'
      },
      {
        id: 'mobile-phase-b',
        label: 'Mobile Phase B',
        type: 'liquid',
        required: true,
        description: 'Secondary mobile phase'
      }
    ],
    outputs: [
      {
        id: 'fraction-out',
        label: 'Fractions',
        type: 'liquid-array',
        description: 'Separated fractions'
      },
      {
        id: 'chromatogram',
        label: 'Chromatogram',
        type: 'dataset',
        description: 'Detection signal data'
      },
      {
        id: 'waste',
        label: 'Waste',
        type: 'liquid',
        description: 'Waste mobile phase'
      }
    ],
    specs: {
      model: 'Agilent 1260 Infinity II',
      manufacturer: 'Agilent',
      range: '0.001-10 mL/min',
      precision: '±0.07% RSD'
    }
  },

  {
    type: 'massSpectrometer',
    label: 'Mass Spectrometer',
    description: 'High Resolution Mass Analysis',
    category: 'Analysis & Measurement',
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Inlet',
        type: 'gas/liquid',
        required: true,
        description: 'Sample for mass analysis'
      },
      {
        id: 'carrier-gas',
        label: 'Carrier Gas',
        type: 'gas',
        required: true,
        description: 'Nitrogen or Helium gas'
      }
    ],
    outputs: [
      {
        id: 'mass-spectrum',
        label: 'Mass Spectrum',
        type: 'dataset',
        description: 'Mass spectral data'
      },
      {
        id: 'vacuum-waste',
        label: 'Vacuum Waste',
        type: 'gas',
        description: 'Exhaust from vacuum system'
      }
    ],
    specs: {
      model: 'Thermo Q Exactive HF-X',
      manufacturer: 'Thermo Fisher',
      range: '50-6000 m/z',
      precision: '<1 ppm mass accuracy'
    }
  }
]; 