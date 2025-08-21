# DeckPlanner UO - Intelligent Deck Layout Planning System

A comprehensive deck planning system for Opentrons OT-2/Flex robots that abstracts "slot/labware" specifications into logical "roles/capabilities", enabling portable and intelligent workflow automation.

## 🎯 Overview

The DeckPlanner UO solves the key challenge in laboratory automation: **making protocols portable across different deck configurations**. Instead of hard-coding specific slots and labware, users define logical roles (like "sample_source" or "reagent_reservoir") with required capabilities, and the system automatically finds the optimal physical layout.

## ✨ Key Features

### 🧠 **Intelligent Placement**
- **4 Solver Strategies**: Greedy (fast), Simulated Annealing (better), ILP (optimal), Genetic Algorithm (complex)
- **Smart Constraints**: Adjacent placement, isolation requirements, temperature zones, accessibility
- **Optimization Goals**: Minimize movements, maximize throughput, reduce contamination risk

### 🔄 **Backward Compatibility**
- **Seamless Migration**: Existing slot-based UOs continue working unchanged
- **Progressive Adoption**: Mix legacy and role-based specifications in same workflow
- **Auto-Conversion**: Generate role-based specs from existing legacy code

### 🛠️ **Comprehensive Validation**
- **Collision Detection**: Physical interference and clearance checking
- **Accessibility Analysis**: Pipette reach and movement constraints
- **Temperature Compatibility**: Module requirements and thermal isolation
- **Contamination Risk**: Spatial separation for sample integrity

### 📊 **Rich Visualization**
- **SVG Deck Layouts**: Real-time visual feedback
- **Conflict Zones**: Highlight problem areas with suggested fixes
- **Movement Heatmaps**: Optimize based on usage patterns

## 🏗️ Architecture

```
DeckPlanner UO
├── 📦 Labware Registry     # Available hardware catalog
├── 🧩 Capability Mapper    # Role → Resource mapping
├── 🎯 Placement Solver     # Constraint optimization
├── ✅ Validator            # Comprehensive checking
├── 🔄 Binding Resolver     # Legacy compatibility
└── 🎨 Visualization        # SVG + analytics
```

## 🚀 Quick Start

### 1. **Basic Role-Based Usage**

```typescript
import { DeckPlannerUO } from './DeckPlanner';

const deckSpec = {
  version: '1.0',
  protocol: { name: 'ELISA Assay' },
  
  roles: {
    'samples': {
      description: 'Patient samples',
      capabilities: [
        { type: 'hold_liquid' },
        { type: '96_well_compatible' },
        { type: 'temperature_control' }
      ],
      constraints: {
        temperature: { min: 4, max: 8 }
      }
    },
    
    'reagents': {
      description: 'Detection reagents', 
      capabilities: [
        { type: 'reagent_reservoir' },
        { type: 'multi_channel_accessible' }
      ]
    },
    
    'waste': {
      description: 'Liquid waste',
      capabilities: [{ type: 'waste' }],
      constraints: { isolated: true }
    }
  },
  
  optimization: {
    priority: 'minimize_contamination_risk'
  }
};

const planner = new DeckPlannerUO();
const result = await planner.plan(deckSpec);

// Access bindings in your UOs
const sampleBinding = result.bindingMap.bindings['samples'];
console.log(`Samples in slot ${sampleBinding.slot}: ${sampleBinding.labware.displayName}`);
```

### 2. **Legacy Compatibility**

```typescript
// Your existing UO works unchanged
class LegacyTransferUO {
  execute(params: {
    sourceSlot: number,
    sourceLabware: string, 
    destSlot: number,
    destLabware: string
  }) {
    // Original implementation unchanged
  }
}

// Wrap with compatibility layer
const resolver = new BindingResolver();
const wrappedUO = resolver.createCompatibilityWrapper(new LegacyTransferUO());

// Now supports both legacy and role-based parameters
await wrappedUO.execute({
  sourceRole: 'samples',    // ← New role-based
  destSlot: 3,              // ← Legacy format
  destLabware: 'reservoir'  // ← Still works
});
```

### 3. **Advanced Constraints**

```typescript
const complexSpec = {
  roles: {
    'cold_storage': {
      description: 'Temperature-sensitive reagents',
      capabilities: [{ type: 'temperature_control' }],
      constraints: {
        temperature: { min: -20, max: 4 },
        isolated: true,
        accessibleBy: ['left_pipette']
      }
    },
    
    'reaction_plate': {
      description: 'Heated reactions',
      capabilities: [{ type: 'heating' }, { type: 'shaking' }],
      constraints: {
        adjacent: ['wash_buffer'],
        maxDistance: 200  // mm from cold storage
      }
    }
  },
  
  optimization: {
    priority: 'minimize_moves',
    constraints: {
      max_execution_time: 1800,  // 30 minutes
      min_separation_distance: 50  // mm safety margin
    }
  }
};
```

## 📋 Supported Capabilities

### **Labware Capabilities**
- `hold_liquid`, `hold_solid` - Basic storage
- `96_well_compatible`, `384_well_compatible` - Plate formats
- `tip_rack`, `filter_tips` - Pipette tips
- `reagent_reservoir`, `large_volume` - Bulk liquids
- `waste` - Disposal containers

### **Module Capabilities**  
- `temperature_control`, `heating`, `cooling` - Thermal control
- `magnetic` - Magnetic separation
- `shaking`, `mixing` - Agitation

### **Accessibility**
- `single_channel_accessible`, `multi_channel_accessible` - Pipette access
- `left_accessible`, `right_accessible` - Mount-specific

## 🎛️ Configuration Options

### **Solver Strategies**
- `greedy` - Fast (ms), good results for simple layouts
- `simulated_annealing` - Better optimization (seconds) 
- `ilp` - Optimal solution (minutes) for small problems
- `genetic_algorithm` - Best for complex constraints

### **Optimization Priorities**
- `minimize_moves` - Reduce robotic movements
- `maximize_throughput` - Optimize for speed
- `minimize_tips` - Reduce consumable usage
- `minimize_contamination_risk` - Maximize sample safety

### **Validation Levels**
- `collision` - Physical interference detection
- `accessibility` - Pipette reach analysis  
- `temperature` - Thermal compatibility
- `contamination` - Cross-contamination risk
- `capacity` - Volume and resource limits

## 🔄 Migration Path

### **Phase 1: Co-existence (0-3 months)**
- Existing UOs work unchanged
- New UOs use role-based approach
- Gradual team education

### **Phase 2: Guided Migration (3-6 months)**
- Auto-generate migration suggestions
- Compatibility warnings in development
- Migration tooling and examples

### **Phase 3: Soft Deprecation (6-9 months)**
- Runtime warnings for legacy usage
- Migration dashboard tracking
- Performance incentives for adoption

### **Phase 4: Full Migration (9-12 months)**
- Legacy format deprecated
- Full role-based ecosystem
- Advanced optimization features

## 📊 Templates

Pre-built templates for common workflows:

- **`PCR`** - Thermal cycling with temperature control
- **`ELISA`** - Immunoassay with washing steps  
- **`NGS_prep`** - Next-gen sequencing sample prep
- **`cell_culture`** - Cell maintenance protocols
- **`protein_purification`** - Multi-step purification

## 🧪 Examples

See `examples.ts` for complete working examples:

- **ELISA Protocol** - Temperature control + contamination prevention
- **PCR Setup** - Multi-module thermal management
- **Legacy Migration** - Seamless backward compatibility
- **Advanced Constraints** - Complex spatial/thermal requirements

## 🛠️ Development

### **Add Custom Labware**
```typescript
const registry = LabwareRegistry.getInstance();

registry.registerLabware({
  id: 'custom_plate_384',
  displayName: 'Custom 384-Well Plate',
  manufacturer: 'Custom Labs',
  capabilities: [
    { type: 'hold_liquid' },
    { type: '384_well_compatible' }
  ],
  dimensions: { x: 127.76, y: 85.48, z: 14.22 },
  wellLayout: {
    rows: 16,
    columns: 24, 
    wellVolume: 50,
    wellShape: 'square'
  }
});
```

### **Custom Validation Rules**
```typescript
class CustomValidator extends DeckValidator {
  validateCustomRule(context: ValidationContext): ValidationResult[] {
    // Your custom validation logic
    return [];
  }
}
```

## 🎯 Benefits

### **For Protocol Authors**
- ✅ Write portable protocols once, run anywhere
- ✅ Focus on science, not deck layout logistics
- ✅ Automatic optimization and error prevention
- ✅ Rich visual feedback and debugging

### **For Lab Operations**
- ✅ Flexible deck configurations for different assays
- ✅ Reduced setup errors and contamination risk
- ✅ Better resource utilization and throughput
- ✅ Easier protocol sharing and validation

### **For Development Teams**
- ✅ Gradual migration without breaking changes
- ✅ Better code reusability and maintainability
- ✅ Reduced support burden for deck configurations
- ✅ Extensible architecture for new hardware

## 🔮 Roadmap

- **Q1 2024**: OT-3 support and advanced modules
- **Q2 2024**: Multi-deck coordination and resource sharing
- **Q3 2024**: AI-powered optimization suggestions
- **Q4 2024**: Cloud-based protocol optimization service

---

The DeckPlanner UO represents a paradigm shift from **hardware-centric** to **science-centric** protocol development. By abstracting physical constraints into logical requirements, we enable truly portable and intelligent laboratory automation.

**Ready to get started?** Check out the examples and begin planning your first intelligent deck layout! 🚀