export const metadata = {
  label: "Run Extraction and Transfer to HPLC",
  description: "Execute extraction process, transfer sample from reactor, and run HPLC analysis",
  primitives: ["run_extraction", "extraction_vial_from_reactor", "sample_aliquot", "run_hplc"],
  color: "#10b981",
  category: "extraction",
  icon: "transform",
  estimatedDuration: "15-25 minutes",
  requiredDevices: ["reactor", "robotic_arm", "pipette", "hplc"],
  tags: ["extraction", "transfer", "analysis"]
};

export const executionSteps = [
  { 
    primitive: "run_extraction", 
    condition: true, 
    params: { stir_time: 5, settle_time: 2, rate: 1000 },
    description: "Execute extraction with stirring and settling"
  },
  { 
    primitive: "extraction_vial_from_reactor", 
    condition: true,
    params: {},
    description: "Transfer extracted sample from reactor to vial"
  },
  { 
    primitive: "sample_aliquot", 
    condition: "perform_aliquot == true",
    params: { dest_tray: "hplc" },
    description: "Transfer sample aliquot to HPLC vial"
  },
  { 
    primitive: "run_hplc", 
    condition: true,
    params: {},
    description: "Execute HPLC analysis"
  }
];