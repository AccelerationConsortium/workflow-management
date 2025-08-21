// Shared labware constants for SDL1 operations
export const LABWARE_OPTIONS = [
  { value: 'tip_rack', label: 'Tip Rack (96 tips)' },
  { value: 'vial_rack_2', label: 'Vial Rack Slot 2 (8x25mL)' },
  { value: 'vial_rack_7', label: 'Vial Rack Slot 7 (8x25mL)' },
  { value: 'vial_rack_11', label: 'Vial Rack Slot 11 (8x25mL)' },
  { value: 'wash_station', label: 'Wash Station (2x30mL)' },
  { value: 'nis_reactor', label: 'NIS Reactor (15 wells)' },
  { value: 'electrode_rack', label: 'Electrode Tip Rack' },
];

export const VIAL_POSITIONS = {
  vial_rack_2: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'],
  vial_rack_7: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'],
  vial_rack_11: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'],
  wash_station: ['A1', 'A2'],
  nis_reactor: [
    'A1', 'A2', 'A3', 'A4', 'A5',
    'B1', 'B2', 'B3', 'B4', 'B5',
    'C1', 'C2', 'C3', 'C4', 'C5'
  ],
  electrode_rack: ['A1', 'A2', 'B1', 'B2'], // A1: WE, A2: RE/CE, B1: Flush tool
};

export const PIPETTE_OPTIONS = [
  { value: 'p1000_single_gen1', label: 'P1000 Single Gen 1' },
  { value: 'p1000_single_gen2', label: 'P1000 Single Gen2' },
  { value: 'p300_single_gen2', label: 'P300 Single Gen2' },
  { value: 'p20_single_gen2', label: 'P20 Single Gen2' },
];

export const ADDITIVE_MAPPING = {
  A: { vial: 'A2', rack: 'vial_rack_2', label: 'Additive A' },
  B: { vial: 'A3', rack: 'vial_rack_2', label: 'Additive B' },
  C: { vial: 'A4', rack: 'vial_rack_2', label: 'Additive C' },
  D: { vial: 'B1', rack: 'vial_rack_2', label: 'Additive D' },
  E: { vial: 'B2', rack: 'vial_rack_2', label: 'Additive E' },
  F: { vial: 'B3', rack: 'vial_rack_2', label: 'Additive F' },
  G: { vial: 'B4', rack: 'vial_rack_2', label: 'Additive G' },
};

export const BASE_SOLUTION_LOCATION = {
  rack: 'vial_rack_2',
  vial: 'A1',
  label: 'Base Solution (ZnSO4)',
};

export const MOVEMENT_SPEEDS = {
  fast: 200,
  normal: 100,
  slow: 50,
  precise: 25,
};

export const Z_OFFSETS = {
  // Aspiration offsets
  vial_bottom: 8,    // 8mm from bottom for vials
  vial_safe: 20,     // Safe height above vial
  
  // Dispense offsets
  reactor_top: 5,    // 5mm above reactor well
  reactor_dispense: 0, // Dispense position
  
  // Electrode offsets
  electrode_pickup: 3,  // Pickup height for electrodes
  electrode_insert: -26, // Insertion depth for measurement
  electrode_wash: -57,  // Deep insertion for washing
  
  // Tip handling
  tip_pickup: 1,       // Y offset for tip pickup
  tip_drop: 7,         // Z offset for tip drop
};