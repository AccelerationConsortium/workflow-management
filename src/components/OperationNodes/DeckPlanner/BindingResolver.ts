// Binding Resolver - Backward compatibility layer for existing UOs
import {
  BindingResolverInput,
  ResolvedBinding,
  ResolvedLocation,
  LocationSpec,
  BindingMap,
  RoleBinding,
  LabwareDefinition
} from './types';
import { LabwareRegistry } from './LabwareRegistry';

interface MigrationHint {
  level: 'info' | 'warning' | 'error';
  message: string;
  suggestion?: RoleSuggestion;
}

interface RoleSuggestion {
  roleId: string;
  description: string;
  capabilities: string[];
  constraints?: Record<string, any>;
}

interface LegacyLabwareMapping {
  [labwareId: string]: {
    displayName: string;
    defaultCapabilities: string[];
    suggestedRole: string;
  };
}

type MigrationMode = 'silent' | 'warning' | 'strict';

export class BindingResolver {
  private registry: LabwareRegistry;
  private deckPlanner?: any; // DeckPlanner instance (circular dependency avoided)
  private migrationMode: MigrationMode;
  private migrationHints: MigrationHint[] = [];
  private sessionBindings: Map<string, RoleBinding> = new Map();
  
  // Legacy to modern labware mapping
  private readonly LEGACY_LABWARE_MAP: LegacyLabwareMapping = {
    // Common legacy IDs to modern equivalents
    'plate_96': {
      displayName: 'Generic 96-well Plate',
      defaultCapabilities: ['hold_liquid', '96_well_compatible'],
      suggestedRole: 'sample_plate'
    },
    'tips_300ul': {
      displayName: '300µL Tips',
      defaultCapabilities: ['tip_rack'],
      suggestedRole: 'tips_p300'
    },
    'reservoir_12': {
      displayName: '12-well Reservoir',
      defaultCapabilities: ['reagent_reservoir', 'large_volume'],
      suggestedRole: 'reagent_source'
    },
    'waste_container': {
      displayName: 'Waste Container',
      defaultCapabilities: ['waste', 'large_volume'],
      suggestedRole: 'liquid_waste'
    }
  };
  
  constructor(
    deckPlanner?: any,
    migrationMode: MigrationMode = 'warning'
  ) {
    this.registry = LabwareRegistry.getInstance();
    this.deckPlanner = deckPlanner;
    this.migrationMode = migrationMode;
  }
  
  // ============= Main Resolution Method =============
  
  resolve(input: BindingResolverInput): ResolvedBinding {
    // Clear previous hints
    this.migrationHints = [];
    
    // Detect input type if not specified
    const inputType = input.type || this.detectInputType(input);
    
    // Route to appropriate resolver
    switch (inputType) {
      case 'legacy':
        return this.resolveLegacy(input);
      case 'role-based':
        return this.resolveRoleBased(input);
      case 'hybrid':
        return this.resolveHybrid(input);
      default:
        throw new Error(`Unknown input type: ${inputType}`);
    }
  }
  
  // ============= Input Type Detection =============
  
  private detectInputType(input: BindingResolverInput): 'legacy' | 'role-based' | 'hybrid' {
    const hasRole = (spec: LocationSpec) => spec.role !== undefined;
    const hasSlot = (spec: LocationSpec) => spec.slot !== undefined;
    
    const sourceHasRole = hasRole(input.source);
    const sourceHasSlot = hasSlot(input.source);
    const destHasRole = hasRole(input.destination);
    const destHasSlot = hasSlot(input.destination);
    
    if (sourceHasRole && destHasRole && !sourceHasSlot && !destHasSlot) {
      return 'role-based';
    }
    if (!sourceHasRole && !destHasRole && sourceHasSlot && destHasSlot) {
      return 'legacy';
    }
    return 'hybrid';
  }
  
  // ============= Legacy Resolution =============
  
  private resolveLegacy(input: BindingResolverInput): ResolvedBinding {
    const source = this.resolveLegacyLocation(input.source, 'source');
    const destination = this.resolveLegacyLocation(input.destination, 'destination');
    
    // Add migration suggestion
    if (this.migrationMode !== 'silent') {
      this.addMigrationHint({
        level: 'info',
        message: 'Consider migrating to role-based specification for better flexibility',
        suggestion: this.generateRoleSuggestion(input)
      });
    }
    
    return {
      source,
      destination,
      metadata: {
        inputType: 'legacy',
        migrationReady: false,
        migrationProgress: 0
      }
    };
  }
  
  private resolveLegacyLocation(spec: LocationSpec, context: 'source' | 'destination'): ResolvedLocation {
    if (!spec.slot || !spec.labware) {
      throw new Error(`Legacy format requires slot and labware for ${context}`);
    }
    
    // Try to find modern equivalent
    let labwareDefinition = this.registry.getLabware(spec.labware);
    
    // If not found, try legacy mapping
    if (!labwareDefinition && this.LEGACY_LABWARE_MAP[spec.labware]) {
      const mapping = this.LEGACY_LABWARE_MAP[spec.labware];
      
      // Find best match in registry
      const matches = this.registry.getAllLabware().filter(lw =>
        lw.displayName.toLowerCase().includes(mapping.displayName.toLowerCase()) ||
        mapping.defaultCapabilities.some(cap => 
          lw.capabilities.some(lwCap => lwCap.type === cap)
        )
      );
      
      if (matches.length > 0) {
        labwareDefinition = matches[0];
        
        // Log deprecation warning
        this.addMigrationHint({
          level: 'warning',
          message: `Legacy labware ID '${spec.labware}' mapped to '${labwareDefinition.id}'`
        });
      }
    }
    
    // Fallback to generic definition
    if (!labwareDefinition) {
      this.addMigrationHint({
        level: 'error',
        message: `Unknown labware '${spec.labware}'. Using generic placeholder.`
      });
      
      labwareDefinition = {
        id: spec.labware,
        type: 'unknown',
        displayName: spec.labware,
        dimensions: { x: 127.76, y: 85.48, z: 14.22 }  // Default dimensions
      };
    }
    
    return {
      slot: spec.slot,
      labware: labwareDefinition,
      wells: spec.wells || ['A1'],
      module: undefined,
      pipette: undefined
    };
  }
  
  // ============= Role-Based Resolution =============
  
  private resolveRoleBased(input: BindingResolverInput): ResolvedBinding {
    if (!this.deckPlanner) {
      throw new Error('DeckPlanner instance required for role-based resolution');
    }
    
    const source = this.resolveRoleLocation(input.source, 'source');
    const destination = this.resolveRoleLocation(input.destination, 'destination');
    
    return {
      source,
      destination,
      metadata: {
        inputType: 'role-based',
        migrationReady: true,
        optimized: true
      }
    };
  }
  
  private resolveRoleLocation(spec: LocationSpec, context: 'source' | 'destination'): ResolvedLocation {
    if (!spec.role) {
      throw new Error(`Role-based format requires role for ${context}`);
    }
    
    // Get binding from DeckPlanner
    const binding = this.sessionBindings.get(spec.role) || 
                   this.deckPlanner?.getBinding(spec.role);
    
    if (!binding) {
      throw new Error(`No binding found for role '${spec.role}'`);
    }
    
    // Apply well selection if specified
    let wells = binding.wells?.specific || [];
    if (spec.wellSelection) {
      wells = this.applyWellSelection(wells, spec.wellSelection, binding.labware);
    }
    
    return {
      slot: binding.slot,
      labware: binding.labware,
      wells,
      module: binding.module ? {
        id: binding.module.id,
        type: binding.module.type,
        settings: binding.module.settings
      } : undefined,
      pipette: binding.pipette
    };
  }
  
  // ============= Hybrid Resolution =============
  
  private resolveHybrid(input: BindingResolverInput): ResolvedBinding {
    const source = this.resolveHybridLocation(input.source, 'source');
    const destination = this.resolveHybridLocation(input.destination, 'destination');
    
    const migrationProgress = this.calculateMigrationProgress(input);
    
    return {
      source,
      destination,
      metadata: {
        inputType: 'hybrid',
        migrationReady: 'partial',
        migrationProgress
      }
    };
  }
  
  private resolveHybridLocation(spec: LocationSpec, context: 'source' | 'destination'): ResolvedLocation {
    // Prefer role-based if available
    if (spec.role) {
      return this.resolveRoleLocation(spec, context);
    }
    
    // Fall back to legacy
    if (spec.slot && spec.labware) {
      return this.resolveLegacyLocation(spec, context);
    }
    
    throw new Error(`Insufficient information for ${context} location`);
  }
  
  // ============= Utility Methods =============
  
  private applyWellSelection(
    availableWells: string[],
    selection: any,
    labware: LabwareDefinition
  ): string[] {
    // Simple implementation - could be enhanced
    if (selection.specific) {
      return selection.specific.filter(well => availableWells.includes(well));
    }
    
    if (selection.rows && selection.columns) {
      const selected: string[] = [];
      for (const row of selection.rows) {
        for (const col of selection.columns) {
          const well = `${row}${col}`;
          if (availableWells.includes(well)) {
            selected.push(well);
          }
        }
      }
      return selected;
    }
    
    return availableWells;
  }
  
  private calculateMigrationProgress(input: BindingResolverInput): number {
    let roleCount = 0;
    let totalCount = 0;
    
    [input.source, input.destination].forEach(spec => {
      totalCount++;
      if (spec.role) {
        roleCount++;
      }
    });
    
    return Math.round((roleCount / totalCount) * 100);
  }
  
  private generateRoleSuggestion(input: BindingResolverInput): RoleSuggestion {
    // Simple heuristic to suggest role names
    const sourceLabware = input.source.labware;
    const destLabware = input.destination.labware;
    
    let roleId = 'unknown_role';
    let description = 'Generated role suggestion';
    let capabilities: string[] = [];
    
    if (sourceLabware) {
      const mapping = this.LEGACY_LABWARE_MAP[sourceLabware];
      if (mapping) {
        roleId = mapping.suggestedRole;
        description = `Role for ${mapping.displayName}`;
        capabilities = mapping.defaultCapabilities;
      }
    }
    
    return {
      roleId,
      description,
      capabilities
    };
  }
  
  private addMigrationHint(hint: MigrationHint): void {
    this.migrationHints.push(hint);
    
    if (this.migrationMode === 'warning' || this.migrationMode === 'strict') {
      console.warn(`[Migration] ${hint.level.toUpperCase()}: ${hint.message}`);
    }
    
    if (this.migrationMode === 'strict' && hint.level === 'error') {
      throw new Error(`Migration error: ${hint.message}`);
    }
  }
  
  // ============= Session Management =============
  
  setSessionBinding(roleId: string, binding: RoleBinding): void {
    this.sessionBindings.set(roleId, binding);
  }
  
  clearSessionBindings(): void {
    this.sessionBindings.clear();
  }
  
  // ============= Migration Helpers =============
  
  getMigrationHints(): MigrationHint[] {
    return [...this.migrationHints];
  }
  
  generateMigrationReport(): string {
    const hints = this.getMigrationHints();
    if (hints.length === 0) {
      return 'No migration issues detected.';
    }
    
    let report = `Migration Report (${hints.length} items):\n\n`;
    
    hints.forEach((hint, index) => {
      report += `${index + 1}. [${hint.level.toUpperCase()}] ${hint.message}\n`;
      if (hint.suggestion) {
        report += `   Suggested role: ${hint.suggestion.roleId}\n`;
        report += `   Description: ${hint.suggestion.description}\n`;
        report += `   Capabilities: ${hint.suggestion.capabilities.join(', ')}\n`;
      }
      report += '\n';
    });
    
    return report;
  }
  
  // ============= Automated Migration Tools =============
  
  convertLegacyToRoles(legacyInputs: BindingResolverInput[]): {
    deckSpec: any;
    conversionReport: string;
  } {
    const roles: Record<string, any> = {};
    let conversionReport = 'Legacy to Role Conversion Report:\n\n';
    
    legacyInputs.forEach((input, index) => {
      if (input.type === 'legacy' || this.detectInputType(input) === 'legacy') {
        const suggestion = this.generateRoleSuggestion(input);
        
        roles[suggestion.roleId] = {
          description: suggestion.description,
          capabilities: suggestion.capabilities.map(cap => ({ type: cap })),
          constraints: {
            fixedSlot: input.source.slot
          }
        };
        
        conversionReport += `${index + 1}. Created role '${suggestion.roleId}'\n`;
        conversionReport += `   Source: slot ${input.source.slot}, labware ${input.source.labware}\n`;
        conversionReport += `   Capabilities: ${suggestion.capabilities.join(', ')}\n\n`;
      }
    });
    
    const deckSpec = {
      version: '1.0',
      protocol: {
        name: 'Converted Protocol',
        description: 'Auto-converted from legacy format'
      },
      roles,
      optimization: {
        priority: 'minimize_moves'
      }
    };
    
    return { deckSpec, conversionReport };
  }
  
  // ============= Compatibility Layer =============
  
  createCompatibilityWrapper<T>(legacyUO: T): T {
    return new Proxy(legacyUO as any, {
      get: (target, prop) => {
        if (prop === 'execute') {
          return (params: any) => {
            // Intercept and convert parameters
            const convertedParams = this.convertLegacyParameters(params);
            return target.execute(convertedParams);
          };
        }
        return target[prop];
      }
    });
  }
  
  private convertLegacyParameters(params: any): any {
    // Auto-detect and convert legacy parameter formats
    const converted = { ...params };
    
    // Common parameter conversions
    if (params.sourceSlot && params.sourceLabware) {
      const resolverInput: BindingResolverInput = {
        type: 'legacy',
        source: {
          slot: params.sourceSlot,
          labware: params.sourceLabware,
          wells: params.sourceWells
        },
        destination: {
          slot: params.destSlot || params.destinationSlot,
          labware: params.destLabware || params.destinationLabware,
          wells: params.destWells || params.destinationWells
        }
      };
      
      const resolved = this.resolve(resolverInput);
      
      // Update parameters with resolved values
      converted.source = resolved.source;
      converted.destination = resolved.destination;
      
      // Keep legacy fields for backward compatibility
      converted._legacy = {
        sourceSlot: params.sourceSlot,
        sourceLabware: params.sourceLabware,
        destSlot: params.destSlot || params.destinationSlot,
        destLabware: params.destLabware || params.destinationLabware
      };
    }
    
    return converted;
  }
  
  // ============= Analytics =============
  
  getUsageStatistics(): {
    totalResolutions: number;
    byType: Record<string, number>;
    migrationReadiness: number;
  } {
    // This would be implemented with actual usage tracking
    return {
      totalResolutions: 0,
      byType: {
        legacy: 0,
        'role-based': 0,
        hybrid: 0
      },
      migrationReadiness: 0
    };
  }
}