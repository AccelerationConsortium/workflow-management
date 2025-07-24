export const metadata = {
  label: "Prepare and Inject HPLC Sample",
  description: "Takes sample from source tray and vial, weighs it, and runs HPLC",
  primitives: ["sample_aliquot", "weigh_container", "run_hplc"],
  color: "#3b82f6",
  category: "hplc-sample",
  icon: "science",
  estimatedDuration: "8-12 minutes",
  requiredDevices: ["pipette", "balance", "hplc"],
  tags: ["sampling", "analysis", "hplc"]
};

export const executionSteps = [
  { 
    primitive: "sample_aliquot", 
    condition: true, 
    params: { dest_tray: "hplc" },
    description: "Transfer sample to HPLC vial"
  },
  { 
    primitive: "weigh_container", 
    condition: "perform_weighing == true",
    params: { to_hplc_inst: true },
    description: "Weigh sample for tracking"
  },
  { 
    primitive: "run_hplc", 
    condition: true,
    params: {},
    description: "Execute HPLC analysis"
  }
];