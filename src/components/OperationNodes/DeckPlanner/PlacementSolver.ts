// Placement Solver - Intelligent slot allocation with constraint solving
import {
  DeckSpec,
  RoleDefinition,
  RuntimeContext,
  RoleBinding,
  SolverStrategy,
  OptimizationConfig,
  InstalledModule,
  LabwareDefinition
} from './types';
import { LabwareRegistry } from './LabwareRegistry';

interface PlacementConstraint {
  type: 'adjacent' | 'isolated' | 'fixed' | 'distance' | 'accessibility';
  roleId: string;
  value: any;
  priority: number;  // 0-1, higher is more important
}

interface PlacementCandidate {
  roleId: string;
  slot: number;
  labwareId: string;
  moduleId?: string;
  score: number;
  violations: string[];
}

interface SlotInfo {
  slot: number;
  occupied: boolean;
  module?: InstalledModule;
  labware?: LabwareDefinition;
  assignedRole?: string;
  accessibility: {
    left: boolean;
    right: boolean;
    multi: boolean;
  };
}

export class PlacementSolver {
  private registry: LabwareRegistry;
  private deckLayout: SlotInfo[] = [];
  private constraints: PlacementConstraint[] = [];
  private strategy: SolverStrategy = 'greedy';
  
  // OT-2 deck layout (11 slots)
  private readonly DECK_SLOTS = 11;
  private readonly SLOT_ADJACENCY: Map<number, number[]> = new Map([
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
  
  // Slot positions for distance calculations (in mm)
  private readonly SLOT_POSITIONS: Map<number, { x: number; y: number }> = new Map([
    [1, { x: 13.3, y: 181.3 }],
    [2, { x: 146.3, y: 181.3 }],
    [3, { x: 279.3, y: 181.3 }],
    [4, { x: 13.3, y: 90.3 }],
    [5, { x: 146.3, y: 90.3 }],
    [6, { x: 279.3, y: 90.3 }],
    [7, { x: 13.3, y: -0.7 }],
    [8, { x: 146.3, y: -0.7 }],
    [9, { x: 279.3, y: -0.7 }],
    [10, { x: 13.3, y: -91.7 }],
    [11, { x: 146.3, y: -91.7 }]
  ]);
  
  constructor(strategy: SolverStrategy = 'greedy') {
    this.registry = LabwareRegistry.getInstance();
    this.strategy = strategy;
    this.initializeDeck();
  }
  
  // ============= Main Solving Method =============
  
  async solve(
    deckSpec: DeckSpec,
    runtimeContext?: RuntimeContext
  ): Promise<Map<string, PlacementCandidate>> {
    // Reset state
    this.initializeDeck(runtimeContext);
    this.extractConstraints(deckSpec);
    
    // Select solving strategy
    switch (this.strategy) {
      case 'greedy':
        return this.solveGreedy(deckSpec);
      case 'simulated_annealing':
        return this.solveSimulatedAnnealing(deckSpec);
      case 'ilp':
        return this.solveILP(deckSpec);
      case 'genetic_algorithm':
        return this.solveGenetic(deckSpec);
      default:
        return this.solveGreedy(deckSpec);
    }
  }
  
  // ============= Greedy Solver (Fast, Good Enough) =============
  
  private async solveGreedy(deckSpec: DeckSpec): Promise<Map<string, PlacementCandidate>> {
    const placements = new Map<string, PlacementCandidate>();
    const roles = Object.entries(deckSpec.roles);
    
    // Sort roles by constraint priority
    roles.sort((a, b) => {
      const priorityA = this.getConstraintPriority(a[0]);
      const priorityB = this.getConstraintPriority(b[0]);
      return priorityB - priorityA;
    });
    
    // Place each role
    for (const [roleId, role] of roles) {
      const candidate = this.findBestPlacement(roleId, role, placements);
      if (candidate) {
        placements.set(roleId, candidate);
        this.assignSlot(candidate);
      }
    }
    
    return placements;
  }
  
  // ============= Simulated Annealing (Better Quality) =============
  
  private async solveSimulatedAnnealing(deckSpec: DeckSpec): Promise<Map<string, PlacementCandidate>> {
    // Start with greedy solution
    let currentSolution = await this.solveGreedy(deckSpec);
    let currentScore = this.evaluateSolution(currentSolution, deckSpec);
    let bestSolution = new Map(currentSolution);
    let bestScore = currentScore;
    
    // Annealing parameters
    let temperature = 100;
    const coolingRate = 0.995;
    const minTemperature = 0.1;
    const maxIterations = 1000;
    
    for (let i = 0; i < maxIterations && temperature > minTemperature; i++) {
      // Generate neighbor solution
      const neighbor = this.generateNeighbor(currentSolution, deckSpec);
      const neighborScore = this.evaluateSolution(neighbor, deckSpec);
      
      // Accept or reject
      const delta = neighborScore - currentScore;
      if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
        currentSolution = neighbor;
        currentScore = neighborScore;
        
        if (currentScore > bestScore) {
          bestSolution = new Map(currentSolution);
          bestScore = currentScore;
        }
      }
      
      temperature *= coolingRate;
    }
    
    return bestSolution;
  }
  
  // ============= ILP Solver (Optimal for Small Problems) =============
  
  private async solveILP(deckSpec: DeckSpec): Promise<Map<string, PlacementCandidate>> {
    // For demonstration, falling back to greedy
    // In production, would use OR-Tools or similar
    console.warn('ILP solver not implemented, using greedy instead');
    return this.solveGreedy(deckSpec);
  }
  
  // ============= Genetic Algorithm (Good for Complex Problems) =============
  
  private async solveGenetic(deckSpec: DeckSpec): Promise<Map<string, PlacementCandidate>> {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    const eliteSize = 5;
    
    // Initialize population
    let population: Map<string, PlacementCandidate>[] = [];
    for (let i = 0; i < populationSize; i++) {
      this.initializeDeck();
      const individual = await this.solveGreedy(deckSpec);
      population.push(individual);
    }
    
    // Evolve
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = population.map(ind => ({
        solution: ind,
        score: this.evaluateSolution(ind, deckSpec)
      }));
      fitness.sort((a, b) => b.score - a.score);
      
      // New generation
      const newPopulation: Map<string, PlacementCandidate>[] = [];
      
      // Keep elite
      for (let i = 0; i < eliteSize; i++) {
        newPopulation.push(new Map(fitness[i].solution));
      }
      
      // Crossover and mutation
      while (newPopulation.length < populationSize) {
        const parent1 = this.selectParent(fitness);
        const parent2 = this.selectParent(fitness);
        let child = this.crossover(parent1, parent2, deckSpec);
        
        if (Math.random() < mutationRate) {
          child = this.mutate(child, deckSpec);
        }
        
        newPopulation.push(child);
      }
      
      population = newPopulation;
    }
    
    // Return best solution
    const finalFitness = population.map(ind => ({
      solution: ind,
      score: this.evaluateSolution(ind, deckSpec)
    }));
    finalFitness.sort((a, b) => b.score - a.score);
    
    return finalFitness[0].solution;
  }
  
  // ============= Helper Methods =============
  
  private initializeDeck(runtimeContext?: RuntimeContext): void {
    this.deckLayout = [];
    
    for (let slot = 1; slot <= this.DECK_SLOTS; slot++) {
      const slotInfo: SlotInfo = {
        slot,
        occupied: false,
        accessibility: {
          left: slot <= 6,  // Left pipette can reach slots 1-6
          right: slot >= 5,  // Right pipette can reach slots 5-11
          multi: true  // Multi-channel can reach all slots
        }
      };
      
      // Apply runtime context
      if (runtimeContext) {
        if (runtimeContext.occupiedSlots?.includes(slot)) {
          slotInfo.occupied = true;
        }
        
        const module = runtimeContext.installedModules?.find(m => m.slot === slot);
        if (module) {
          slotInfo.module = module;
        }
        
        const labware = runtimeContext.existingLabware?.find(l => l.slot === slot);
        if (labware) {
          slotInfo.labware = {
            id: labware.labwareId,
            type: labware.labwareType,
            displayName: labware.labwareType,
            dimensions: { x: 127.76, y: 85.48, z: 14.22 }  // Default dimensions
          };
        }
      }
      
      this.deckLayout.push(slotInfo);
    }
  }
  
  private extractConstraints(deckSpec: DeckSpec): void {
    this.constraints = [];
    
    Object.entries(deckSpec.roles).forEach(([roleId, role]) => {
      if (role.constraints) {
        // Fixed slot constraint
        if (role.constraints.fixedSlot !== undefined) {
          this.constraints.push({
            type: 'fixed',
            roleId,
            value: role.constraints.fixedSlot,
            priority: 1.0
          });
        }
        
        // Adjacent constraints
        if (role.constraints.adjacent) {
          role.constraints.adjacent.forEach(adjacentRole => {
            this.constraints.push({
              type: 'adjacent',
              roleId,
              value: adjacentRole,
              priority: 0.8
            });
          });
        }
        
        // Isolation constraint
        if (role.constraints.isolated) {
          this.constraints.push({
            type: 'isolated',
            roleId,
            value: true,
            priority: 0.7
          });
        }
        
        // Distance constraint
        if (role.constraints.maxDistance !== undefined) {
          this.constraints.push({
            type: 'distance',
            roleId,
            value: role.constraints.maxDistance,
            priority: 0.6
          });
        }
        
        // Accessibility constraint
        if (role.constraints.accessibleBy) {
          this.constraints.push({
            type: 'accessibility',
            roleId,
            value: role.constraints.accessibleBy,
            priority: 0.9
          });
        }
      }
    });
  }
  
  private findBestPlacement(
    roleId: string,
    role: RoleDefinition,
    existingPlacements: Map<string, PlacementCandidate>
  ): PlacementCandidate | null {
    const candidates: PlacementCandidate[] = [];
    
    // Find suitable labware
    const suitableLabware = this.registry.findLabwareByCapabilities(
      role.capabilities.map(c => ({ type: c.type, value: c.value }))
    );
    
    if (suitableLabware.length === 0) {
      console.warn(`No suitable labware found for role ${roleId}`);
      return null;
    }
    
    // Try each available slot
    for (const slotInfo of this.deckLayout) {
      if (slotInfo.occupied) continue;
      
      // Try each suitable labware
      for (const labware of suitableLabware) {
        const candidate: PlacementCandidate = {
          roleId,
          slot: slotInfo.slot,
          labwareId: labware.id,
          score: 0,
          violations: []
        };
        
        // Check if module is needed
        if (role.capabilities.some(c => 
          ['temperature_control', 'heating', 'cooling', 'shaking', 'magnetic'].includes(c.type)
        )) {
          if (slotInfo.module) {
            candidate.moduleId = slotInfo.module.id;
          } else {
            candidate.violations.push('Module required but not available');
          }
        }
        
        // Evaluate candidate
        candidate.score = this.evaluateCandidate(candidate, role, existingPlacements);
        candidates.push(candidate);
      }
    }
    
    // Return best candidate
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0] || null;
  }
  
  private evaluateCandidate(
    candidate: PlacementCandidate,
    role: RoleDefinition,
    existingPlacements: Map<string, PlacementCandidate>
  ): number {
    let score = 100;  // Start with perfect score
    
    // Check constraints
    for (const constraint of this.constraints) {
      if (constraint.roleId !== candidate.roleId) continue;
      
      switch (constraint.type) {
        case 'fixed':
          if (candidate.slot !== constraint.value) {
            score -= 50 * constraint.priority;
            candidate.violations.push(`Must be in slot ${constraint.value}`);
          }
          break;
          
        case 'adjacent':
          const adjacentPlacement = Array.from(existingPlacements.values())
            .find(p => p.roleId === constraint.value);
          if (adjacentPlacement) {
            const adjacent = this.SLOT_ADJACENCY.get(candidate.slot) || [];
            if (!adjacent.includes(adjacentPlacement.slot)) {
              score -= 30 * constraint.priority;
              candidate.violations.push(`Should be adjacent to ${constraint.value}`);
            }
          }
          break;
          
        case 'isolated':
          const neighbors = this.SLOT_ADJACENCY.get(candidate.slot) || [];
          const hasNeighbor = neighbors.some(slot => 
            this.deckLayout[slot - 1].occupied
          );
          if (hasNeighbor) {
            score -= 20 * constraint.priority;
            candidate.violations.push('Should be isolated');
          }
          break;
          
        case 'distance':
          // Check distance to other placements
          for (const placement of existingPlacements.values()) {
            const distance = this.calculateDistance(candidate.slot, placement.slot);
            if (distance > constraint.value) {
              score -= 25 * constraint.priority;
              candidate.violations.push(`Too far from ${placement.roleId}`);
            }
          }
          break;
          
        case 'accessibility':
          const slotInfo = this.deckLayout[candidate.slot - 1];
          for (const pipette of constraint.value) {
            if (pipette.includes('left') && !slotInfo.accessibility.left) {
              score -= 40 * constraint.priority;
              candidate.violations.push('Not accessible by left pipette');
            }
            if (pipette.includes('right') && !slotInfo.accessibility.right) {
              score -= 40 * constraint.priority;
              candidate.violations.push('Not accessible by right pipette');
            }
          }
          break;
      }
    }
    
    // Bonus for preferred labware
    if (role.preferredLabware?.includes(candidate.labwareId)) {
      score += 10;
    }
    
    // Penalty for violations
    score -= candidate.violations.length * 5;
    
    return Math.max(0, score);
  }
  
  private assignSlot(candidate: PlacementCandidate): void {
    const slotInfo = this.deckLayout[candidate.slot - 1];
    slotInfo.occupied = true;
    slotInfo.assignedRole = candidate.roleId;
    slotInfo.labware = {
      id: candidate.labwareId,
      type: candidate.labwareId,
      displayName: candidate.labwareId,
      dimensions: { x: 127.76, y: 85.48, z: 14.22 }
    };
  }
  
  private calculateDistance(slot1: number, slot2: number): number {
    const pos1 = this.SLOT_POSITIONS.get(slot1);
    const pos2 = this.SLOT_POSITIONS.get(slot2);
    
    if (!pos1 || !pos2) return Infinity;
    
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  private getConstraintPriority(roleId: string): number {
    return this.constraints
      .filter(c => c.roleId === roleId)
      .reduce((sum, c) => sum + c.priority, 0);
  }
  
  private evaluateSolution(
    solution: Map<string, PlacementCandidate>,
    deckSpec: DeckSpec
  ): number {
    let totalScore = 0;
    
    for (const [roleId, candidate] of solution) {
      const role = deckSpec.roles[roleId];
      if (role) {
        totalScore += this.evaluateCandidate(candidate, role, solution);
      }
    }
    
    // Add optimization objectives
    if (deckSpec.optimization) {
      const weights = deckSpec.optimization.weights || {
        movement_distance: 0.2,
        tip_usage: 0.2,
        time: 0.2,
        contamination_risk: 0.2,
        resource_utilization: 0.2
      };
      
      // Calculate movement efficiency
      const movementScore = this.calculateMovementEfficiency(solution) * weights.movement_distance;
      
      // Calculate resource utilization
      const utilizationScore = (solution.size / this.DECK_SLOTS) * weights.resource_utilization;
      
      totalScore += (movementScore + utilizationScore) * 100;
    }
    
    return totalScore;
  }
  
  private calculateMovementEfficiency(solution: Map<string, PlacementCandidate>): number {
    let totalDistance = 0;
    let pathCount = 0;
    
    const placements = Array.from(solution.values());
    for (let i = 0; i < placements.length - 1; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        totalDistance += this.calculateDistance(placements[i].slot, placements[j].slot);
        pathCount++;
      }
    }
    
    if (pathCount === 0) return 1;
    
    // Normalize (max distance is ~300mm diagonal)
    const avgDistance = totalDistance / pathCount;
    return 1 - (avgDistance / 300);
  }
  
  private generateNeighbor(
    current: Map<string, PlacementCandidate>,
    deckSpec: DeckSpec
  ): Map<string, PlacementCandidate> {
    const neighbor = new Map(current);
    const roles = Array.from(neighbor.keys());
    
    if (roles.length < 2) return neighbor;
    
    // Swap two random roles
    const role1 = roles[Math.floor(Math.random() * roles.length)];
    const role2 = roles[Math.floor(Math.random() * roles.length)];
    
    if (role1 !== role2) {
      const placement1 = neighbor.get(role1)!;
      const placement2 = neighbor.get(role2)!;
      
      // Swap slots
      const tempSlot = placement1.slot;
      placement1.slot = placement2.slot;
      placement2.slot = tempSlot;
      
      // Re-evaluate scores
      placement1.score = this.evaluateCandidate(
        placement1,
        deckSpec.roles[role1],
        neighbor
      );
      placement2.score = this.evaluateCandidate(
        placement2,
        deckSpec.roles[role2],
        neighbor
      );
    }
    
    return neighbor;
  }
  
  private selectParent(
    fitness: Array<{ solution: Map<string, PlacementCandidate>; score: number }>
  ): Map<string, PlacementCandidate> {
    // Tournament selection
    const tournamentSize = 3;
    let best = fitness[Math.floor(Math.random() * fitness.length)];
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = fitness[Math.floor(Math.random() * fitness.length)];
      if (candidate.score > best.score) {
        best = candidate;
      }
    }
    
    return best.solution;
  }
  
  private crossover(
    parent1: Map<string, PlacementCandidate>,
    parent2: Map<string, PlacementCandidate>,
    deckSpec: DeckSpec
  ): Map<string, PlacementCandidate> {
    const child = new Map<string, PlacementCandidate>();
    const roles = Object.keys(deckSpec.roles);
    
    // Uniform crossover
    for (const role of roles) {
      const placement = Math.random() < 0.5 
        ? parent1.get(role) 
        : parent2.get(role);
      
      if (placement) {
        child.set(role, { ...placement });
      }
    }
    
    return child;
  }
  
  private mutate(
    solution: Map<string, PlacementCandidate>,
    deckSpec: DeckSpec
  ): Map<string, PlacementCandidate> {
    const mutated = new Map(solution);
    const roles = Array.from(mutated.keys());
    
    if (roles.length === 0) return mutated;
    
    // Mutate one random role
    const roleToMutate = roles[Math.floor(Math.random() * roles.length)];
    const placement = mutated.get(roleToMutate)!;
    
    // Find alternative slot
    const availableSlots = this.deckLayout
      .filter(slot => !slot.occupied || slot.assignedRole === roleToMutate)
      .map(slot => slot.slot);
    
    if (availableSlots.length > 1) {
      const newSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      placement.slot = newSlot;
      
      // Re-evaluate
      placement.score = this.evaluateCandidate(
        placement,
        deckSpec.roles[roleToMutate],
        mutated
      );
    }
    
    return mutated;
  }
}