// DeckPlanner Usage Examples
import {
  DeckSpec,
  RuntimeContext,
  BindingResolverInput
} from './types';
import { DeckPlannerUO } from './DeckPlannerUO';
import { BindingResolver } from './BindingResolver';

// ============= Example 1: Simple ELISA Protocol =============

export const elisaExample = async () => {
  const deckSpec: DeckSpec = {
    version: '1.0',
    protocol: {
      name: 'ELISA Assay',
      author: 'Lab Automation Team',
      description: '96-well ELISA with automated washing and detection'
    },
    
    roles: {
      'samples': {
        description: 'Patient serum samples',
        capabilities: [
          { type: 'hold_liquid' },
          { type: '96_well_compatible' },
          { type: 'single_channel_accessible' }
        ],
        constraints: {
          temperature: { min: 2, max: 8 },
          volume: { min: 100, max: 200 }
        }
      },
      
      'reagents': {
        description: 'ELISA detection reagents',
        capabilities: [
          { type: 'hold_liquid' },
          { type: 'reagent_reservoir' },
          { type: 'multi_channel_accessible' }
        ]
      },
      
      'wash_buffer': {
        description: 'PBS wash buffer',
        capabilities: [
          { type: 'large_volume' },
          { type: 'reagent_reservoir' }
        ],
        constraints: {
          volume: { min: 50000, max: 300000 }
        }
      },
      
      'waste': {
        description: 'Liquid waste container',
        capabilities: [
          { type: 'waste' },
          { type: 'large_volume' }
        ],
        constraints: {
          isolated: true
        }
      },
      
      'tips_300': {
        description: '300µL filter tips',
        capabilities: [
          { type: 'tip_rack' },
          { type: 'filter_tips' }
        ],
        preferredLabware: ['opentrons_96_filtertiprack_200ul'],
        constraints: {
          fixedSlot: 10
        }
      }
    },
    
    template: 'ELISA',
    
    optimization: {
      priority: 'minimize_contamination_risk',
      weights: {
        movement_distance: 0.2,
        tip_usage: 0.3,
        time: 0.2,
        contamination_risk: 0.3,
        resource_utilization: 0.0
      }
    }
  };
  
  const runtimeContext: RuntimeContext = {
    availableSlots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    installedModules: [
      {
        slot: 1,
        type: 'temperature_module_gen2',
        id: 'temp_mod_01',
        capabilities: [
          { type: 'temperature_control' },
          { type: 'cooling' },
          { type: 'heating' }
        ]
      }
    ],
    availablePipettes: [
      {
        mount: 'left',
        type: 'p300_single_gen2',
        channels: 1,
        minVolume: 20,
        maxVolume: 300
      },
      {
        mount: 'right',
        type: 'p300_multi_gen2',
        channels: 8,
        minVolume: 20,
        maxVolume: 300
      }
    ],
    occupiedSlots: []
  };
  
  const planner = new DeckPlannerUO(runtimeContext);
  const result = await planner.plan(deckSpec, runtimeContext);
  
  console.log('ELISA Planning Result:');
  console.log('Success:', result.success);
  console.log('Execution Time:', result.executionTime, 'ms');
  console.log('Bindings:', Object.keys(result.bindingMap.bindings));
  console.log('Validation Issues:', result.validationResults.length);
  
  if (result.warnings.length > 0) {
    console.log('Warnings:', result.warnings);
  }
  
  if (result.errors.length > 0) {
    console.log('Errors:', result.errors);
  }
  
  return result;
};

// ============= Example 2: PCR Protocol =============

export const pcrExample = async () => {
  const deckSpec: DeckSpec = {
    version: '1.0',
    protocol: {
      name: 'qPCR Setup',
      description: 'Automated qPCR reaction setup with temperature control'
    },
    
    roles: {
      'dna_samples': {
        description: 'DNA template samples',
        capabilities: [
          { type: 'hold_liquid' },
          { type: 'temperature_control' },
          { type: 'single_channel_accessible' }
        ],
        constraints: {
          temperature: { min: -20, max: 4 },
          accessibleBy: ['left_single']
        }
      },
      
      'pcr_plate': {
        description: 'qPCR reaction plate',
        capabilities: [
          { type: 'hold_liquid' },
          { type: '96_well_compatible' },
          { type: 'temperature_control' }
        ],
        preferredLabware: ['biorad_96_wellplate_200ul_pcr']
      },
      
      'master_mix': {
        description: 'PCR master mix',
        capabilities: [
          { type: 'hold_liquid' },
          { type: 'reagent_reservoir' }
        ],
        constraints: {
          temperature: { min: -20, max: 4 },
          adjacent: ['dna_samples']
        }
      },
      
      'primers': {
        description: 'PCR primer mix',
        capabilities: [
          { type: 'hold_liquid' },
          { type: '96_well_compatible' }
        ],
        constraints: {
          temperature: { min: -20, max: 4 }
        }
      }
    },
    
    template: 'PCR',
    
    optimization: {
      priority: 'minimize_time',
      weights: {
        movement_distance: 0.4,
        tip_usage: 0.2,
        time: 0.4,
        contamination_risk: 0.0,
        resource_utilization: 0.0
      },
      constraints: {
        max_execution_time: 1800  // 30 minutes
      }
    }
  };
  
  const runtimeContext: RuntimeContext = {
    availableSlots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    installedModules: [
      {
        slot: 1,
        type: 'temperature_module_gen2',
        id: 'temp_mod_cold',
        capabilities: [{ type: 'cooling' }]
      },
      {
        slot: 7,
        type: 'thermocycler_module',
        id: 'thermocycler_01',
        capabilities: [{ type: 'temperature_control' }]
      }
    ],
    availablePipettes: [
      {
        mount: 'left',
        type: 'p20_single_gen2',
        channels: 1,
        minVolume: 1,
        maxVolume: 20
      }
    ]
  };
  
  const planner = new DeckPlannerUO(runtimeContext, {
    solverStrategy: 'simulated_annealing',
    enableValidation: true,
    enableVisualization: true
  });
  
  const result = await planner.plan(deckSpec, runtimeContext);
  
  console.log('PCR Planning Result:');
  console.log('Binding Map:', result.bindingMap);
  console.log('Estimated Time:', result.bindingMap.executionPlan?.estimated_time, 'seconds');
  
  return result;
};

// ============= Example 3: Legacy Compatibility =============

export const legacyCompatibilityExample = async () => {
  // Simulate existing UO with legacy slot-based parameters
  const legacyTransferParams = {
    sourceSlot: 1,
    sourceLabware: 'corning_96_wellplate_360ul_flat',
    sourceWells: ['A1', 'A2', 'A3'],
    destSlot: 2,
    destLabware: 'corning_96_wellplate_360ul_flat',
    destWells: ['B1', 'B2', 'B3'],
    volume: 100
  };
  
  // Create resolver
  const resolver = new BindingResolver(undefined, 'warning');
  
  // Convert legacy format to resolver input
  const resolverInput: BindingResolverInput = {
    type: 'legacy',
    source: {
      slot: legacyTransferParams.sourceSlot,
      labware: legacyTransferParams.sourceLabware,
      wells: legacyTransferParams.sourceWells
    },
    destination: {
      slot: legacyTransferParams.destSlot,
      labware: legacyTransferParams.destLabware,
      wells: legacyTransferParams.destWells
    },
    volume: legacyTransferParams.volume
  };
  
  // Resolve to unified format
  const resolved = resolver.resolve(resolverInput);
  
  console.log('Legacy Compatibility Example:');
  console.log('Input Type:', resolved.metadata.inputType);
  console.log('Migration Ready:', resolved.metadata.migrationReady);
  console.log('Source:', resolved.source);
  console.log('Destination:', resolved.destination);
  
  // Generate migration suggestions
  const migrationReport = resolver.generateMigrationReport();
  console.log('Migration Report:', migrationReport);
  
  // Auto-convert to role-based format
  const { deckSpec, conversionReport } = resolver.convertLegacyToRoles([resolverInput]);
  console.log('Converted DeckSpec:', deckSpec);
  console.log('Conversion Report:', conversionReport);
  
  return { resolved, deckSpec };
};

// ============= Example 4: Hybrid Usage =============

export const hybridExample = async () => {
  // Mix of role-based and legacy specifications
  const hybridInput: BindingResolverInput = {
    type: 'hybrid',
    source: {
      role: 'samples'  // Role-based
    },
    destination: {
      slot: 3,         // Legacy
      labware: 'nest_12_reservoir_15ml',
      wells: ['A1']
    }
  };
  
  // First create a deck plan to establish role bindings
  const deckSpec: DeckSpec = {
    version: '1.0',
    protocol: { name: 'Hybrid Example' },
    roles: {
      'samples': {
        description: 'Sample source',
        capabilities: [{ type: 'hold_liquid' }]
      }
    }
  };
  
  const planner = new DeckPlannerUO();
  const planResult = await planner.plan(deckSpec);
  
  if (planResult.success) {
    // Now resolve hybrid input
    const resolver = planner.getResolver();
    const resolved = resolver.resolve(hybridInput);
    
    console.log('Hybrid Example:');
    console.log('Migration Progress:', resolved.metadata.migrationProgress + '%');
    console.log('Resolved:', resolved);
    
    return resolved;
  }
  
  return null;
};

// ============= Example 5: Advanced Constraints =============

export const advancedConstraintsExample = async () => {
  const deckSpec: DeckSpec = {
    version: '1.0',
    protocol: {
      name: 'Complex Multi-Module Protocol',
      description: 'Advanced protocol with complex spatial and thermal constraints'
    },
    
    roles: {
      'cold_samples': {
        description: 'Temperature-sensitive samples',
        capabilities: [
          { type: 'hold_liquid' },
          { type: 'temperature_control' }
        ],
        constraints: {
          temperature: { min: 4, max: 8 },
          isolated: true,
          accessibleBy: ['left_single']
        }
      },
      
      'reaction_plate': {
        description: 'Heated reaction plate',
        capabilities: [
          { type: 'hold_liquid' },
          { type: 'heating' },
          { type: 'shaking' }
        ],
        constraints: {
          temperature: { min: 37, max: 95 },
          maxDistance: 200  // mm from cold samples
        }
      },
      
      'magnetic_beads': {
        description: 'Magnetic separation plate',
        capabilities: [
          { type: 'hold_liquid' },
          { type: 'magnetic' }
        ],
        constraints: {
          adjacent: ['wash_station']
        }
      },
      
      'wash_station': {
        description: 'Wash buffer reservoir',
        capabilities: [
          { type: 'large_volume' },
          { type: 'reagent_reservoir' }
        ]
      },
      
      'tip_rack_20': {
        description: '20µL tips',
        capabilities: [{ type: 'tip_rack' }],
        constraints: {
          fixedSlot: 10,
          accessibleBy: ['left_single', 'right_single']
        }
      },
      
      'tip_rack_300': {
        description: '300µL tips',
        capabilities: [{ type: 'tip_rack' }],
        constraints: {
          fixedSlot: 11,
          accessibleBy: ['left_single', 'right_multi']
        }
      }
    },
    
    optimization: {
      priority: 'minimize_contamination_risk',
      weights: {
        movement_distance: 0.25,
        tip_usage: 0.25,
        time: 0.2,
        contamination_risk: 0.3,
        resource_utilization: 0.0
      },
      constraints: {
        max_tip_usage: 300,
        max_execution_time: 3600,
        min_separation_distance: 100
      }
    }
  };
  
  const runtimeContext: RuntimeContext = {
    availableSlots: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    installedModules: [
      {
        slot: 1,
        type: 'temperature_module_gen2',
        id: 'temp_cold',
        capabilities: [{ type: 'cooling' }]
      },
      {
        slot: 4,
        type: 'heater_shaker_module',
        id: 'heater_shaker_01',
        capabilities: [{ type: 'heating' }, { type: 'shaking' }]
      },
      {
        slot: 6,
        type: 'magnetic_module_gen2',
        id: 'mag_mod_01',
        capabilities: [{ type: 'magnetic' }]
      }
    ],
    availablePipettes: [
      {
        mount: 'left',
        type: 'p20_single_gen2',
        channels: 1,
        minVolume: 1,
        maxVolume: 20
      },
      {
        mount: 'right',
        type: 'p300_multi_gen2',
        channels: 8,
        minVolume: 20,
        maxVolume: 300
      }
    ]
  };
  
  const planner = new DeckPlannerUO(runtimeContext, {
    solverStrategy: 'genetic_algorithm',
    enableValidation: true,
    enableVisualization: true
  });
  
  const result = await planner.plan(deckSpec, runtimeContext);
  
  console.log('Advanced Constraints Example:');
  console.log('Planning Success:', result.success);
  console.log('Constraint Violations:', result.validationResults.filter(r => r.severity === 'error').length);
  console.log('Optimization Score:', result.bindingMap.metadata.optimization_score);
  
  if (result.bindingMap.visualization) {
    console.log('Conflict Zones:', result.bindingMap.visualization.conflict_zones?.length || 0);
  }
  
  return result;
};

// ============= Test Runner =============

export const runAllExamples = async () => {
  console.log('🧪 Running DeckPlanner Examples...\n');
  
  try {
    console.log('1️⃣ ELISA Example');
    await elisaExample();
    console.log('✅ ELISA Example completed\n');
    
    console.log('2️⃣ PCR Example');
    await pcrExample();
    console.log('✅ PCR Example completed\n');
    
    console.log('3️⃣ Legacy Compatibility Example');
    await legacyCompatibilityExample();
    console.log('✅ Legacy Compatibility Example completed\n');
    
    console.log('4️⃣ Hybrid Example');
    await hybridExample();
    console.log('✅ Hybrid Example completed\n');
    
    console.log('5️⃣ Advanced Constraints Example');
    await advancedConstraintsExample();
    console.log('✅ Advanced Constraints Example completed\n');
    
    console.log('🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
};

// Export for easy testing
export default {
  elisaExample,
  pcrExample,
  legacyCompatibilityExample,
  hybridExample,
  advancedConstraintsExample,
  runAllExamples
};