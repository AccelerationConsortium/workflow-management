// DeckPlanner Type Definitions
import { OperationNode } from '../../types';

// ============= Core Types =============

export interface DeckPlannerNode extends OperationNode {
  data: DeckPlannerNodeData;
}

export interface DeckPlannerNodeData {
  label: string;
  deckSpec: DeckSpec;
  bindingMap?: BindingMap;
  validationResults?: ValidationResult[];
}

// ============= DeckSpec (Input) =============

export interface DeckSpec {
  version: string;
  protocol: {
    name: string;
    author?: string;
    description?: string;
  };
  
  // Role definitions
  roles: {
    [roleId: string]: RoleDefinition;
  };
  
  // Optional template
  template?: DeckTemplate;
  
  // Optimization settings
  optimization?: OptimizationConfig;
  
  // Runtime context
  runtimeContext?: RuntimeContext;
}

export interface RoleDefinition {
  description: string;
  capabilities: Capability[];
  constraints?: RoleConstraints;
  preferredLabware?: string[];
  volume?: VolumeRange;
  temperature?: TemperatureRange;
}

export interface RoleConstraints {
  temperature?: TemperatureRange;
  volume?: VolumeRange;
  adjacent?: string[];      // Roles that should be adjacent
  isolated?: boolean;        // Needs to be isolated from other roles
  fixedSlot?: number;       // Must be in specific slot
  accessibleBy?: string[];  // Which pipettes need access
  maxDistance?: number;     // Max distance from reference role
}

export interface Capability {
  type: CapabilityType;
  value?: any;
}

export type CapabilityType = 
  | 'hold_liquid'
  | 'hold_solid'
  | 'temperature_control'
  | 'mixing'
  | 'heating'
  | 'cooling'
  | 'shaking'
  | 'magnetic'
  | 'multi_channel_accessible'
  | 'single_channel_accessible'
  | 'tip_rack'
  | 'waste'
  | 'reagent_reservoir'
  | '96_well_compatible'
  | '384_well_compatible'
  | 'filter_tips'
  | 'large_volume';

export interface VolumeRange {
  min: number;  // in µL
  max: number;  // in µL
}

export interface TemperatureRange {
  min: number;  // in °C
  max: number;  // in °C
}

export type DeckTemplate = 
  | 'PCR'
  | 'NGS_prep'
  | 'ELISA'
  | 'cell_culture'
  | 'protein_purification'
  | 'magnetic_separation'
  | 'custom';

export interface OptimizationConfig {
  priority: OptimizationPriority;
  weights?: OptimizationWeights;
  constraints?: OptimizationConstraints;
}

export type OptimizationPriority = 
  | 'minimize_moves'
  | 'maximize_throughput'
  | 'minimize_tips'
  | 'minimize_time'
  | 'minimize_contamination_risk';

export interface OptimizationWeights {
  movement_distance: number;     // 0-1
  tip_usage: number;             // 0-1
  time: number;                  // 0-1
  contamination_risk: number;    // 0-1
  resource_utilization: number;  // 0-1
}

export interface OptimizationConstraints {
  max_tip_usage?: number;
  max_execution_time?: number;  // in seconds
  min_separation_distance?: number;  // in mm
}

export interface RuntimeContext {
  availableSlots: number[];
  installedModules: InstalledModule[];
  availablePipettes: AvailablePipette[];
  existingLabware?: ExistingLabware[];
  occupiedSlots?: number[];
}

export interface InstalledModule {
  slot: number;
  type: ModuleType;
  id: string;
  capabilities: Capability[];
}

export interface AvailablePipette {
  mount: 'left' | 'right';
  type: string;
  channels: 1 | 8;
  minVolume: number;
  maxVolume: number;
}

export interface ExistingLabware {
  slot: number;
  labwareId: string;
  labwareType: string;
  usedWells?: string[];
}

export type ModuleType = 
  | 'temperature_module_gen1'
  | 'temperature_module_gen2'
  | 'magnetic_module_gen1'
  | 'magnetic_module_gen2'
  | 'heater_shaker_module'
  | 'thermocycler_module';

// ============= BindingMap (Output) =============

export interface BindingMap {
  bindings: {
    [roleId: string]: RoleBinding;
  };
  
  executionPlan?: ExecutionPlan;
  visualization?: VisualizationData;
  metadata: BindingMetadata;
}

export interface RoleBinding {
  slot: number;
  labware: LabwareDefinition;
  module?: ModuleDefinition;
  wells?: WellSelection;
  pipette?: PipetteAssignment;
  metadata: {
    capabilities_satisfied: string[];
    warnings?: string[];
    alternatives?: AlternativeBinding[];
  };
}

export interface LabwareDefinition {
  id: string;
  type: string;
  displayName: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  wellCount?: number;
  wellVolume?: number;  // in µL
}

export interface ModuleDefinition {
  id: string;
  type: ModuleType;
  settings?: Record<string, any>;
}

export interface WellSelection {
  rows?: string[];
  columns?: string[];
  specific?: string[];
  pattern?: 'all' | 'alternating' | 'checkerboard' | 'custom';
}

export interface PipetteAssignment {
  mount: 'left' | 'right';
  type: string;
  tipRackSlot?: number;
}

export interface AlternativeBinding {
  slot: number;
  score: number;  // 0-1
  reason: string;
}

export interface ExecutionPlan {
  estimated_time: number;  // in seconds
  tip_usage: TipUsageEstimate;
  movement_efficiency: number;  // 0-1
  collision_risk: CollisionRisk;
  resource_utilization: ResourceUtilization;
}

export interface TipUsageEstimate {
  [pipetteType: string]: {
    tips_needed: number;
    racks_needed: number;
    replacement_points?: number[];  // Step indices where replacement needed
  };
}

export type CollisionRisk = 'low' | 'medium' | 'high';

export interface ResourceUtilization {
  slot_usage: number;  // percentage
  module_usage: number;  // percentage
  pipette_usage: {
    left?: number;  // percentage
    right?: number;  // percentage
  };
}

export interface VisualizationData {
  svg?: string;  // Deck layout SVG
  heatmap?: number[][];  // Usage frequency heatmap
  conflict_zones?: ConflictZone[];
  movement_paths?: MovementPath[];
}

export interface ConflictZone {
  slots: number[];
  type: 'collision' | 'contamination' | 'accessibility';
  severity: 'warning' | 'error';
  description: string;
}

export interface MovementPath {
  from: { slot: number; well?: string };
  to: { slot: number; well?: string };
  frequency: number;
  distance: number;  // in mm
}

export interface BindingMetadata {
  created_at: string;
  solver_version: string;
  solver_strategy: SolverStrategy;
  optimization_score: number;  // 0-1
  validation_status: 'valid' | 'warnings' | 'errors';
}

export type SolverStrategy = 
  | 'greedy'
  | 'simulated_annealing'
  | 'ilp'
  | 'genetic_algorithm'
  | 'manual';

// ============= Validation =============

export interface ValidationResult {
  type: ValidationType;
  severity: 'info' | 'warning' | 'error';
  message: string;
  affectedRoles?: string[];
  suggestedFix?: string;
}

export type ValidationType = 
  | 'collision'
  | 'accessibility'
  | 'volume'
  | 'temperature'
  | 'contamination'
  | 'capacity'
  | 'compatibility';

// ============= Binding Resolver (Compatibility) =============

export interface BindingResolverInput {
  type: 'legacy' | 'role-based' | 'hybrid';
  source: LocationSpec;
  destination: LocationSpec;
  volume?: number;
}

export interface LocationSpec {
  // Role-based specification
  role?: string;
  wellSelection?: WellSelection;
  
  // Legacy specification
  slot?: number;
  labware?: string;
  wells?: string[];
}

export interface ResolvedBinding {
  source: ResolvedLocation;
  destination: ResolvedLocation;
  metadata: {
    inputType: 'legacy' | 'role-based' | 'hybrid';
    migrationReady: boolean | 'partial';
    migrationProgress?: number;  // 0-100
    optimized?: boolean;
  };
}

export interface ResolvedLocation {
  slot: number;
  labware: LabwareDefinition;
  wells: string[];
  module?: ModuleDefinition;
  pipette?: PipetteAssignment;
}

// ============= Component Registry =============

export interface LabwareRegistryEntry {
  id: string;
  displayName: string;
  manufacturer: string;
  capabilities: Capability[];
  dimensions: {
    x: number;
    y: number; 
    z: number;
  };
  wellLayout?: {
    rows: number;
    columns: number;
    wellVolume: number;  // in µL
    wellShape: 'circular' | 'square' | 'rectangular';
  };
  compatibleModules?: ModuleType[];
  tags?: string[];
}

export interface ModuleRegistryEntry {
  id: string;
  type: ModuleType;
  displayName: string;
  manufacturer: string;
  capabilities: Capability[];
  specifications: {
    temperatureRange?: TemperatureRange;
    shakingSpeed?: { min: number; max: number };  // RPM
    magneticStrength?: number;  // Tesla
  };
  slotCompatibility: number[];
  heightOffset: number;  // in mm
}