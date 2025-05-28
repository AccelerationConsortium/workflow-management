/**
 * Types for Unit Operation Builder - Drag & Drop Interface
 */

// Component types that can be dragged into the UO builder
export enum ComponentType {
  SELECT = 'select',
  INPUT = 'input',
  NUMBER_INPUT = 'number_input',
  BOOLEAN = 'boolean',
  DATE_PICKER = 'date_picker',
  UNIT_LABEL = 'unit_label',
  PARAMETER_NAME = 'parameter_name',
  RANGE_SLIDER = 'range_slider',
  TEXT_AREA = 'text_area',
  // Workflow components for lab automation
  DEVICE_INITIALIZATION = 'device_initialization',
  USER_CONFIRMATION = 'user_confirmation',
  LIQUID_TRANSFER = 'liquid_transfer',
  START_REACTION = 'start_reaction',
  TRIGGER_MEASUREMENT = 'trigger_measurement',
  PAUSE_DELAY = 'pause_delay'
}

// Base interface for all draggable components
export interface BaseComponent {
  id: string;
  type: ComponentType;
  label: string;
  description?: string;
  required: boolean;
  position: {
    x: number;
    y: number;
  };
}

// Specific component interfaces
export interface SelectComponent extends BaseComponent {
  type: ComponentType.SELECT;
  options: string[];
  defaultValue?: string;
  multiple?: boolean;
}

export interface InputComponent extends BaseComponent {
  type: ComponentType.INPUT;
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
}

export interface NumberInputComponent extends BaseComponent {
  type: ComponentType.NUMBER_INPUT;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface BooleanComponent extends BaseComponent {
  type: ComponentType.BOOLEAN;
  defaultValue?: boolean;
}

export interface DatePickerComponent extends BaseComponent {
  type: ComponentType.DATE_PICKER;
  defaultValue?: string;
  minDate?: string;
  maxDate?: string;
}

export interface UnitLabelComponent extends BaseComponent {
  type: ComponentType.UNIT_LABEL;
  unit: string;
  linkedParameterId?: string;
}

export interface ParameterNameComponent extends BaseComponent {
  type: ComponentType.PARAMETER_NAME;
  parameterName: string;
  editable: boolean;
}

export interface RangeSliderComponent extends BaseComponent {
  type: ComponentType.RANGE_SLIDER;
  min: number;
  max: number;
  defaultValue?: [number, number];
  step?: number;
  unit?: string;
}

export interface TextAreaComponent extends BaseComponent {
  type: ComponentType.TEXT_AREA;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  maxLength?: number;
}

// Workflow component interfaces for lab automation
export interface DeviceInitializationComponent extends BaseComponent {
  type: ComponentType.DEVICE_INITIALIZATION;
  deviceId: string;
  deviceType?: 'photoreactor' | 'cytation' | 'robot' | 'other';
  initMode?: 'soft' | 'hard';
  timeoutS?: number;
  retryCount?: number;
}

export interface UserConfirmationComponent extends BaseComponent {
  type: ComponentType.USER_CONFIRMATION;
  promptText: string;
  expectedResponse?: 'yes' | 'ok' | 'done';
  timeoutS?: number;
  abortOnTimeout?: boolean;
}

export interface LiquidTransferComponent extends BaseComponent {
  type: ComponentType.LIQUID_TRANSFER;
  sourceContainer: string;
  targetContainer: string;
  volumeMl: number;
  speedUlPerS?: number;
  pipetteType?: 'single' | 'multi';
  mixAfter?: boolean;
}

export interface StartReactionComponent extends BaseComponent {
  type: ComponentType.START_REACTION;
  deviceId: string;
  mode?: string;
  durationS?: number;
  intensityPct?: number;
}

export interface TriggerMeasurementComponent extends BaseComponent {
  type: ComponentType.TRIGGER_MEASUREMENT;
  deviceId: string;
  measurementType?: 'OD600' | 'fluorescence' | 'absorbance' | 'other';
  wavelengthNm?: number;
  integrationTimeMs?: number;
  exportFormat?: 'csv' | 'json';
  saveTo?: string;
}

export interface PauseDelayComponent extends BaseComponent {
  type: ComponentType.PAUSE_DELAY;
  durationS: number;
  reason?: string;
  skippable?: boolean;
}

// Union type for all components
export type UOComponent =
  | SelectComponent
  | InputComponent
  | NumberInputComponent
  | BooleanComponent
  | DatePickerComponent
  | UnitLabelComponent
  | ParameterNameComponent
  | RangeSliderComponent
  | TextAreaComponent
  | DeviceInitializationComponent
  | UserConfirmationComponent
  | LiquidTransferComponent
  | StartReactionComponent
  | TriggerMeasurementComponent
  | PauseDelayComponent;

// UO Builder state
export interface UOBuilderState {
  name: string;
  description: string;
  category: string;
  components: UOComponent[];
  previewMode: boolean;
}

// Component library item (for the right sidebar)
export interface ComponentLibraryItem {
  type: ComponentType;
  label: string;
  description: string;
  icon: string;
  defaultProps: Partial<UOComponent>;
}

// Generated UO schema from the builder
export interface GeneratedUOSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: GeneratedParameter[];
  createdAt: string;
  version: string;
}

export interface GeneratedParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'range';
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    options?: string[];
    pattern?: string;
  };
  unit?: string;
  description?: string;
}

// Registration result
export interface UORegistrationResult {
  success: boolean;
  uoId?: string;
  schema?: GeneratedUOSchema;
  error?: string;
}

// Category management
export interface UOCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

// Builder validation
export interface BuilderValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  componentId?: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  componentId?: string;
  field: string;
  message: string;
  suggestion?: string;
}

// Drag and drop context
export interface DragDropContext {
  draggedItem: ComponentLibraryItem | null;
  dropZone: 'builder' | 'trash' | null;
  isDragging: boolean;
}

// Builder actions
export type BuilderAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'ADD_COMPONENT'; payload: UOComponent }
  | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<UOComponent> } }
  | { type: 'REMOVE_COMPONENT'; payload: string }
  | { type: 'MOVE_COMPONENT'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'SET_PREVIEW_MODE'; payload: boolean }
  | { type: 'RESET_BUILDER' }
  | { type: 'LOAD_UO'; payload: UOBuilderState };
