// DeckPlanner UO - Main orchestrator for deck planning and binding
import {
  DeckSpec,
  BindingMap,
  ValidationResult,
  RuntimeContext,
  SolverStrategy,
  BindingMetadata
} from './types';
import { LabwareRegistry } from './LabwareRegistry';
import { PlacementSolver } from './PlacementSolver';
import { CapabilityMapper } from './CapabilityMapper';
import { DeckValidator } from './Validator';
import { BindingResolver } from './BindingResolver';

interface DeckPlannerOptions {
  solverStrategy?: SolverStrategy;
  enableValidation?: boolean;
  enableVisualization?: boolean;
  cacheBindings?: boolean;
}

interface PlanningResult {
  bindingMap: BindingMap;
  validationResults: ValidationResult[];
  executionTime: number;  // in ms
  success: boolean;
  warnings: string[];
  errors: string[];
}

export class DeckPlannerUO {
  private registry: LabwareRegistry;
  private solver: PlacementSolver;
  private mapper: CapabilityMapper;
  private validator: DeckValidator;
  private resolver: BindingResolver;
  
  private options: Required<DeckPlannerOptions>;
  private bindingCache: Map<string, BindingMap> = new Map();
  private sessionId?: string;
  
  constructor(
    runtimeContext?: RuntimeContext,
    options: DeckPlannerOptions = {}
  ) {
    // Initialize components
    this.registry = LabwareRegistry.getInstance();
    this.solver = new PlacementSolver(options.solverStrategy || 'greedy');
    this.mapper = new CapabilityMapper(runtimeContext);
    this.validator = new DeckValidator();
    this.resolver = new BindingResolver(this, 'warning');
    
    // Set default options
    this.options = {
      solverStrategy: 'greedy',
      enableValidation: true,
      enableVisualization: true,
      cacheBindings: true,
      ...options
    };
  }
  
  // ============= Main Planning Method =============
  
  async plan(
    deckSpec: DeckSpec,
    runtimeContext?: RuntimeContext
  ): Promise<PlanningResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(deckSpec, runtimeContext);
      
      // Check cache if enabled
      if (this.options.cacheBindings && this.bindingCache.has(cacheKey)) {
        const cachedBinding = this.bindingCache.get(cacheKey)!;
        warnings.push('Using cached binding result');
        
        return {
          bindingMap: cachedBinding,
          validationResults: [],
          executionTime: Date.now() - startTime,
          success: true,
          warnings,
          errors
        };
      }
      
      // Step 1: Validate input specification
      const specValidation = this.validateDeckSpec(deckSpec);
      if (specValidation.errors.length > 0) {
        errors.push(...specValidation.errors);
        return {
          bindingMap: this.createEmptyBinding(),
          validationResults: [],
          executionTime: Date.now() - startTime,
          success: false,
          warnings,
          errors
        };
      }
      warnings.push(...specValidation.warnings);
      
      // Step 2: Map roles to capabilities
      const capabilityMappings = this.mapRolesToCapabilities(deckSpec);
      if (capabilityMappings.has_failures) {
        errors.push('Failed to map some roles to compatible resources');
      }
      
      // Step 3: Solve placement constraints
      const placements = await this.solver.solve(deckSpec, runtimeContext);
      if (placements.size === 0) {
        errors.push('Failed to find valid placement solution');
        return {
          bindingMap: this.createEmptyBinding(),
          validationResults: [],
          executionTime: Date.now() - startTime,
          success: false,
          warnings,
          errors
        };
      }
      
      // Step 4: Create binding map
      const bindingMap = await this.createBindingMap(
        deckSpec,
        placements,
        capabilityMappings.mappings,
        runtimeContext
      );
      
      // Step 5: Validate bindings
      let validationResults: ValidationResult[] = [];
      if (this.options.enableValidation) {
        validationResults = this.validator.validateBinding({
          deckSpec,
          bindingMap,
          runtimeContext
        });
        
        // Collect validation warnings and errors
        validationResults.forEach(result => {
          if (result.severity === 'error') {
            errors.push(result.message);
          } else if (result.severity === 'warning') {
            warnings.push(result.message);
          }
        });
      }
      
      // Step 6: Generate visualization data
      if (this.options.enableVisualization) {
        bindingMap.visualization = this.generateVisualization(bindingMap, validationResults);
      }
      
      // Step 7: Cache result
      if (this.options.cacheBindings && errors.length === 0) {
        this.bindingCache.set(cacheKey, bindingMap);
      }
      
      // Store session binding for resolver
      if (this.sessionId) {
        Object.entries(bindingMap.bindings).forEach(([roleId, binding]) => {
          this.resolver.setSessionBinding(roleId, binding);
        });
      }
      
      return {
        bindingMap,
        validationResults,
        executionTime: Date.now() - startTime,
        success: errors.length === 0,
        warnings,
        errors
      };
      
    } catch (error) {
      errors.push(`Planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        bindingMap: this.createEmptyBinding(),
        validationResults: [],
        executionTime: Date.now() - startTime,
        success: false,
        warnings,
        errors
      };
    }
  }
  
  // ============= Capability Mapping =============
  
  private mapRolesToCapabilities(deckSpec: DeckSpec): {
    mappings: Map<string, any>;
    has_failures: boolean;
  } {
    const mappings = new Map();
    let has_failures = false;
    
    for (const [roleId, role] of Object.entries(deckSpec.roles)) {
      const matches = this.mapper.mapRoleToResources(roleId, role);
      if (matches.length === 0) {
        has_failures = true;
        console.warn(`No compatible resources found for role ${roleId}`);
      } else {
        mappings.set(roleId, matches[0]); // Use best match
      }
    }
    
    return { mappings, has_failures };
  }
  
  // ============= Binding Map Creation =============
  
  private async createBindingMap(
    deckSpec: DeckSpec,
    placements: Map<string, any>,
    capabilityMappings: Map<string, any>,
    runtimeContext?: RuntimeContext
  ): Promise<BindingMap> {
    const bindingMap: BindingMap = {
      bindings: {},
      metadata: this.createBindingMetadata()
    };
    
    // Create bindings for each role
    for (const [roleId, placement] of placements) {
      const capabilityMatch = capabilityMappings.get(roleId);
      if (!capabilityMatch) continue;
      
      const labware = this.registry.getLabware(placement.labwareId);
      if (!labware) continue;
      
      // Create role binding
      const roleBinding = {
        slot: placement.slot,
        labware: {
          id: labware.id,
          type: labware.type || 'unknown',
          displayName: labware.displayName,
          dimensions: labware.dimensions
        },
        metadata: {
          capabilities_satisfied: capabilityMatch.satisfiedCapabilities || [],
          warnings: placement.violations || [],
          alternatives: []
        }
      };
      
      // Add module if required
      if (placement.moduleId) {
        const module = this.registry.getModule(placement.moduleId);
        if (module) {
          roleBinding.module = {
            id: module.id,
            type: module.type
          };
        }
      }
      
      // Add pipette assignment if needed
      if (capabilityMatch.pipetteMount) {
        const role = deckSpec.roles[roleId];
        const pipetteAssignment = this.mapper.assignPipette(
          role.volume || { min: 1, max: 1000 },
          capabilityMatch.pipetteMount.includes('multi') ? 8 : 1,
          capabilityMatch.pipetteMount
        );
        
        if (pipetteAssignment) {
          roleBinding.pipette = pipetteAssignment;
        }
      }
      
      // Add well selection
      if (labware.wellLayout) {
        roleBinding.wells = this.mapper.selectWells(
          labware.id,
          1,
          'sequential',
          []
        );
      }
      
      bindingMap.bindings[roleId] = roleBinding;
    }
    
    // Generate execution plan
    bindingMap.executionPlan = this.generateExecutionPlan(bindingMap, deckSpec);
    
    return bindingMap;
  }
  
  // ============= Execution Plan Generation =============
  
  private generateExecutionPlan(bindingMap: BindingMap, deckSpec: DeckSpec): any {
    const bindings = Object.values(bindingMap.bindings);
    
    // Calculate estimated time (simplified)
    let estimatedTime = 0;
    const movements = bindings.length * (bindings.length - 1); // All-to-all movements
    estimatedTime += movements * 10; // 10 seconds per movement (rough estimate)
    
    // Calculate tip usage
    const tipUsage: any = {};
    bindings.forEach(binding => {
      if (binding.pipette) {
        const pipetteType = binding.pipette.type;
        if (!tipUsage[pipetteType]) {
          tipUsage[pipetteType] = {
            tips_needed: 0,
            racks_needed: 0
          };
        }
        tipUsage[pipetteType].tips_needed += 8; // Rough estimate
        tipUsage[pipetteType].racks_needed = Math.ceil(tipUsage[pipetteType].tips_needed / 96);
      }
    });
    
    // Calculate movement efficiency
    let totalDistance = 0;
    let pathCount = 0;
    
    for (let i = 0; i < bindings.length - 1; i++) {
      for (let j = i + 1; j < bindings.length; j++) {
        const distance = this.calculateSlotDistance(bindings[i].slot, bindings[j].slot);
        totalDistance += distance;
        pathCount++;
      }
    }
    
    const avgDistance = pathCount > 0 ? totalDistance / pathCount : 0;
    const movementEfficiency = Math.max(0, 1 - (avgDistance / 300)); // Normalize to 0-1
    
    // Calculate resource utilization
    const slotUsage = (bindings.length / 11) * 100; // OT-2 has 11 slots
    const moduleUsage = bindings.filter(b => b.module).length / bindings.length * 100;
    
    const leftPipetteUsage = bindings.filter(b => 
      b.pipette?.mount === 'left').length / bindings.length * 100;
    const rightPipetteUsage = bindings.filter(b => 
      b.pipette?.mount === 'right').length / bindings.length * 100;
    
    return {
      estimated_time: estimatedTime,
      tip_usage: tipUsage,
      movement_efficiency: movementEfficiency,
      collision_risk: 'low' as const,
      resource_utilization: {
        slot_usage: slotUsage,
        module_usage: moduleUsage,
        pipette_usage: {
          left: leftPipetteUsage,
          right: rightPipetteUsage
        }
      }
    };
  }
  
  // ============= Visualization =============
  
  private generateVisualization(
    bindingMap: BindingMap,
    validationResults: ValidationResult[]
  ): any {
    // Generate simple SVG representation
    let svg = '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">';
    svg += '<rect width="400" height="300" fill="#f0f0f0" stroke="#333"/>';
    
    // Draw slots
    for (let slot = 1; slot <= 11; slot++) {
      const pos = this.getSlotPosition(slot);
      const x = pos.x * 1.1; // Scale for display
      const y = pos.y * 1.1;
      
      // Check if slot is occupied
      const binding = Object.values(bindingMap.bindings).find(b => b.slot === slot);
      const fillColor = binding ? '#4CAF50' : '#E0E0E0';
      
      svg += `<rect x="${x}" y="${y}" width="30" height="20" fill="${fillColor}" stroke="#333"/>`;
      svg += `<text x="${x + 15}" y="${y + 12}" text-anchor="middle" font-size="10">${slot}</text>`;
      
      if (binding) {
        svg += `<text x="${x + 15}" y="${y + 25}" text-anchor="middle" font-size="8" fill="#666">${binding.labware.displayName.substring(0, 8)}</text>`;
      }
    }
    
    svg += '</svg>';
    
    // Generate conflict zones
    const conflictZones = this.validator.generateConflictZones({
      deckSpec: {} as any,
      bindingMap,
      runtimeContext: undefined
    });
    
    return {
      svg,
      conflict_zones: conflictZones,
      movement_paths: []
    };
  }
  
  // ============= Utility Methods =============
  
  private validateDeckSpec(deckSpec: DeckSpec): { warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Basic validation
    if (!deckSpec.roles || Object.keys(deckSpec.roles).length === 0) {
      errors.push('No roles defined in deck specification');
    }
    
    if (!deckSpec.version) {
      warnings.push('No version specified, assuming 1.0');
    }
    
    // Validate role definitions
    Object.entries(deckSpec.roles).forEach(([roleId, role]) => {
      if (!role.capabilities || role.capabilities.length === 0) {
        warnings.push(`Role ${roleId} has no capabilities defined`);
      }
      
      if (role.constraints?.fixedSlot) {
        const slot = role.constraints.fixedSlot;
        if (slot < 1 || slot > 11) {
          errors.push(`Invalid fixed slot ${slot} for role ${roleId}`);
        }
      }
    });
    
    return { warnings, errors };
  }
  
  private generateCacheKey(deckSpec: DeckSpec, runtimeContext?: RuntimeContext): string {
    const specHash = JSON.stringify({
      roles: deckSpec.roles,
      optimization: deckSpec.optimization,
      template: deckSpec.template
    });
    
    const contextHash = runtimeContext ? JSON.stringify({
      availableSlots: runtimeContext.availableSlots,
      installedModules: runtimeContext.installedModules,
      occupiedSlots: runtimeContext.occupiedSlots
    }) : '';
    
    return `${this.hashCode(specHash)}_${this.hashCode(contextHash)}`;
  }
  
  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  private createEmptyBinding(): BindingMap {
    return {
      bindings: {},
      metadata: this.createBindingMetadata()
    };
  }
  
  private createBindingMetadata(): BindingMetadata {
    return {
      created_at: new Date().toISOString(),
      solver_version: '1.0.0',
      solver_strategy: this.options.solverStrategy,
      optimization_score: 0,
      validation_status: 'valid'
    };
  }
  
  private calculateSlotDistance(slot1: number, slot2: number): number {
    const pos1 = this.getSlotPosition(slot1);
    const pos2 = this.getSlotPosition(slot2);
    
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private getSlotPosition(slot: number): { x: number; y: number } {
    // Simplified slot positions for visualization
    const positions: Record<number, { x: number; y: number }> = {
      1: { x: 50, y: 50 },
      2: { x: 150, y: 50 },
      3: { x: 250, y: 50 },
      4: { x: 50, y: 100 },
      5: { x: 150, y: 100 },
      6: { x: 250, y: 100 },
      7: { x: 50, y: 150 },
      8: { x: 150, y: 150 },
      9: { x: 250, y: 150 },
      10: { x: 50, y: 200 },
      11: { x: 150, y: 200 }
    };
    
    return positions[slot] || { x: 0, y: 0 };
  }
  
  // ============= Public API =============
  
  getBinding(roleId: string): any {
    return this.resolver.sessionBindings?.get(roleId);
  }
  
  clearCache(): void {
    this.bindingCache.clear();
  }
  
  setSessionId(id: string): void {
    this.sessionId = id;
  }
  
  getResolver(): BindingResolver {
    return this.resolver;
  }
  
  getRegistry(): LabwareRegistry {
    return this.registry;
  }
  
  // Export binding for Canvas/LCP usage
  exportBinding(format: 'json' | 'yaml' = 'json'): string {
    const bindings = Array.from(this.resolver.sessionBindings || new Map());
    
    if (format === 'yaml') {
      // Simple YAML-like format
      let yaml = 'bindings:\n';
      bindings.forEach(([roleId, binding]) => {
        yaml += `  ${roleId}:\n`;
        yaml += `    slot: ${binding.slot}\n`;
        yaml += `    labware: ${binding.labware.id}\n`;
        if (binding.module) {
          yaml += `    module: ${binding.module.id}\n`;
        }
        if (binding.pipette) {
          yaml += `    pipette: ${binding.pipette.mount} ${binding.pipette.type}\n`;
        }
      });
      return yaml;
    }
    
    return JSON.stringify(Object.fromEntries(bindings), null, 2);
  }
}