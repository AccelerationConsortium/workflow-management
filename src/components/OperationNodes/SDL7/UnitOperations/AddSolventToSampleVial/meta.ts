export const metadata = {
  label: "Add Solvent to Sample Vial",
  description: "Add specified solvent to a vial with optional weighing",
  primitives: ["add_solvent", "weigh_container"],
  color: "#ef4444",
  category: "solvent",
  icon: "water_drop",
  estimatedDuration: "2-4 minutes",
  requiredDevices: ["pipette", "balance"],
  tags: ["solvent", "preparation", "weighing"]
};

export const executionSteps = [
  { 
    primitive: "add_solvent", 
    condition: true, 
    params: { solvent: "Methanol", solvent_vol: 900, clean: false },
    description: "Add solvent to sample vial"
  },
  { 
    primitive: "weigh_container", 
    condition: "perform_weighing == true",
    params: { to_hplc_inst: false },
    description: "Weigh vial with solvent for tracking"
  }
];