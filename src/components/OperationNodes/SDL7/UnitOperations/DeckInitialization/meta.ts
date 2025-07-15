export const metadata = {
  label: "Deck Initialization",
  description: "Initialize all instruments and prepare the deck for experiments",
  primitives: ["initialize_deck", "hplc_instrument_setup"],
  color: "#f59e0b",
  category: "initialization",
  icon: "settings",
  estimatedDuration: "3-5 minutes",
  requiredDevices: ["deck", "hplc", "robotic_arm"],
  tags: ["setup", "initialization", "calibration"]
};

export const executionSteps = [
  { 
    primitive: "initialize_deck", 
    condition: true, 
    params: { experiment_name: "SDL7_Experiment", solvent_file: "solvents_default.csv" },
    description: "Initialize deck with experiment parameters"
  },
  { 
    primitive: "hplc_instrument_setup", 
    condition: true,
    params: { injection_volume: 5 },
    description: "Configure HPLC instrument settings"
  }
];