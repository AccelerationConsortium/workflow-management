import { SDL_CATALYST_NODE_TYPES } from '../components/OperationNodes/SDLCatalyst/types';

interface PrimitiveParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'int' | 'float' | 'list';
  default?: any;
  description?: string;
}

// Update primitive interface
interface Primitive {
  id: string;
  name: string;
  description: string;
  order?: number;
  pythonCode?: string;
  parameters?: PrimitiveParameter[];
}

export interface OperationNode {
  type: string;
  label: string;
  description: string;
  category: 'Sample Processing' | 'Analysis & Measurement' | 'Reaction Control' | 
             'Separation & Purification' | 'Data Acquisition' | 'Environment Control' | 
             'Test' | 'Medusa' | 'Catalyst Workflow' | 'SDL Catalyst';
  expanded?: boolean;
  icon?: string;
  parameters?: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'int' | 'float' | 'list';
    label: string;
    unit?: string;
    range?: [number, number];
    default?: any;
    required?: boolean;
    description?: string;
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
    range?: string;
    precision?: string;
    type?: string;
    ports?: string;
    switchingTime?: string;
  };
  primitives?: Primitive[];
  supportedDevices?: {
    manufacturer: string;
    model: string;
    constraints: {
      plateFormat?: string[];
      volumeRange?: [number, number];
      temperature?: [number, number];
    };
  }[];
}

export const operationNodes: OperationNode[] = [
  ...SDL_CATALYST_NODE_TYPES.map(nodeType => ({
    ...nodeType,
    expanded: false
  })),
  {
    type: 'PumpControl',
    label: 'Pump Control',
    description: 'Control liquid transfer through pump',
    category: 'Medusa',
    expanded: false,
    specs: {
      model: 'KEM Pump',
      manufacturer: 'KEM',
      range: '0.1-10 mL/min',
      precision: '±0.1 mL/min'
    },
    parameters: [
      {
        name: 'flowRate',
        label: 'Flow Rate',
        type: 'number',
        unit: 'mL/min',
        range: [0.1, 10],
        default: 1.0
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'number',
        unit: 'seconds',
        range: [1, 3600],
        default: 60
      },
      {
        name: 'direction',
        label: 'Direction',
        type: 'string',
        default: 'forward'
      }
    ],
    inputs: [
      {
        id: 'liquid-in',
        label: 'Liquid Input',
        type: 'liquid',
        required: true,
        description: 'Input liquid to be pumped'
      }
    ],
    outputs: [
      {
        id: 'liquid-out',
        label: 'Liquid Output',
        type: 'liquid',
        description: 'Pumped liquid output'
      }
    ],
    primitives: [
      {
        id: 'start-pump',
        name: 'Start Pump',
        description: 'Start the pump with specified flow rate',
        order: 1,
        pythonCode: `def start_pump(flow_rate: float = 1.0, direction: str = 'forward'):
    pump.set_direction(direction)
    pump.start(flow_rate)
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'number',
            default: 1.0,
            description: 'Flow rate in mL/min'
          },
          {
            name: 'direction',
            type: 'string',
            default: 'forward',
            description: 'Pump direction (forward/reverse)'
          }
        ]
      },
      {
        id: 'stop-pump',
        name: 'Stop Pump',
        description: 'Stop the pump',
        order: 2,
        pythonCode: `def stop_pump():
    pump.stop()
    return True`
      },
      {
        id: 'run-timed',
        name: 'Run for Duration',
        description: 'Run pump for specified duration',
        order: 3,
        pythonCode: `def run_timed(flow_rate: float = 1.0, duration: float = 60.0, direction: str = 'forward'):
    pump.set_direction(direction)
    pump.start(flow_rate)
    time.sleep(duration)
    pump.stop()
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'number',
            default: 1.0,
            description: 'Flow rate in mL/min'
          },
          {
            name: 'duration',
            type: 'number',
            default: 60,
            description: 'Duration in seconds'
          },
          {
            name: 'direction',
            type: 'string',
            default: 'forward',
            description: 'Pump direction (forward/reverse)'
          }
        ]
      }
    ]
  },
  {
    type: 'ValveControl',
    label: 'Valve Control',
    description: 'Control liquid flow path through valve',
    category: 'Medusa',
    expanded: false,
    specs: {
      model: 'Hamilton MVP',
      manufacturer: 'Hamilton',
      type: 'Multi-position valve',
      ports: '4-port',
      switchingTime: '100-5000ms'
    },
    parameters: [
      {
        name: 'position',
        label: 'Position',
        type: 'string',
        default: 'closed'
      },
      {
        name: 'selectedPort',
        label: 'Selected Port',
        type: 'string',
        default: '1'
      },
      {
        name: 'switchingTime',
        label: 'Switching Time',
        type: 'number',
        unit: 'ms',
        range: [100, 5000],
        default: 500
      },
      {
        name: 'isMultiPort',
        label: 'Multi-Port Mode',
        type: 'boolean',
        default: true
      }
    ],
    inputs: [
      {
        id: 'liquid-in',
        label: 'Liquid Input',
        type: 'liquid',
        required: true,
        description: 'Input liquid port'
      }
    ],
    outputs: [
      {
        id: 'liquid-out',
        label: 'Liquid Output',
        type: 'liquid',
        description: 'Output liquid port'
      }
    ],
    primitives: [
      {
        id: 'set-position',
        name: 'Set Position',
        description: 'Set valve position (open/closed)',
        order: 1,
        pythonCode: `def set_position(position: str = 'closed'):
    valve.set_position(position)
    return True`,
        parameters: [
          {
            name: 'position',
            type: 'string',
            default: 'closed',
            description: 'Valve position (open/closed)'
          }
        ]
      },
      {
        id: 'select-port',
        name: 'Select Port',
        description: 'Select valve port (for multi-port valves)',
        order: 2,
        pythonCode: `def select_port(port: str = '1'):
    valve.select_port(port)
    return True`,
        parameters: [
          {
            name: 'port',
            type: 'string',
            default: '1',
            description: 'Port number to select'
          }
        ]
      },
      {
        id: 'timed-switch',
        name: 'Timed Switch',
        description: 'Switch valve position with timing control',
        order: 3,
        pythonCode: `def timed_switch(position: str = 'closed', switching_time: float = 500):
    valve.set_position(position)
    time.sleep(switching_time / 1000)  # Convert ms to seconds
    return True`,
        parameters: [
          {
            name: 'position',
            type: 'string',
            default: 'closed',
            description: 'Target valve position'
          },
          {
            name: 'switching_time',
            type: 'number',
            default: 500,
            description: 'Time to wait after switching (ms)'
          }
        ]
      }
    ]
  },
  // Test Operations
  {
    type: 'PrepareElectrolyte',
    label: 'Prepare Electrolyte',
    description: 'Preparation of electrolyte mixtures',
    category: 'Test',
    specs: {
      model: 'Caframo Compact Mixer',
      manufacturer: 'Caframo',
      range: '100-1000 RPM',
      precision: '±1 RPM'
    },
    parameters: [
      {
        name: 'mixingSpeed',
        label: 'Mixing Speed',
        type: 'number',
        unit: 'RPM',
        range: [100, 1000],
        default: 500
      },
      {
        name: 'mixingTime',
        label: 'Mixing Time',
        type: 'number',
        unit: 'min',
        range: [1, 120],
        default: 30
      }
    ],
    inputs: [
      {
        id: 'solvent-in',
        label: 'Solvent Input',
        type: 'liquid',
        required: true,
        description: 'Main solvent for electrolyte'
      }
    ],
    outputs: [
      {
        id: 'electrolyte-out',
        label: 'Electrolyte Output',
        type: 'liquid',
        description: 'Mixed electrolyte solution'
      }
    ],
    primitives: [
      {
        id: 'start-pump',
        name: 'Start Pump',
        description: 'Start the pump for liquid transfer',
        order: 1,
        pythonCode: `def start_pump(flow_rate: float = 1.0):
    pump.start(flow_rate)
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'number',
            default: 1.0,
            description: 'Flow rate in mL/min'
          }
        ]
      },
      {
        id: 'open-valve',
        name: 'Open Valve',
        description: 'Open the valve for liquid flow',
        order: 2,
        pythonCode: `def open_valve(valve_id: str):
    valve.open(valve_id)
    return True`,
        parameters: [
          {
            name: 'valve_id',
            type: 'string',
            default: 'main',
            description: 'ID of the valve to open'
          }
        ]
      },
      {
        id: 'mix-electrolyte',
        name: 'Mix',
        description: 'Mix electrolyte components',
        order: 3,
        pythonCode: `def mix_electrolyte(speed: float = 500, duration: float = 300):
    mixer.set_speed(speed)
    mixer.start()
    time.sleep(duration)
    mixer.stop()
    return True`,
        parameters: [
          {
            name: 'speed',
            type: 'number',
            default: 500,
            description: 'Mixing speed in RPM'
          },
          {
            name: 'duration',
            type: 'number',
            default: 300,
            description: 'Mixing duration in seconds'
          }
        ]
      }
    ]
  },
  {
    type: 'MixSolution',
    label: 'Electrodeposition',
    description: 'Deposition of catalyst on electrode',
    category: 'Test',
    specs: {
      model: 'IKA RCT',
      manufacturer: 'IKA',
      range: '0-2000 RPM',
      precision: '±1 RPM'
    },
    parameters: [
      {
        name: 'stirringSpeed',
        label: 'Stirring Speed',
        type: 'number',
        unit: 'RPM',
        range: [60, 2000],
        default: 800
      },
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        unit: '°C',
        range: [20, 80],
        default: 25
      }
    ],
    inputs: [
      {
        id: 'solution-a',
        label: 'Solution A',
        type: 'liquid',
        required: true
      },
      {
        id: 'solution-b',
        label: 'Solution B',
        type: 'liquid',
        required: true
      }
    ],
    outputs: [
      {
        id: 'mixed-solution',
        label: 'Mixed Solution',
        type: 'liquid',
        description: 'Homogenized solution'
      }
    ],
    primitives: [
      {
        id: 'start-pump',
        name: 'Set Current Density',
        description: 'Set and control current density',
        order: 1,
        pythonCode: `def start_pump(flow_rate: float = 1.0):
    pump.start(flow_rate)
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'number',
            default: 1.0,
            description: 'Flow rate in mL/min'
          }
        ]
      },
      {
        id: 'open-valve',
        name: 'Control Voltage',
        description: 'Control and monitor voltage',
        order: 2,
        pythonCode: `def open_valve(valve_id: str):
    valve.open(valve_id)
    return True`,
        parameters: [
          {
            name: 'valve_id',
            type: 'string',
            default: 'main',
            description: 'ID of the valve to open'
          }
        ]
      },
      {
        id: 'mix-solution',
        name: 'Monitor Deposition Time',
        description: 'Monitor and control deposition time',
        order: 3,
        pythonCode: `def mix_solution(speed: int = 800, temp: float = 25.0, duration: int = 1800):
    mixer.set_temperature(temp)
    mixer.set_speed(speed)
    mixer.start()
    time.sleep(duration)
    mixer.stop()
    return True`,
        parameters: [
          {
            name: 'speed',
            type: 'int',
            default: 800,
            description: 'Stirring speed in RPM'
          },
          {
            name: 'temp',
            type: 'float',
            default: 25.0,
            description: 'Temperature in °C'
          },
          {
            name: 'duration',
            type: 'int',
            default: 1800,
            description: 'Mixing duration in seconds'
          }
        ]
      }
    ]
  },
  {
    type: 'HeatTreatment',
    label: 'Electroreduction Reaction',
    description: 'Performs a NO3- to NH3 reduction reaction',
    category: 'Test',
    specs: {
      model: 'Thermo Scientific Lindberg',
      manufacturer: 'Thermo Scientific',
      range: '50-1200°C',
      precision: '±1°C'
    },
    parameters: [
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        unit: '°C',
        range: [50, 1200],
        default: 600
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'number',
        unit: 'hours',
        range: [0.5, 72],
        default: 4
      },
      {
        name: 'rampRate',
        label: 'Ramp Rate',
        type: 'number',
        unit: '°C/min',
        range: [1, 20],
        default: 5
      }
    ],
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Input',
        type: 'solid',
        required: true,
        description: 'Sample for heat treatment'
      }
    ],
    outputs: [
      {
        id: 'sample-out',
        label: 'Processed Sample',
        type: 'solid',
        description: 'Heat treated sample'
      }
    ],
    primitives: [
      {
        id: 'start-pump',
        name: 'Set Current Density',
        description: 'Set and control reaction current density',
        order: 1,
        pythonCode: `def start_pump(flow_rate: float = 1.0):
    pump.start(flow_rate)
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'float',
            default: 1.0,
            description: 'Flow rate in mL/min'
          }
        ]
      },
      {
        id: 'open-valve',
        name: 'Start Reaction Timer',
        description: 'Start and monitor reaction time',
        order: 2,
        pythonCode: `def open_valve(valve_id: str):
    valve.open(valve_id)
    return True`,
        parameters: [
          {
            name: 'valve_id',
            type: 'string',
            default: 'main',
            description: 'ID of the valve to open'
          }
        ]
      },
      {
        id: 'heat-treatment',
        name: 'Monitor Ammonia Concentration',
        description: 'Monitor ammonia concentration during reaction',
        order: 3,
        pythonCode: `def heat_treatment(target_temp: float = 600.0, ramp_rate: float = 5.0, hold_time: int = 3600):
    furnace.set_ramp_rate(ramp_rate)
    furnace.set_temperature(target_temp)
    furnace.start()
    time.sleep(hold_time)
    furnace.stop()
    return True`,
        parameters: [
          {
            name: 'target_temp',
            type: 'float',
            default: 600.0,
            description: 'Target temperature in °C'
          },
          {
            name: 'ramp_rate',
            type: 'float',
            default: 5.0,
            description: 'Temperature ramp rate in °C/min'
          },
          {
            name: 'hold_time',
            type: 'int',
            default: 3600,
            description: 'Hold time at target temperature in seconds'
          }
        ]
      }
    ]
  },
  {
    type: 'Characterization',
    label: 'Analysis',
    description: 'Analyzes reaction products',
    category: 'Test',
    specs: {
      model: 'Bruker D8 Advance',
      manufacturer: 'Bruker',
      range: '2θ: 0-160°',
      precision: '±0.001°'
    },
    parameters: [
      {
        name: 'scanRange',
        label: 'Scan Range',
        type: 'number',
        unit: '°',
        range: [5, 120],
        default: 60
      },
      {
        name: 'scanRate',
        label: 'Scan Rate',
        type: 'number',
        unit: '°/min',
        range: [0.1, 10],
        default: 2
      },
      {
        name: 'stepSize',
        label: 'Step Size',
        type: 'number',
        unit: '°',
        range: [0.001, 0.1],
        default: 0.02
      }
    ],
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Input',
        type: 'solid',
        required: true,
        description: 'Sample for analysis'
      }
    ],
    outputs: [
      {
        id: 'data-out',
        label: 'Analysis Data',
        type: 'dataset',
        description: 'Characterization results'
      },
      {
        id: 'sample-out',
        label: 'Sample Return',
        type: 'solid',
        description: 'Analyzed sample'
      }
    ],
    primitives: [
      {
        id: 'start-pump',
        name: 'Take Sample',
        description: 'Collect sample for analysis',
        order: 1,
        pythonCode: `def start_pump(flow_rate: float = 1.0):
    pump.start(flow_rate)
    return True`,
        parameters: [
          {
            name: 'flow_rate',
            type: 'float',
            default: 1.0,
            description: 'Flow rate in mL/min'
          }
        ]
      },
      {
        id: 'open-valve',
        name: 'UV-VIS Spectroscopy',
        description: 'Perform UV-VIS spectroscopy for ammonia detection',
        order: 2,
        pythonCode: `def open_valve(valve_id: str):
    valve.open(valve_id)
    return True`,
        parameters: [
          {
            name: 'valve_id',
            type: 'string',
            default: 'main',
            description: 'ID of the valve to open'
          }
        ]
      },
      {
        id: 'mix-electrolyte',
        name: 'Mix',
        description: 'Mix electrolyte components',
        order: 3,
        pythonCode: `def mix_electrolyte(speed: int = 500, duration: int = 300):
    mixer.set_speed(speed)
    mixer.start()
    time.sleep(duration)
    mixer.stop()
    return True`,
        parameters: [
          {
            name: 'speed',
            type: 'int',
            default: 500,
            description: 'Mixing speed in RPM'
          },
          {
            name: 'duration',
            type: 'int',
            default: 300,
            description: 'Mixing duration in seconds'
          }
        ]
      },
      {
        id: 'characterize',
        name: 'Analyze Sample',
        description: 'Perform sample characterization',
        order: 3,
        pythonCode: `def characterize(scan_range: list = [5, 120], scan_rate: float = 2.0, step_size: float = 0.02):
    instrument.set_scan_range(scan_range[0], scan_range[1])
    instrument.set_scan_rate(scan_rate)
    instrument.set_step_size(step_size)
    instrument.start()
    data = instrument.collect_data()
    instrument.stop()
    return data`,
        parameters: [
          {
            name: 'scan_range',
            type: 'list',
            default: [5, 120],
            description: 'Scan range in degrees [start, end]'
          },
          {
            name: 'scan_rate',
            type: 'float',
            default: 2.0,
            description: 'Scan rate in degrees/min'
          },
          {
            name: 'step_size',
            type: 'float',
            default: 0.02,
            description: 'Step size in degrees'
          }
        ]
      }
    ]
  },

  // Existing nodes
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
  },

  // Medusa Operations
  {
    type: 'HotplateControl',
    label: 'Hotplate Control',
    description: 'Control temperature and stirring of a magnetic hotplate',
    category: 'Medusa',
    expanded: false,
    specs: {
      model: 'IKA RET',
      manufacturer: 'IKA',
      range: '20-300°C, 0-1500 rpm',
      precision: '±0.1°C, ±1 rpm'
    },
    parameters: [
      {
        name: 'temperature',
        label: 'Temperature',
        type: 'number',
        unit: '°C',
        range: [20, 300],
        default: 25
      },
      {
        name: 'stirringSpeed',
        label: 'Stirring Speed',
        type: 'number',
        unit: 'rpm',
        range: [0, 1500],
        default: 0
      },
      {
        name: 'rampRate',
        label: 'Temperature Ramp Rate',
        type: 'number',
        unit: '°C/min',
        range: [1, 20],
        default: 5
      }
    ],
    inputs: [
      {
        id: 'vessel',
        label: 'Vessel',
        type: 'container',
        required: true,
        description: 'Container to be heated/stirred'
      }
    ],
    outputs: [
      {
        id: 'heated-vessel',
        label: 'Heated Vessel',
        type: 'container',
        description: 'Heated/stirred container'
      }
    ]
  },
  {
    type: 'BalanceControl',
    label: 'Balance Control',
    description: 'High-precision weight measurement and control',
    category: 'Medusa',
    expanded: false,
    specs: {
      model: 'Mettler Toledo XPE205',
      manufacturer: 'Mettler Toledo',
      range: '0-220g',
      precision: '0.01mg'
    },
    parameters: [
      {
        name: 'targetWeight',
        label: 'Target Weight',
        type: 'number',
        unit: 'g',
        range: [0, 220],
        default: 0,
        description: 'Target weight to measure'
      },
      {
        name: 'tolerance',
        label: 'Tolerance',
        type: 'number',
        unit: 'g',
        range: [0.0001, 1],
        default: 0.001,
        description: 'Acceptable deviation from target weight'
      },
      {
        name: 'isStable',
        label: 'Stability',
        type: 'boolean',
        default: false,
        description: 'Indicates if the reading is stable'
      },
      {
        name: 'tare',
        label: 'Tare',
        type: 'boolean',
        default: false,
        description: 'Tare the balance'
      }
    ],
    inputs: [
      {
        id: 'sample-in',
        label: 'Sample Input',
        type: 'solid',
        required: true,
        description: 'Sample to be weighed'
      }
    ],
    outputs: [
      {
        id: 'weight-data',
        label: 'Weight Data',
        type: 'number',
        description: 'Measured weight value'
      },
      {
        id: 'sample-out',
        label: 'Sample Output',
        type: 'solid',
        description: 'Weighed sample'
      }
    ],
    primitives: [
      {
        id: 'tare-balance',
        name: 'Tare Balance',
        description: 'Set the current weight to zero',
        order: 1,
        pythonCode: `def tare_balance():
    balance.tare()
    return True`
      },
      {
        id: 'measure-weight',
        name: 'Measure Weight',
        description: 'Get a stable weight reading',
        order: 2,
        pythonCode: `def measure_weight(min_weight: float = 0, max_weight: float = 220):
    weight = balance.get_stable_weight()
    if min_weight <= weight <= max_weight:
        return weight
    return None`,
        parameters: [
          {
            name: 'min_weight',
            type: 'float',
            default: 0,
            description: 'Minimum acceptable weight'
          },
          {
            name: 'max_weight',
            type: 'float',
            default: 220,
            description: 'Maximum acceptable weight'
          }
        ]
      },
      {
        id: 'wait-stability',
        name: 'Wait for Stability',
        description: 'Wait until the weight reading is stable',
        order: 3,
        pythonCode: `def wait_stability(timeout: float = 30):
    return balance.wait_for_stability(timeout)`,
        parameters: [
          {
            name: 'timeout',
            type: 'float',
            default: 30,
            description: 'Maximum time to wait for stability (seconds)'
          }
        ]
      }
    ]
  },
  {
    type: 'Activation',
    label: 'Activation',
    description: 'Control activation and deactivation of catalyst',
    category: 'Catalyst Workflow' as const,
    expanded: false,
    specs: {
      model: 'Generic Catalyst Activator',
      manufacturer: 'Lab Equipment',
      range: '0-3600 seconds',
      precision: '1 second'
    },
    parameters: [
      {
        name: 'mode',
        label: 'Mode',
        type: 'string',
        default: 'manual',
        description: 'Activation mode (manual/automatic)'
      },
      {
        name: 'activationTime',
        label: 'Activation Time',
        type: 'number',
        unit: 'seconds',
        range: [0, 3600],
        default: 300,
        description: 'Time for activation process'
      },
      {
        name: 'deactivationTime',
        label: 'Deactivation Time',
        type: 'number',
        unit: 'seconds',
        range: [0, 3600],
        default: 300,
        description: 'Time for deactivation process'
      }
    ],
    inputs: [],
    outputs: [],
    primitives: [
      {
        id: 'activate',
        name: 'Activate',
        description: 'Start catalyst activation process',
        order: 1,
        pythonCode: `def activate(delay: float = 0.0):
    if delay > 0:
        time.sleep(delay)
    device.activate()
    return True`,
        parameters: [
          {
            name: 'delay',
            type: 'number',
            default: 0,
            description: 'Delay before activation (seconds)'
          }
        ]
      },
      {
        id: 'deactivate',
        name: 'Deactivate',
        description: 'Start catalyst deactivation process',
        order: 2,
        pythonCode: `def deactivate(delay: float = 0.0):
    if delay > 0:
        time.sleep(delay)
    device.deactivate()
    return True`,
        parameters: [
          {
            name: 'delay',
            type: 'number',
            default: 0,
            description: 'Delay before deactivation (seconds)'
          }
        ]
      },
      {
        id: 'setMode',
        name: 'Set Mode',
        description: 'Set activation mode',
        order: 3,
        pythonCode: `def set_mode(mode: str = 'manual'):
    device.set_mode(mode)
    return True`,
        parameters: [
          {
            name: 'mode',
            type: 'string',
            default: 'manual',
            description: 'Activation mode (manual/automatic)'
          }
        ]
      }
    ]
  },
]; 
