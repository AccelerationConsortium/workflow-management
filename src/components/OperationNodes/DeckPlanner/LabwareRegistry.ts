// Labware Registry - Manages available labware and module definitions
import { 
  LabwareRegistryEntry, 
  ModuleRegistryEntry, 
  Capability,
  ModuleType,
  CapabilityType 
} from './types';

export class LabwareRegistry {
  private static instance: LabwareRegistry;
  private labwareDatabase: Map<string, LabwareRegistryEntry> = new Map();
  private moduleDatabase: Map<string, ModuleRegistryEntry> = new Map();
  
  private constructor() {
    this.initializeDefaultLabware();
    this.initializeDefaultModules();
  }
  
  static getInstance(): LabwareRegistry {
    if (!LabwareRegistry.instance) {
      LabwareRegistry.instance = new LabwareRegistry();
    }
    return LabwareRegistry.instance;
  }
  
  // ============= Labware Management =============
  
  registerLabware(entry: LabwareRegistryEntry): void {
    this.labwareDatabase.set(entry.id, entry);
  }
  
  getLabware(id: string): LabwareRegistryEntry | undefined {
    return this.labwareDatabase.get(id);
  }
  
  findLabwareByCapabilities(requiredCapabilities: Capability[]): LabwareRegistryEntry[] {
    const results: LabwareRegistryEntry[] = [];
    
    this.labwareDatabase.forEach(labware => {
      const hasAllCapabilities = requiredCapabilities.every(reqCap =>
        labware.capabilities.some(labCap => 
          labCap.type === reqCap.type && 
          (reqCap.value === undefined || labCap.value === reqCap.value)
        )
      );
      
      if (hasAllCapabilities) {
        results.push(labware);
      }
    });
    
    return results;
  }
  
  findLabwareByVolume(minVolume: number, maxVolume: number): LabwareRegistryEntry[] {
    const results: LabwareRegistryEntry[] = [];
    
    this.labwareDatabase.forEach(labware => {
      if (labware.wellLayout) {
        const totalVolume = labware.wellLayout.wellVolume * 
                          labware.wellLayout.rows * 
                          labware.wellLayout.columns;
        
        if (totalVolume >= minVolume && totalVolume <= maxVolume) {
          results.push(labware);
        }
      }
    });
    
    return results;
  }
  
  // ============= Module Management =============
  
  registerModule(entry: ModuleRegistryEntry): void {
    this.moduleDatabase.set(entry.id, entry);
  }
  
  getModule(id: string): ModuleRegistryEntry | undefined {
    return this.moduleDatabase.get(id);
  }
  
  findModulesByType(type: ModuleType): ModuleRegistryEntry[] {
    const results: ModuleRegistryEntry[] = [];
    
    this.moduleDatabase.forEach(module => {
      if (module.type === type) {
        results.push(module);
      }
    });
    
    return results;
  }
  
  findModulesByCapabilities(requiredCapabilities: Capability[]): ModuleRegistryEntry[] {
    const results: ModuleRegistryEntry[] = [];
    
    this.moduleDatabase.forEach(module => {
      const hasAllCapabilities = requiredCapabilities.every(reqCap =>
        module.capabilities.some(modCap => 
          modCap.type === reqCap.type && 
          (reqCap.value === undefined || modCap.value === reqCap.value)
        )
      );
      
      if (hasAllCapabilities) {
        results.push(module);
      }
    });
    
    return results;
  }
  
  // ============= Compatibility Checking =============
  
  isLabwareModuleCompatible(labwareId: string, moduleType: ModuleType): boolean {
    const labware = this.getLabware(labwareId);
    if (!labware) return false;
    
    return labware.compatibleModules?.includes(moduleType) ?? false;
  }
  
  getCompatibleLabwareForModule(moduleType: ModuleType): LabwareRegistryEntry[] {
    const results: LabwareRegistryEntry[] = [];
    
    this.labwareDatabase.forEach(labware => {
      if (labware.compatibleModules?.includes(moduleType)) {
        results.push(labware);
      }
    });
    
    return results;
  }
  
  // ============= Default Definitions =============
  
  private initializeDefaultLabware(): void {
    // 96-well plates
    this.registerLabware({
      id: 'corning_96_wellplate_360ul_flat',
      displayName: 'Corning 96 Well Plate 360 µL Flat',
      manufacturer: 'Corning',
      capabilities: [
        { type: 'hold_liquid' },
        { type: '96_well_compatible' },
        { type: 'multi_channel_accessible' },
        { type: 'single_channel_accessible' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 14.22 },
      wellLayout: {
        rows: 8,
        columns: 12,
        wellVolume: 360,
        wellShape: 'circular'
      },
      compatibleModules: [
        'temperature_module_gen1',
        'temperature_module_gen2',
        'heater_shaker_module',
        'magnetic_module_gen1',
        'magnetic_module_gen2'
      ],
      tags: ['plate', '96-well', 'standard']
    });
    
    this.registerLabware({
      id: 'biorad_96_wellplate_200ul_pcr',
      displayName: 'Bio-Rad 96 Well Plate 200 µL PCR',
      manufacturer: 'Bio-Rad',
      capabilities: [
        { type: 'hold_liquid' },
        { type: '96_well_compatible' },
        { type: 'multi_channel_accessible' },
        { type: 'single_channel_accessible' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 16.06 },
      wellLayout: {
        rows: 8,
        columns: 12,
        wellVolume: 200,
        wellShape: 'circular'
      },
      compatibleModules: [
        'temperature_module_gen1',
        'temperature_module_gen2',
        'thermocycler_module'
      ],
      tags: ['plate', '96-well', 'PCR']
    });
    
    // 384-well plates
    this.registerLabware({
      id: 'corning_384_wellplate_112ul_flat',
      displayName: 'Corning 384 Well Plate 112 µL Flat',
      manufacturer: 'Corning',
      capabilities: [
        { type: 'hold_liquid' },
        { type: '384_well_compatible' },
        { type: 'single_channel_accessible' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 14.5 },
      wellLayout: {
        rows: 16,
        columns: 24,
        wellVolume: 112,
        wellShape: 'square'
      },
      compatibleModules: ['temperature_module_gen2'],
      tags: ['plate', '384-well', 'high-throughput']
    });
    
    // Reservoirs
    this.registerLabware({
      id: 'nest_12_reservoir_15ml',
      displayName: 'NEST 12 Well Reservoir 15 mL',
      manufacturer: 'NEST',
      capabilities: [
        { type: 'hold_liquid' },
        { type: 'large_volume' },
        { type: 'reagent_reservoir' },
        { type: 'multi_channel_accessible' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 31.4 },
      wellLayout: {
        rows: 1,
        columns: 12,
        wellVolume: 15000,
        wellShape: 'rectangular'
      },
      compatibleModules: [],
      tags: ['reservoir', 'reagent', 'large-volume']
    });
    
    this.registerLabware({
      id: 'nest_1_reservoir_195ml',
      displayName: 'NEST 1 Well Reservoir 195 mL',
      manufacturer: 'NEST',
      capabilities: [
        { type: 'hold_liquid' },
        { type: 'large_volume' },
        { type: 'waste' },
        { type: 'reagent_reservoir' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 40 },
      wellLayout: {
        rows: 1,
        columns: 1,
        wellVolume: 195000,
        wellShape: 'rectangular'
      },
      compatibleModules: [],
      tags: ['reservoir', 'waste', 'large-volume']
    });
    
    // Tip racks
    this.registerLabware({
      id: 'opentrons_96_tiprack_300ul',
      displayName: 'Opentrons 96 Tip Rack 300 µL',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'tip_rack' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 64.69 },
      wellLayout: {
        rows: 8,
        columns: 12,
        wellVolume: 300,
        wellShape: 'circular'
      },
      compatibleModules: [],
      tags: ['tiprack', '300ul', 'standard']
    });
    
    this.registerLabware({
      id: 'opentrons_96_filtertiprack_200ul',
      displayName: 'Opentrons 96 Filter Tip Rack 200 µL',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'tip_rack' },
        { type: 'filter_tips' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 64.69 },
      wellLayout: {
        rows: 8,
        columns: 12,
        wellVolume: 200,
        wellShape: 'circular'
      },
      compatibleModules: [],
      tags: ['tiprack', '200ul', 'filter']
    });
    
    this.registerLabware({
      id: 'opentrons_96_tiprack_1000ul',
      displayName: 'Opentrons 96 Tip Rack 1000 µL',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'tip_rack' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 85.47 },
      wellLayout: {
        rows: 8,
        columns: 12,
        wellVolume: 1000,
        wellShape: 'circular'
      },
      compatibleModules: [],
      tags: ['tiprack', '1000ul', 'standard']
    });
    
    // Tube racks
    this.registerLabware({
      id: 'opentrons_24_tuberack_eppendorf_1.5ml',
      displayName: 'Opentrons 24 Tube Rack with Eppendorf 1.5 mL',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'hold_liquid' },
        { type: 'single_channel_accessible' }
      ],
      dimensions: { x: 127.76, y: 85.48, z: 42.6 },
      wellLayout: {
        rows: 4,
        columns: 6,
        wellVolume: 1500,
        wellShape: 'circular'
      },
      compatibleModules: [
        'temperature_module_gen1',
        'temperature_module_gen2'
      ],
      tags: ['tuberack', 'eppendorf', '1.5ml']
    });
  }
  
  private initializeDefaultModules(): void {
    // Temperature modules
    this.registerModule({
      id: 'temperature_module_gen2',
      type: 'temperature_module_gen2',
      displayName: 'Temperature Module GEN2',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'temperature_control' },
        { type: 'cooling' },
        { type: 'heating' }
      ],
      specifications: {
        temperatureRange: { min: 4, max: 95 }
      },
      slotCompatibility: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      heightOffset: 70
    });
    
    // Magnetic modules
    this.registerModule({
      id: 'magnetic_module_gen2',
      type: 'magnetic_module_gen2',
      displayName: 'Magnetic Module GEN2',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'magnetic' }
      ],
      specifications: {
        magneticStrength: 1.8
      },
      slotCompatibility: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      heightOffset: 35
    });
    
    // Heater-Shaker module
    this.registerModule({
      id: 'heater_shaker_module',
      type: 'heater_shaker_module',
      displayName: 'Heater-Shaker Module',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'heating' },
        { type: 'shaking' },
        { type: 'mixing' },
        { type: 'temperature_control' }
      ],
      specifications: {
        temperatureRange: { min: 20, max: 95 },
        shakingSpeed: { min: 200, max: 3000 }
      },
      slotCompatibility: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      heightOffset: 70
    });
    
    // Thermocycler module
    this.registerModule({
      id: 'thermocycler_module',
      type: 'thermocycler_module',
      displayName: 'Thermocycler Module',
      manufacturer: 'Opentrons',
      capabilities: [
        { type: 'temperature_control' },
        { type: 'heating' },
        { type: 'cooling' }
      ],
      specifications: {
        temperatureRange: { min: 4, max: 99 }
      },
      slotCompatibility: [7, 8, 10, 11],  // Takes up multiple slots
      heightOffset: 0  // Has its own lid
    });
  }
  
  // ============= Utility Methods =============
  
  getAllLabware(): LabwareRegistryEntry[] {
    return Array.from(this.labwareDatabase.values());
  }
  
  getAllModules(): ModuleRegistryEntry[] {
    return Array.from(this.moduleDatabase.values());
  }
  
  searchLabware(query: string): LabwareRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllLabware().filter(labware =>
      labware.displayName.toLowerCase().includes(lowerQuery) ||
      labware.manufacturer.toLowerCase().includes(lowerQuery) ||
      labware.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  getLabwareCategories(): string[] {
    const categories = new Set<string>();
    this.labwareDatabase.forEach(labware => {
      if (labware.tags) {
        labware.tags.forEach(tag => categories.add(tag));
      }
    });
    return Array.from(categories);
  }
}