// Validator - Comprehensive validation and conflict detection
import {
  BindingMap,
  RoleBinding,
  ValidationResult,
  ValidationType,
  DeckSpec,
  RuntimeContext,
  ConflictZone,
  CollisionRisk
} from './types';
import { LabwareRegistry } from './LabwareRegistry';

interface CollisionBox {
  slot: number;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  roleId?: string;
}

interface AccessibilityZone {
  slot: number;
  pipetteMount: 'left' | 'right';
  reachable: boolean;
  clearance: number;  // in mm
}

interface ValidationContext {
  deckSpec: DeckSpec;
  bindingMap: BindingMap;
  runtimeContext?: RuntimeContext;
}

export class DeckValidator {
  private registry: LabwareRegistry;
  
  // OT-2 deck dimensions and constraints
  private readonly DECK_SIZE = { x: 365, y: 273, z: 150 };  // in mm
  private readonly SLOT_SIZE = { x: 127.76, y: 85.48 };     // in mm
  
  // Slot positions (center points in mm)
  private readonly SLOT_POSITIONS: Map<number, { x: number; y: number; z: number }> = new Map([
    [1, { x: 13.3, y: 181.3, z: 0 }],
    [2, { x: 146.3, y: 181.3, z: 0 }],
    [3, { x: 279.3, y: 181.3, z: 0 }],
    [4, { x: 13.3, y: 90.3, z: 0 }],
    [5, { x: 146.3, y: 90.3, z: 0 }],
    [6, { x: 279.3, y: 90.3, z: 0 }],
    [7, { x: 13.3, y: -0.7, z: 0 }],
    [8, { x: 146.3, y: -0.7, z: 0 }],
    [9, { x: 279.3, y: -0.7, z: 0 }],
    [10, { x: 13.3, y: -91.7, z: 0 }],
    [11, { x: 146.3, y: -91.7, z: 0 }]
  ]);
  
  // Pipette reach zones (simplified)
  private readonly PIPETTE_REACH: Map<'left' | 'right', number[]> = new Map([
    ['left', [1, 2, 3, 4, 5, 6]],    // Left pipette can reach slots 1-6
    ['right', [5, 6, 7, 8, 9, 10, 11]] // Right pipette can reach slots 5-11
  ]);
  
  // Minimum clearances (in mm)
  private readonly MIN_CLEARANCES = {
    COLLISION: 5,        // Minimum distance between objects
    PIPETTE: 20,         // Minimum clearance for pipette access
    MODULE_HEIGHT: 150,  // Maximum height with modules
    COOLING_AIRFLOW: 30  // Space needed around temperature modules
  };
  
  constructor() {
    this.registry = LabwareRegistry.getInstance();
  }
  
  // ============= Main Validation Method =============
  
  validateBinding(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Run all validation checks
    results.push(...this.validateCollisions(context));
    results.push(...this.validateAccessibility(context));
    results.push(...this.validateVolumeCapacity(context));
    results.push(...this.validateTemperatureCompatibility(context));
    results.push(...this.validateContamination(context));
    results.push(...this.validateCapacityLimits(context));
    results.push(...this.validateCompatibility(context));
    
    // Set overall collision risk
    const errorCount = results.filter(r => r.severity === 'error').length;
    const warningCount = results.filter(r => r.severity === 'warning').length;
    
    context.bindingMap.executionPlan = context.bindingMap.executionPlan || {
      estimated_time: 0,
      tip_usage: {},
      movement_efficiency: 0,
      collision_risk: 'low',
      resource_utilization: { slot_usage: 0, module_usage: 0, pipette_usage: {} }
    };
    
    if (errorCount > 0) {
      context.bindingMap.executionPlan.collision_risk = 'high';
    } else if (warningCount > 2) {
      context.bindingMap.executionPlan.collision_risk = 'medium';
    } else {
      context.bindingMap.executionPlan.collision_risk = 'low';
    }
    
    return results;
  }
  
  // ============= Collision Detection =============
  
  private validateCollisions(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    const collisionBoxes: CollisionBox[] = [];
    
    // Create collision boxes for all bindings
    for (const [roleId, binding] of Object.entries(context.bindingMap.bindings)) {
      const box = this.createCollisionBox(binding, roleId);
      if (box) {
        collisionBoxes.push(box);
      }
    }
    
    // Check for overlaps
    for (let i = 0; i < collisionBoxes.length; i++) {
      for (let j = i + 1; j < collisionBoxes.length; j++) {
        const collision = this.checkBoxCollision(collisionBoxes[i], collisionBoxes[j]);
        if (collision) {
          results.push({
            type: 'collision',
            severity: 'error',
            message: `Physical collision detected between ${collisionBoxes[i].roleId} (slot ${collisionBoxes[i].slot}) and ${collisionBoxes[j].roleId} (slot ${collisionBoxes[j].slot})`,
            affectedRoles: [collisionBoxes[i].roleId!, collisionBoxes[j].roleId!],
            suggestedFix: 'Move one of the items to a different slot with adequate clearance'
          });
        } else {
          // Check for insufficient clearance
          const distance = this.calculateBoxDistance(collisionBoxes[i], collisionBoxes[j]);
          if (distance < this.MIN_CLEARANCES.COLLISION) {
            results.push({
              type: 'collision',
              severity: 'warning',
              message: `Insufficient clearance (${distance.toFixed(1)}mm) between ${collisionBoxes[i].roleId} and ${collisionBoxes[j].roleId}`,
              affectedRoles: [collisionBoxes[i].roleId!, collisionBoxes[j].roleId!],
              suggestedFix: `Ensure at least ${this.MIN_CLEARANCES.COLLISION}mm clearance between objects`
            });
          }
        }
      }
    }
    
    // Check height constraints
    for (const box of collisionBoxes) {
      if (box.z + box.depth > this.MIN_CLEARANCES.MODULE_HEIGHT) {
        results.push({
          type: 'collision',
          severity: 'error',
          message: `Total height (${box.z + box.depth}mm) exceeds maximum deck height (${this.MIN_CLEARANCES.MODULE_HEIGHT}mm) for ${box.roleId} in slot ${box.slot}`,
          affectedRoles: [box.roleId!],
          suggestedFix: 'Use a different labware or module combination with lower height'
        });
      }
    }
    
    return results;
  }
  
  private createCollisionBox(binding: RoleBinding, roleId: string): CollisionBox | null {
    const slotPos = this.SLOT_POSITIONS.get(binding.slot);
    if (!slotPos) return null;
    
    let totalHeight = binding.labware.dimensions.z;
    
    // Add module height if present
    if (binding.module) {
      const moduleEntry = this.registry.getModule(binding.module.id);
      if (moduleEntry) {
        totalHeight += moduleEntry.heightOffset;
      }
    }
    
    return {
      slot: binding.slot,
      x: slotPos.x - this.SLOT_SIZE.x / 2,
      y: slotPos.y - this.SLOT_SIZE.y / 2,
      z: slotPos.z,
      width: binding.labware.dimensions.x,
      height: binding.labware.dimensions.y,
      depth: totalHeight,
      roleId
    };
  }
  
  private checkBoxCollision(box1: CollisionBox, box2: CollisionBox): boolean {
    return !(
      box1.x + box1.width <= box2.x ||
      box2.x + box2.width <= box1.x ||
      box1.y + box1.height <= box2.y ||
      box2.y + box2.height <= box1.y ||
      box1.z + box1.depth <= box2.z ||
      box2.z + box2.depth <= box1.z
    );
  }
  
  private calculateBoxDistance(box1: CollisionBox, box2: CollisionBox): number {
    const dx = Math.max(0, Math.max(box1.x - (box2.x + box2.width), box2.x - (box1.x + box1.width)));
    const dy = Math.max(0, Math.max(box1.y - (box2.y + box2.height), box2.y - (box1.y + box1.height)));
    const dz = Math.max(0, Math.max(box1.z - (box2.z + box2.depth), box2.z - (box1.z + box1.depth)));
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  // ============= Accessibility Validation =============
  
  private validateAccessibility(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const [roleId, binding] of Object.entries(context.bindingMap.bindings)) {
      // Check pipette accessibility
      if (binding.pipette) {
        const reachableSlots = this.PIPETTE_REACH.get(binding.pipette.mount);
        if (reachableSlots && !reachableSlots.includes(binding.slot)) {
          results.push({
            type: 'accessibility',
            severity: 'error',
            message: `${binding.pipette.mount} pipette cannot reach slot ${binding.slot} for ${roleId}`,
            affectedRoles: [roleId],
            suggestedFix: `Move to a slot accessible by ${binding.pipette.mount} pipette: ${reachableSlots.join(', ')}`
          });
        }
      }
      
      // Check for obstructions to pipette access
      const obstructions = this.findAccessObstructions(binding, context.bindingMap);
      if (obstructions.length > 0) {
        results.push({
          type: 'accessibility',
          severity: 'warning',
          message: `Potential access obstruction for ${roleId} in slot ${binding.slot}. Nearby items may interfere with pipette movement`,
          affectedRoles: [roleId, ...obstructions],
          suggestedFix: 'Consider relocating nearby tall objects or modules'
        });
      }
      
      // Check clearance for lid access (for modules)
      if (binding.module) {
        const lidClearance = this.checkLidClearance(binding, context.bindingMap);
        if (!lidClearance.sufficient) {
          results.push({
            type: 'accessibility',
            severity: 'warning',
            message: `Insufficient clearance for lid access on ${roleId}. Need ${lidClearance.required}mm, have ${lidClearance.available}mm`,
            affectedRoles: [roleId],
            suggestedFix: 'Ensure adequate clearance above modules for lid operation'
          });
        }
      }
    }
    
    return results;
  }
  
  private findAccessObstructions(
    binding: RoleBinding,
    bindingMap: BindingMap
  ): string[] {
    const obstructions: string[] = [];
    const slotPos = this.SLOT_POSITIONS.get(binding.slot);
    if (!slotPos) return obstructions;
    
    // Check adjacent slots for tall objects
    const adjacentSlots = this.getAdjacentSlots(binding.slot);
    
    for (const [roleId, otherBinding] of Object.entries(bindingMap.bindings)) {
      if (roleId === Object.keys(bindingMap.bindings).find(k => bindingMap.bindings[k] === binding)) {
        continue; // Skip self
      }
      
      if (adjacentSlots.includes(otherBinding.slot)) {
        let totalHeight = otherBinding.labware.dimensions.z;
        
        if (otherBinding.module) {
          const moduleEntry = this.registry.getModule(otherBinding.module.id);
          if (moduleEntry) {
            totalHeight += moduleEntry.heightOffset;
          }
        }
        
        // If adjacent object is tall, it might obstruct access
        if (totalHeight > 50) {  // 50mm threshold
          obstructions.push(roleId);
        }
      }
    }
    
    return obstructions;
  }
  
  private getAdjacentSlots(slot: number): number[] {
    const adjacency: Map<number, number[]> = new Map([
      [1, [2, 4]],
      [2, [1, 3, 5]],
      [3, [2, 6]],
      [4, [1, 5, 7]],
      [5, [2, 4, 6, 8]],
      [6, [3, 5, 9]],
      [7, [4, 8, 10]],
      [8, [5, 7, 9, 11]],
      [9, [6, 8]],
      [10, [7, 11]],
      [11, [8, 10]]
    ]);
    
    return adjacency.get(slot) || [];
  }
  
  private checkLidClearance(
    binding: RoleBinding,
    bindingMap: BindingMap
  ): { sufficient: boolean; required: number; available: number } {
    const requiredClearance = 100; // mm
    let availableClearance = this.MIN_CLEARANCES.MODULE_HEIGHT;
    
    // Calculate current height
    let currentHeight = binding.labware.dimensions.z;
    if (binding.module) {
      const moduleEntry = this.registry.getModule(binding.module.id);
      if (moduleEntry) {
        currentHeight += moduleEntry.heightOffset;
      }
    }
    
    availableClearance -= currentHeight;
    
    return {
      sufficient: availableClearance >= requiredClearance,
      required: requiredClearance,
      available: availableClearance
    };
  }
  
  // ============= Volume Capacity Validation =============
  
  private validateVolumeCapacity(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const [roleId, role] of Object.entries(context.deckSpec.roles)) {
      const binding = context.bindingMap.bindings[roleId];
      if (!binding) continue;
      
      const labware = this.registry.getLabware(binding.labware.id);
      if (!labware?.wellLayout) continue;
      
      if (role.volume) {
        const totalCapacity = labware.wellLayout.wellVolume * 
                            labware.wellLayout.rows * 
                            labware.wellLayout.columns;
        
        if (totalCapacity < role.volume.min) {
          results.push({
            type: 'volume',
            severity: 'error',
            message: `Insufficient volume capacity for ${roleId}. Need ${role.volume.min}µL, labware provides ${totalCapacity}µL`,
            affectedRoles: [roleId],
            suggestedFix: 'Select a labware with higher volume capacity'
          });
        }
        
        if (labware.wellLayout.wellVolume > role.volume.max) {
          results.push({
            type: 'volume',
            severity: 'warning',
            message: `Well volume (${labware.wellLayout.wellVolume}µL) exceeds maximum requirement (${role.volume.max}µL) for ${roleId}`,
            affectedRoles: [roleId],
            suggestedFix: 'Consider using a labware with smaller well volume to minimize waste'
          });
        }
      }
    }
    
    return results;
  }
  
  // ============= Temperature Compatibility Validation =============
  
  private validateTemperatureCompatibility(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const [roleId, role] of Object.entries(context.deckSpec.roles)) {
      const binding = context.bindingMap.bindings[roleId];
      if (!binding) continue;
      
      // Check if temperature control is needed
      const needsTemperature = role.capabilities.some(c => 
        ['temperature_control', 'heating', 'cooling'].includes(c.type)
      );
      
      const hasTemperatureConstraints = role.constraints?.temperature;
      
      if ((needsTemperature || hasTemperatureConstraints) && !binding.module) {
        results.push({
          type: 'temperature',
          severity: 'error',
          message: `Temperature control required for ${roleId} but no temperature module assigned`,
          affectedRoles: [roleId],
          suggestedFix: 'Assign a temperature module or move to a slot with a temperature module'
        });
      }
      
      if (hasTemperatureConstraints && binding.module) {
        const moduleEntry = this.registry.getModule(binding.module.id);
        if (moduleEntry?.specifications.temperatureRange) {
          const { min, max } = hasTemperatureConstraints;
          const moduleRange = moduleEntry.specifications.temperatureRange;
          
          if (min < moduleRange.min || max > moduleRange.max) {
            results.push({
              type: 'temperature',
              severity: 'error',
              message: `Temperature range (${min}-${max}°C) for ${roleId} exceeds module capability (${moduleRange.min}-${moduleRange.max}°C)`,
              affectedRoles: [roleId],
              suggestedFix: 'Use a different temperature module or adjust temperature requirements'
            });
          }
        }
      }
      
      // Check for temperature interference between modules
      if (binding.module?.type.includes('temperature')) {
        const nearby = this.findNearbyTemperatureModules(binding, context.bindingMap);
        if (nearby.length > 0) {
          results.push({
            type: 'temperature',
            severity: 'warning',
            message: `Temperature module for ${roleId} may be affected by nearby temperature modules`,
            affectedRoles: [roleId, ...nearby],
            suggestedFix: `Ensure ${this.MIN_CLEARANCES.COOLING_AIRFLOW}mm clearance around temperature modules`
          });
        }
      }
    }
    
    return results;
  }
  
  private findNearbyTemperatureModules(
    binding: RoleBinding,
    bindingMap: BindingMap
  ): string[] {
    const nearby: string[] = [];
    const adjacentSlots = this.getAdjacentSlots(binding.slot);
    
    for (const [roleId, otherBinding] of Object.entries(bindingMap.bindings)) {
      if (otherBinding === binding) continue;
      
      if (adjacentSlots.includes(otherBinding.slot) && 
          otherBinding.module?.type.includes('temperature')) {
        nearby.push(roleId);
      }
    }
    
    return nearby;
  }
  
  // ============= Contamination Risk Validation =============
  
  private validateContamination(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Find waste and sample locations
    const wasteRoles: string[] = [];
    const sampleRoles: string[] = [];
    
    for (const [roleId, role] of Object.entries(context.deckSpec.roles)) {
      if (role.capabilities.some(c => c.type === 'waste')) {
        wasteRoles.push(roleId);
      } else if (role.description.toLowerCase().includes('sample')) {
        sampleRoles.push(roleId);
      }
    }
    
    // Check for adequate separation
    for (const wasteRole of wasteRoles) {
      const wasteBinding = context.bindingMap.bindings[wasteRole];
      if (!wasteBinding) continue;
      
      for (const sampleRole of sampleRoles) {
        const sampleBinding = context.bindingMap.bindings[sampleRole];
        if (!sampleBinding) continue;
        
        const distance = this.calculateSlotDistance(wasteBinding.slot, sampleBinding.slot);
        if (distance < 200) {  // 200mm minimum separation
          results.push({
            type: 'contamination',
            severity: 'warning',
            message: `Waste container (${wasteRole}) is too close to samples (${sampleRole}). Distance: ${distance.toFixed(1)}mm`,
            affectedRoles: [wasteRole, sampleRole],
            suggestedFix: 'Increase separation between waste and sample containers to reduce contamination risk'
          });
        }
      }
    }
    
    return results;
  }
  
  private calculateSlotDistance(slot1: number, slot2: number): number {
    const pos1 = this.SLOT_POSITIONS.get(slot1);
    const pos2 = this.SLOT_POSITIONS.get(slot2);
    
    if (!pos1 || !pos2) return 0;
    
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // ============= Capacity Limits Validation =============
  
  private validateCapacityLimits(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Check deck slot utilization
    const usedSlots = Object.values(context.bindingMap.bindings).length;
    const totalSlots = 11;
    const utilizationPercentage = (usedSlots / totalSlots) * 100;
    
    if (utilizationPercentage > 90) {
      results.push({
        type: 'capacity',
        severity: 'warning',
        message: `High deck utilization (${utilizationPercentage.toFixed(1)}%). May limit workflow flexibility`,
        suggestedFix: 'Consider consolidating roles or using multi-purpose labware'
      });
    }
    
    // Check tip rack capacity
    let tipRacksNeeded = 0;
    let tipRacksAvailable = 0;
    
    for (const [roleId, binding] of Object.entries(context.bindingMap.bindings)) {
      if (binding.pipette) {
        tipRacksNeeded++;
      }
      
      const labware = this.registry.getLabware(binding.labware.id);
      if (labware?.capabilities.some(c => c.type === 'tip_rack')) {
        tipRacksAvailable++;
      }
    }
    
    if (tipRacksNeeded > tipRacksAvailable) {
      results.push({
        type: 'capacity',
        severity: 'error',
        message: `Insufficient tip racks. Need ${tipRacksNeeded}, have ${tipRacksAvailable}`,
        suggestedFix: 'Add more tip rack roles or use multi-channel pipettes to reduce tip usage'
      });
    }
    
    return results;
  }
  
  // ============= Compatibility Validation =============
  
  private validateCompatibility(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const [roleId, binding] of Object.entries(context.bindingMap.bindings)) {
      // Check labware-module compatibility
      if (binding.module) {
        const labware = this.registry.getLabware(binding.labware.id);
        if (labware && !this.registry.isLabwareModuleCompatible(
          binding.labware.id, 
          binding.module.type
        )) {
          results.push({
            type: 'compatibility',
            severity: 'error',
            message: `Labware ${binding.labware.displayName} is not compatible with ${binding.module.type} for ${roleId}`,
            affectedRoles: [roleId],
            suggestedFix: 'Select a different labware that is compatible with the required module'
          });
        }
      }
      
      // Check pipette-labware compatibility
      if (binding.pipette) {
        const reachabilityIssues = this.checkPipetteReachability(binding);
        if (reachabilityIssues.length > 0) {
          results.push({
            type: 'compatibility',
            severity: 'warning',
            message: `Pipette reachability issues for ${roleId}: ${reachabilityIssues.join(', ')}`,
            affectedRoles: [roleId],
            suggestedFix: 'Verify pipette can access all required wells'
          });
        }
      }
    }
    
    return results;
  }
  
  private checkPipetteReachability(binding: RoleBinding): string[] {
    const issues: string[] = [];
    
    // Check if pipette type matches labware requirements
    if (binding.pipette && binding.wells?.specific) {
      const labware = this.registry.getLabware(binding.labware.id);
      if (labware?.wellLayout) {
        const { rows, columns } = labware.wellLayout;
        
        // Check if multi-channel can access selected wells
        if (binding.pipette.type.includes('multi') && binding.pipette.type.includes('8')) {
          for (const well of binding.wells.specific) {
            const row = well.charCodeAt(0) - 65;  // Convert A-H to 0-7
            if (row >= 8) {
              issues.push('8-channel pipette cannot access wells beyond row H');
              break;
            }
          }
        }
        
        // Check maximum reach
        const maxColumn = Math.max(...binding.wells.specific.map(w => 
          parseInt(w.substring(1))
        ));
        
        if (maxColumn > columns) {
          issues.push(`Selected wells exceed labware column count (${columns})`);
        }
      }
    }
    
    return issues;
  }
  
  // ============= Utility Methods =============
  
  generateConflictZones(context: ValidationContext): ConflictZone[] {
    const zones: ConflictZone[] = [];
    const validationResults = this.validateBinding(context);
    
    // Group validation results by affected slots
    const slotIssues = new Map<number, ValidationResult[]>();
    
    for (const result of validationResults) {
      if (result.affectedRoles) {
        for (const roleId of result.affectedRoles) {
          const binding = context.bindingMap.bindings[roleId];
          if (binding) {
            if (!slotIssues.has(binding.slot)) {
              slotIssues.set(binding.slot, []);
            }
            slotIssues.get(binding.slot)!.push(result);
          }
        }
      }
    }
    
    // Create conflict zones
    for (const [slot, issues] of slotIssues) {
      const severity = issues.some(i => i.severity === 'error') ? 'error' : 'warning';
      const types = Array.from(new Set(issues.map(i => i.type)));
      
      zones.push({
        slots: [slot],
        type: types[0] as any, // Simplified - take first type
        severity,
        description: `${types.length} issue(s): ${types.join(', ')}`
      });
    }
    
    return zones;
  }
  
  calculateOverallRisk(validationResults: ValidationResult[]): CollisionRisk {
    const errorCount = validationResults.filter(r => r.severity === 'error').length;
    const warningCount = validationResults.filter(r => r.severity === 'warning').length;
    
    if (errorCount > 0) return 'high';
    if (warningCount > 2) return 'medium';
    return 'low';
  }
}