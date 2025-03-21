export const DEFAULT_VALUES = {
  position: 1,
  isMoving: false,
  mode: 'position' as const,
  flowPath: 'A->B' as const
};

export const VALVE_POSITIONS = {
  min: 1,
  max: 6
};

export const VALVE_COMMANDS = {
  SET_POSITION: 'set_position',
  SET_FLOW_PATH: 'set_flow_path',
  STOP_MOVEMENT: 'stop_movement',
  HOME: 'home_position',
  EMERGENCY_STOP: 'emergency_stop'
} as const;

export const VALVE_STATUS = {
  IDLE: 'idle',
  MOVING: 'moving',
  ERROR: 'error',
  HOMING: 'homing'
} as const;

export const VALVE_MODES = {
  POSITION: 'position',
  FLOW_PATH: 'flow_path'
} as const;

// 6位阀的流路定义
export const FLOW_PATHS = {
  'A->B': { from: 'A', to: 'B', position: 1 },
  'B->C': { from: 'B', to: 'C', position: 2 },
  'C->D': { from: 'C', to: 'D', position: 3 },
  'D->E': { from: 'D', to: 'E', position: 4 },
  'E->F': { from: 'E', to: 'F', position: 5 },
  'F->A': { from: 'F', to: 'A', position: 6 }
} as const;

export const VALVE_SPECS = {
  model: 'Medusa 6-Port Valve',
  manufacturer: 'Medusa Automation',
  positions: 6,
  switchTime: '0.5s',
  maxPressure: '1000 psi'
};

// 阀门端口标签
export const PORT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
