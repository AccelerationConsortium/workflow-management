export const DEFAULT_VALUES = {
  value: 0,
  unit: 'C',
  isRecording: false,
  isCalibrating: false,
  alarmEnabled: false
};

export const SENSOR_TYPES = {
  TEMPERATURE: 'temperature',
  PRESSURE: 'pressure',
  FLOW_RATE: 'flow_rate',
  PH: 'ph',
  CONDUCTIVITY: 'conductivity'
} as const;

export const UNITS = {
  [SENSOR_TYPES.TEMPERATURE]: ['C', 'F', 'K'],
  [SENSOR_TYPES.PRESSURE]: ['bar', 'psi', 'kPa', 'MPa'],
  [SENSOR_TYPES.FLOW_RATE]: ['mL/min', 'L/min', 'µL/min'],
  [SENSOR_TYPES.PH]: ['pH'],
  [SENSOR_TYPES.CONDUCTIVITY]: ['µS/cm', 'mS/cm']
} as const;

export const SENSOR_COMMANDS = {
  START_RECORDING: 'start_recording',
  STOP_RECORDING: 'stop_recording',
  START_CALIBRATION: 'start_calibration',
  STOP_CALIBRATION: 'stop_calibration',
  SET_ALARM_THRESHOLD: 'set_alarm_threshold',
  CLEAR_ALARM: 'clear_alarm',
  EXPORT_DATA: 'export_data',
  ZERO_CALIBRATION: 'zero_calibration',
  SPAN_CALIBRATION: 'span_calibration'
} as const;

export const SENSOR_STATUS = {
  NORMAL: 'normal',
  WARNING: 'warning',
  ALARM: 'alarm',
  ERROR: 'error',
  CALIBRATING: 'calibrating'
} as const;

export const CALIBRATION_POINTS = {
  [SENSOR_TYPES.TEMPERATURE]: [0, 100],  // 冰点和沸点
  [SENSOR_TYPES.PRESSURE]: [0, 1000],    // 零点和满量程
  [SENSOR_TYPES.FLOW_RATE]: [0, 10],     // 零流量和标准流量
  [SENSOR_TYPES.PH]: [4, 7, 10],         // 标准缓冲液
  [SENSOR_TYPES.CONDUCTIVITY]: [0, 1413]  // 零点和标准溶液
};

export const SENSOR_SPECS = {
  [SENSOR_TYPES.TEMPERATURE]: {
    range: [-50, 200],
    accuracy: '±0.1°C',
    resolution: '0.01°C',
    responseTime: '0.5s'
  },
  [SENSOR_TYPES.PRESSURE]: {
    range: [0, 1000],
    accuracy: '±0.1%',
    resolution: '0.01bar',
    responseTime: '0.1s'
  },
  [SENSOR_TYPES.FLOW_RATE]: {
    range: [0, 100],
    accuracy: '±1%',
    resolution: '0.1mL/min',
    responseTime: '0.1s'
  },
  [SENSOR_TYPES.PH]: {
    range: [0, 14],
    accuracy: '±0.01pH',
    resolution: '0.01pH',
    responseTime: '1s'
  },
  [SENSOR_TYPES.CONDUCTIVITY]: {
    range: [0, 2000],
    accuracy: '±1%',
    resolution: '1µS/cm',
    responseTime: '1s'
  }
} as const;

// 数据记录设置
export const RECORDING_SETTINGS = {
  maxPoints: 1000,           // 最大数据点数
  defaultInterval: 1000,     // 默认记录间隔(ms)
  exportFormats: ['csv', 'json'] as const
};

// 报警设置
export const ALARM_SETTINGS = {
  defaultDeadband: 1,        // 默认死区值
  defaultDelay: 1000,        // 默认报警延迟(ms)
  maxAlarmHistory: 100       // 最大报警历史记录数
}; 
