// Capability Mapper - Maps role requirements to physical resources
import {
  RoleDefinition,
  Capability,
  CapabilityType,
  RuntimeContext,
  AvailablePipette,
  InstalledModule,
  PipetteAssignment,
  ModuleDefinition,
  LabwareDefinition,
  WellSelection
} from './types';
import { LabwareRegistry } from './LabwareRegistry';

interface CapabilityMatch {
  labwareId: string;
  moduleId?: string;
  pipetteMount?: 'left' | 'right';
  score: number;
  satisfiedCapabilities: CapabilityType[];
  missingCapabilities: CapabilityType[];
}

interface ResourceRequirement {
  labware: {
    required: boolean;
    options: string[];
    volume?: { min: number; max: number };
  };
  module: {
    required: boolean;
    type?: string;
    settings?: Record<string, any>;
  };
  pipette: {
    required: boolean;
    channels?: 1 | 8;
    volumeRange?: { min: number; max: number };
    mount?: 'left' | 'right';
  };
  wells: {
    count: number;
    pattern?: 'sequential' | 'alternating' | 'checkerboard';
    specific?: string[];
  };
}

export class CapabilityMapper {
  private registry: LabwareRegistry;
  private runtimeContext?: RuntimeContext;
  
  // Capability to resource type mapping
  private readonly CAPABILITY_REQUIREMENTS: Map<CapabilityType, string[]> = new Map([
    ['hold_liquid', ['labware']],
    ['hold_solid', ['labware']],
    ['temperature_control', ['module']],
    ['heating', ['module']],
    ['cooling', ['module']],
    ['shaking', ['module']],
    ['mixing', ['module', 'pipette']],
    ['magnetic', ['module']],
    ['multi_channel_accessible', ['labware', 'pipette']],
    ['single_channel_accessible', ['labware', 'pipette']],
    ['tip_rack', ['labware']],
    ['waste', ['labware']],
    ['reagent_reservoir', ['labware']],
    ['96_well_compatible', ['labware']],
    ['384_well_compatible', ['labware']],
    ['filter_tips', ['labware']],
    ['large_volume', ['labware']]
  ]);
  
  constructor(runtimeContext?: RuntimeContext) {
    this.registry = LabwareRegistry.getInstance();
    this.runtimeContext = runtimeContext;
  }
  
  // ============= Main Mapping Method =============
  
  mapRoleToResources(roleId: string, role: RoleDefinition): CapabilityMatch[] {
    const matches: CapabilityMatch[] = [];
    
    // Analyze role requirements
    const requirements = this.analyzeRequirements(role);
    
    // Find matching labware
    const labwareOptions = this.findMatchingLabware(role, requirements);
    
    // Find matching modules if needed
    const moduleOptions = requirements.module.required 
      ? this.findMatchingModules(role, requirements)
      : [undefined];
    
    // Find matching pipettes if needed
    const pipetteOptions = requirements.pipette.required
      ? this.findMatchingPipettes(role, requirements)
      : [undefined];
    
    // Generate all combinations and score them
    for (const labware of labwareOptions) {
      for (const module of moduleOptions) {
        for (const pipette of pipetteOptions) {
          const match = this.createMatch(role, labware, module, pipette);
          if (match.score > 0) {
            matches.push(match);
          }
        }
      }
    }
    
    // Sort by score
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
  }
  
  // ============= Requirement Analysis =============
  
  private analyzeRequirements(role: RoleDefinition): ResourceRequirement {
    const requirement: ResourceRequirement = {
      labware: {
        required: false,
        options: [],
        volume: role.volume
      },
      module: {
        required: false
      },
      pipette: {
        required: false
      },
      wells: {
        count: 1
      }
    };
    
    // Analyze each capability
    for (const capability of role.capabilities) {
      const resourceTypes = this.CAPABILITY_REQUIREMENTS.get(capability.type) || [];
      
      for (const resourceType of resourceTypes) {
        switch (resourceType) {
          case 'labware':
            requirement.labware.required = true;
            this.updateLabwareRequirement(requirement.labware, capability);
            break;
            
          case 'module':
            requirement.module.required = true;
            this.updateModuleRequirement(requirement.module, capability);
            break;
            
          case 'pipette':
            requirement.pipette.required = true;
            this.updatePipetteRequirement(requirement.pipette, capability);
            break;
        }
      }
    }
    
    // Apply constraints
    if (role.constraints) {
      if (role.constraints.temperature) {
        requirement.module.required = true;
        requirement.module.settings = {
          ...requirement.module.settings,
          temperature: role.constraints.temperature.min
        };
      }
      
      if (role.constraints.accessibleBy) {
        requirement.pipette.required = true;
        // Parse pipette requirements from constraints
        for (const pipetteSpec of role.constraints.accessibleBy) {
          if (pipetteSpec.includes('multi')) {
            requirement.pipette.channels = 8;
          } else if (pipetteSpec.includes('single')) {
            requirement.pipette.channels = 1;
          }
          
          if (pipetteSpec.includes('left')) {
            requirement.pipette.mount = 'left';
          } else if (pipetteSpec.includes('right')) {
            requirement.pipette.mount = 'right';
          }
        }
      }
    }
    
    // Apply preferred labware
    if (role.preferredLabware) {
      requirement.labware.options.push(...role.preferredLabware);
    }
    
    return requirement;
  }
  
  private updateLabwareRequirement(
    requirement: ResourceRequirement['labware'],
    capability: Capability
  ): void {
    switch (capability.type) {
      case '96_well_compatible':
        requirement.options.push(
          'corning_96_wellplate_360ul_flat',
          'biorad_96_wellplate_200ul_pcr'
        );
        break;
        
      case '384_well_compatible':
        requirement.options.push('corning_384_wellplate_112ul_flat');
        break;
        
      case 'tip_rack':
        requirement.options.push(
          'opentrons_96_tiprack_300ul',
          'opentrons_96_tiprack_1000ul',
          'opentrons_96_filtertiprack_200ul'
        );
        break;
        
      case 'filter_tips':
        requirement.options.push('opentrons_96_filtertiprack_200ul');
        break;
        
      case 'waste':
        requirement.options.push('nest_1_reservoir_195ml');
        break;
        
      case 'reagent_reservoir':
        requirement.options.push(
          'nest_12_reservoir_15ml',
          'nest_1_reservoir_195ml'
        );
        break;
        
      case 'large_volume':
        requirement.volume = { 
          min: capability.value?.min || 15000,
          max: capability.value?.max || 195000
        };
        break;
    }
  }
  
  private updateModuleRequirement(
    requirement: ResourceRequirement['module'],
    capability: Capability
  ): void {
    switch (capability.type) {
      case 'temperature_control':
        requirement.type = 'temperature_module_gen2';
        break;
        
      case 'heating':
        if (!requirement.type) {
          requirement.type = 'heater_shaker_module';
        }
        break;
        
      case 'cooling':
        if (!requirement.type) {
          requirement.type = 'temperature_module_gen2';
        }
        break;
        
      case 'shaking':
      case 'mixing':
        requirement.type = 'heater_shaker_module';
        if (capability.value?.speed) {
          requirement.settings = {
            ...requirement.settings,
            shakingSpeed: capability.value.speed
          };
        }
        break;
        
      case 'magnetic':
        requirement.type = 'magnetic_module_gen2';
        break;
    }
  }
  
  private updatePipetteRequirement(
    requirement: ResourceRequirement['pipette'],
    capability: Capability
  ): void {
    switch (capability.type) {
      case 'multi_channel_accessible':
        requirement.channels = 8;
        break;
        
      case 'single_channel_accessible':
        if (!requirement.channels) {
          requirement.channels = 1;
        }
        break;
        
      case 'mixing':
        // Mixing typically needs pipette access
        requirement.required = true;
        break;
    }
  }
  
  // ============= Resource Finding =============
  
  private findMatchingLabware(
    role: RoleDefinition,
    requirements: ResourceRequirement
  ): string[] {
    let labwareIds: string[] = [];
    
    // Start with explicitly required labware
    if (requirements.labware.options.length > 0) {
      labwareIds = requirements.labware.options;
    } else {
      // Find by capabilities
      const matchingLabware = this.registry.findLabwareByCapabilities(
        role.capabilities.map(c => ({ type: c.type, value: c.value }))
      );
      labwareIds = matchingLabware.map(l => l.id);
    }
    
    // Filter by volume if specified
    if (requirements.labware.volume) {
      const { min, max } = requirements.labware.volume;
      const volumeMatches = this.registry.findLabwareByVolume(min, max);
      const volumeIds = new Set(volumeMatches.map(l => l.id));
      
      labwareIds = labwareIds.filter(id => volumeIds.has(id));
    }
    
    // If no matches, get all labware as fallback
    if (labwareIds.length === 0 && requirements.labware.required) {
      labwareIds = this.registry.getAllLabware().map(l => l.id);
    }
    
    return labwareIds;
  }
  
  private findMatchingModules(
    role: RoleDefinition,
    requirements: ResourceRequirement
  ): (InstalledModule | undefined)[] {
    if (!this.runtimeContext?.installedModules) {
      return [undefined];
    }
    
    const modules: InstalledModule[] = [];
    
    for (const installedModule of this.runtimeContext.installedModules) {
      // Check if module type matches requirement
      if (requirements.module.type) {
        const moduleEntry = this.registry.getModule(installedModule.id);
        if (moduleEntry?.type !== requirements.module.type) {
          continue;
        }
      }
      
      // Check if module has required capabilities
      const hasRequiredCapabilities = role.capabilities
        .filter(c => ['temperature_control', 'heating', 'cooling', 'shaking', 'mixing', 'magnetic'].includes(c.type))
        .every(reqCap => 
          installedModule.capabilities.some(modCap => 
            modCap.type === reqCap.type
          )
        );
      
      if (hasRequiredCapabilities) {
        modules.push(installedModule);
      }
    }
    
    return modules.length > 0 ? modules : [undefined];
  }
  
  private findMatchingPipettes(
    role: RoleDefinition,
    requirements: ResourceRequirement
  ): (AvailablePipette | undefined)[] {
    if (!this.runtimeContext?.availablePipettes) {
      return [undefined];
    }
    
    const pipettes: AvailablePipette[] = [];
    
    for (const pipette of this.runtimeContext.availablePipettes) {
      // Check channel requirement
      if (requirements.pipette.channels && 
          pipette.channels !== requirements.pipette.channels) {
        continue;
      }
      
      // Check mount requirement
      if (requirements.pipette.mount && 
          pipette.mount !== requirements.pipette.mount) {
        continue;
      }
      
      // Check volume range
      if (requirements.pipette.volumeRange) {
        const { min, max } = requirements.pipette.volumeRange;
        if (pipette.minVolume > min || pipette.maxVolume < max) {
          continue;
        }
      }
      
      // Check if volume requirements from role are satisfied
      if (role.volume) {
        if (pipette.minVolume > role.volume.min || 
            pipette.maxVolume < role.volume.max) {
          continue;
        }
      }
      
      pipettes.push(pipette);
    }
    
    return pipettes.length > 0 ? pipettes : [undefined];
  }
  
  // ============= Match Creation and Scoring =============
  
  private createMatch(
    role: RoleDefinition,
    labwareId: string,
    module?: InstalledModule,
    pipette?: AvailablePipette
  ): CapabilityMatch {
    const match: CapabilityMatch = {
      labwareId,
      score: 0,
      satisfiedCapabilities: [],
      missingCapabilities: []
    };
    
    if (module) {
      match.moduleId = module.id;
    }
    
    if (pipette) {
      match.pipetteMount = pipette.mount;
    }
    
    // Check which capabilities are satisfied
    const labware = this.registry.getLabware(labwareId);
    if (!labware) {
      match.score = 0;
      match.missingCapabilities = role.capabilities.map(c => c.type);
      return match;
    }
    
    for (const capability of role.capabilities) {
      let satisfied = false;
      
      // Check labware capabilities
      if (labware.capabilities.some(c => c.type === capability.type)) {
        satisfied = true;
      }
      
      // Check module capabilities
      if (module && module.capabilities.some(c => c.type === capability.type)) {
        satisfied = true;
      }
      
      // Check pipette-related capabilities
      if (pipette) {
        if (capability.type === 'multi_channel_accessible' && pipette.channels === 8) {
          satisfied = true;
        }
        if (capability.type === 'single_channel_accessible' && pipette.channels === 1) {
          satisfied = true;
        }
        if (capability.type === 'mixing') {
          satisfied = true;
        }
      }
      
      if (satisfied) {
        match.satisfiedCapabilities.push(capability.type);
      } else {
        match.missingCapabilities.push(capability.type);
      }
    }
    
    // Calculate score
    match.score = this.calculateMatchScore(match, role, labware);
    
    return match;
  }
  
  private calculateMatchScore(
    match: CapabilityMatch,
    role: RoleDefinition,
    labware: any
  ): number {
    let score = 0;
    
    // Base score from satisfied capabilities
    const satisfactionRatio = match.satisfiedCapabilities.length / 
                             (match.satisfiedCapabilities.length + match.missingCapabilities.length);
    score = satisfactionRatio * 100;
    
    // Bonus for preferred labware
    if (role.preferredLabware?.includes(match.labwareId)) {
      score += 20;
    }
    
    // Penalty for missing critical capabilities
    const criticalCapabilities: CapabilityType[] = [
      'temperature_control',
      'magnetic',
      'tip_rack'
    ];
    
    for (const missing of match.missingCapabilities) {
      if (criticalCapabilities.includes(missing)) {
        score -= 30;
      } else {
        score -= 10;
      }
    }
    
    // Bonus for efficient resource usage
    if (labware.wellLayout) {
      const wellCount = labware.wellLayout.rows * labware.wellLayout.columns;
      if (wellCount === 96) {
        score += 5;  // Standard format bonus
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  // ============= Well Selection =============
  
  selectWells(
    labwareId: string,
    count: number,
    pattern: 'sequential' | 'alternating' | 'checkerboard' = 'sequential',
    usedWells: string[] = []
  ): WellSelection {
    const labware = this.registry.getLabware(labwareId);
    if (!labware?.wellLayout) {
      return { specific: [] };
    }
    
    const { rows, columns } = labware.wellLayout;
    const selection: WellSelection = {
      specific: []
    };
    
    const usedSet = new Set(usedWells);
    let selectedCount = 0;
    
    switch (pattern) {
      case 'sequential':
        for (let col = 1; col <= columns && selectedCount < count; col++) {
          for (let row = 0; row < rows && selectedCount < count; row++) {
            const well = `${String.fromCharCode(65 + row)}${col}`;
            if (!usedSet.has(well)) {
              selection.specific!.push(well);
              selectedCount++;
            }
          }
        }
        break;
        
      case 'alternating':
        for (let col = 1; col <= columns && selectedCount < count; col += 2) {
          for (let row = 0; row < rows && selectedCount < count; row++) {
            const well = `${String.fromCharCode(65 + row)}${col}`;
            if (!usedSet.has(well)) {
              selection.specific!.push(well);
              selectedCount++;
            }
          }
        }
        break;
        
      case 'checkerboard':
        for (let col = 1; col <= columns && selectedCount < count; col++) {
          for (let row = 0; row < rows && selectedCount < count; row++) {
            if ((row + col) % 2 === 0) {
              const well = `${String.fromCharCode(65 + row)}${col}`;
              if (!usedSet.has(well)) {
                selection.specific!.push(well);
                selectedCount++;
              }
            }
          }
        }
        break;
    }
    
    return selection;
  }
  
  // ============= Pipette Assignment =============
  
  assignPipette(
    volumeRange: { min: number; max: number },
    channels: 1 | 8 = 1,
    preferredMount?: 'left' | 'right'
  ): PipetteAssignment | null {
    if (!this.runtimeContext?.availablePipettes) {
      return null;
    }
    
    // Find best matching pipette
    let bestPipette: AvailablePipette | null = null;
    let bestScore = -1;
    
    for (const pipette of this.runtimeContext.availablePipettes) {
      if (pipette.channels !== channels) continue;
      
      // Check if pipette can handle the volume range
      if (pipette.minVolume > volumeRange.min || 
          pipette.maxVolume < volumeRange.max) {
        continue;
      }
      
      // Score the pipette
      let score = 0;
      
      // Prefer the requested mount
      if (preferredMount && pipette.mount === preferredMount) {
        score += 50;
      }
      
      // Prefer pipettes with tighter volume ranges
      const volumeRatio = (volumeRange.max - volumeRange.min) / 
                         (pipette.maxVolume - pipette.minVolume);
      score += volumeRatio * 30;
      
      // Prefer smaller pipettes for small volumes
      if (volumeRange.max <= 300 && pipette.maxVolume <= 300) {
        score += 20;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestPipette = pipette;
      }
    }
    
    if (!bestPipette) {
      return null;
    }
    
    // Find tip rack for this pipette
    let tipRackSlot: number | undefined;
    if (this.runtimeContext.existingLabware) {
      const tipRack = this.runtimeContext.existingLabware.find(l =>
        l.labwareType.includes('tiprack') && 
        l.labwareType.includes(bestPipette.maxVolume.toString())
      );
      
      if (tipRack) {
        tipRackSlot = tipRack.slot;
      }
    }
    
    return {
      mount: bestPipette.mount,
      type: bestPipette.type,
      tipRackSlot
    };
  }
}