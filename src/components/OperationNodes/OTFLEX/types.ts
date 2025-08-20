// OTFLEX Hardware Node Types - SDL1 Compatible

// Import SDL1 types for compatibility
export interface ParameterDefinition {
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ value: any; label: string }>;
  dependsOn?: {
    parameter: string;
    value: any;
  };
  readOnly?: boolean;
}

export interface ParameterGroup {
  label: string;
  parameters: Record<string, ParameterDefinition>;
}

export interface PrimitiveOperation {
  operation: string;
  parameters: Record<string, any>;
}

// OTFLEX Node Data Interfaces
export interface OTFLEXNodeData {
  label: string;
  description?: string;
  parameters?: Record<string, any>;
  operationType: string;
  parameterGroups?: Record<string, ParameterGroup>;
  primitiveOperations?: PrimitiveOperation[];
}

// MyxArm parameter interfaces
export interface MyxArmPositionParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;
  
  // Movement parameters
  movement_mode: string;
  x_position: number;
  y_position: number;
  z_position: number;
  rx_angle: number;
  ry_angle: number;
  rz_angle: number;
  
  // Joint parameters
  joint1: number;
  joint2: number;
  joint3: number;
  joint4: number;
  joint5: number;
  joint6: number;
  
  // Speed settings
  speed_mode: string;
  custom_speed: number;
  acceleration: number;
  
  // Safety settings
  enable_collision_detection: boolean;
  force_limit: number;
  safe_mode: boolean;
  
  // Precision settings
  position_tolerance: number;
  angle_tolerance: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

export interface MyxArmGripperParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;
  
  // Gripper parameters
  gripper_action: string;
  target_position: number;
  grip_force: number;
  
  // Speed settings
  speed_mode: string;
  custom_speed: number;
  
  // Force settings
  enable_force_control: boolean;
  max_force: number;
  force_threshold: number;
  
  // Safety settings
  safe_mode: boolean;
  collision_detection: boolean;
  
  // Precision settings
  position_tolerance: number;
  force_tolerance: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

// Arduino parameter interfaces
export interface ArduinoPumpParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Pump parameters
  pump_selection: string;
  pump_mode: string;
  volume: number;
  flow_rate: number;
  duration: number;

  // Control parameters
  speed_percentage: number;
  reverse_direction: boolean;

  // Safety parameters
  enable_flow_monitoring: boolean;
  max_pressure: number;
  enable_emergency_stop: boolean;

  // Precision parameters
  volume_tolerance: number;
  flow_tolerance: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

export interface ArduinoTemperatureParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Temperature parameters
  base_number: number;
  temperature_mode: string;
  target_temperature: number;
  start_temperature: number;
  temperature_tolerance: number;

  // Control parameters
  heating_rate: number;
  cooling_rate: number;
  ramp_rate: number;
  hold_time: number;

  // PID parameters
  pid_kp: number;
  pid_ki: number;
  pid_kd: number;

  // Monitoring parameters
  enable_monitoring: boolean;
  monitoring_interval: number;
  wait_for_stability: boolean;
  stability_time: number;
  stability_timeout: number;

  // Safety parameters
  safety_max_temp: number;
  max_heating_time: number;
}

export interface ArduinoUltrasonicParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Ultrasonic parameters
  base_number: number;
  ultrasonic_mode: string;
  duration: number;
  frequency: number;
  power_level: number;

  // Pulse parameters
  pulse_mode: string;
  pulse_duration: number;
  pulse_interval: number;
  duty_cycle: number;

  // Sweep parameters
  start_frequency: number;
  end_frequency: number;
  sweep_rate: number;

  // Monitoring parameters
  enable_monitoring: boolean;
  monitoring_interval: number;
  power_monitoring: boolean;
  temperature_monitoring: boolean;

  // Completion parameters
  wait_for_completion: boolean;
  completion_timeout: number;
}

// OTFlex parameter interfaces
export interface OTFlexTransferParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Transfer parameters
  source_labware: string;
  source_well: string;
  dest_labware: string;
  dest_well: string;
  volume: number;
  pipette: string;

  // Liquid handling parameters
  aspirate_speed: number;
  dispense_speed: number;
  air_gap: number;

  // Safety parameters
  tip_tracking: boolean;
  liquid_detection: boolean;

  // Precision parameters
  volume_tolerance: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

export interface OTFlexElectrodeWashParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Hardware parameters
  pipette: string;
  tip_rack: string;
  wash_reservoir: string;
  rinse_reservoir: string;
  waste_container: string;

  // Electrode parameters
  electrode_position: string;
  dispense_height: number;

  // Wash parameters
  wash_cycles: number;
  wash_volume: number;
  wash_contact_time: number;

  // Rinse parameters
  enable_rinse: boolean;
  rinse_cycles: number;
  rinse_volume: number;
  rinse_contact_time: number;

  // Liquid handling parameters
  aspirate_speed: number;
  dispense_speed: number;
  air_gap: number;

  // Drying parameters
  enable_air_dry: boolean;
  air_dry_time: number;

  // Verification parameters
  verify_cleanliness: boolean;
  verification_method: string;

  // Safety parameters
  tip_tracking: boolean;
  liquid_detection: boolean;
  waste_monitoring: boolean;

  // Timing parameters
  wait_for_completion: boolean;
  completion_timeout: number;
}

// Arduino Furnace parameter interface
export interface ArduinoFurnaceParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Furnace parameters
  furnace_action: string;
  hold_duration: number;

  // Safety parameters
  enable_temperature_check: boolean;
  max_safe_temperature: number;
  enable_position_feedback: boolean;

  // Timing parameters
  operation_timeout: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

// Arduino Electrode parameter interface
export interface ArduinoElectrodeParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Electrode parameters
  electrode_mode: string;
  primary_electrode: string;
  switch_delay: number;

  // Verification parameters
  enable_continuity_check: boolean;
  resistance_threshold: number;

  // Safety parameters
  enable_isolation_check: boolean;
  max_leakage_current: number;

  // Timing parameters
  switch_timeout: number;
  wait_for_stabilization: boolean;
  stabilization_time: number;
}

// Arduino Reactor parameter interface
export interface ArduinoReactorParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Reactor parameters
  reactor_action: string;
  reactor_type: string;
  actuation_force: number;
  hold_duration: number;

  // Control parameters
  actuation_speed: number;
  position_precision: number;

  // Safety parameters
  enable_pressure_monitoring: boolean;
  max_pressure: number;
  enable_force_feedback: boolean;
  max_force: number;

  // Timing parameters
  operation_timeout: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

// OTFlex Gripper parameter interface
export interface OTFlexGripperParams {
  // Common parameters
  uo_name: string;
  description: string;
  wait_before: number;
  wait_after: number;
  error_handling: string;
  log_level: string;

  // Gripper parameters
  gripper_action: string;
  x_position: number;
  y_position: number;
  z_position: number;
  labware_type: string;
  target_labware: string;

  // Force parameters
  grip_force_mode: string;
  custom_force: number;
  force_threshold: number;

  // Movement parameters
  movement_speed: number;
  approach_height: number;

  // Safety parameters
  enable_collision_detection: boolean;
  enable_force_monitoring: boolean;
  max_grip_force: number;

  // Timing parameters
  operation_timeout: number;
  wait_for_completion: boolean;
  completion_timeout: number;
}

// Legacy compatibility
export interface MyxArmNodeData extends OTFLEXNodeData {
  operationType: 'otflexMyxArmPosition' | 'otflexMyxArmGripper';
}

export interface ArduinoNodeData extends OTFLEXNodeData {
  operationType: 'otflexArduinoPump' | 'otflexArduinoTemperature' | 'otflexArduinoUltrasonic';
}

export interface OTFlexNodeData extends OTFLEXNodeData {
  operationType: 'otflexTransfer' | 'otflexElectrodeWash';
}

export interface OTFLEXNodeConfig {
  type: string;
  label: string;
  description: string;
  category: string;
  operationType: string;
  component?: React.ComponentType<any>;
  defaultData?: any;
  parameters?: Array<{
    name: string;
    type: 'number' | 'string' | 'boolean';
    label: string;
    unit?: string;
    range?: [number, number];
    default?: any;
    required?: boolean;
    description?: string;
    enum?: string[];
  }>;
}