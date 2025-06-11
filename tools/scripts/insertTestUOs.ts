import { pool } from '../src/db';

interface TestUO {
  uo_name: string;
  description: string;
  category: string;
  hardware: string;
  software: {
    [key: string]: {
      version: string;
      dependencies?: string[];
    };
  };
  inputs: Array<{
    name: string;
    type: string;
    unit: string;
    initial_value: any;
  }>;
  parameters: Array<{
    name: string;
    value: number | string;
    unit: string;
  }>;
  outputs: Array<{
    name: string;
    type: string;
    unit: string;
    description: string;
  }>;
  constraints: {
    Environment: {
      [key: string]: string;
    };
  };
}

const testUOs: TestUO[] = [
  {
    uo_name: "Prepare_Electrolyte_v1.0",
    description: "Preparation of electrolyte mixtures.",
    category: "test",
    hardware: "Caframo Compact Mixer",
    software: {
      Python: { version: "3.10", dependencies: ["PySerial >= 3.0"] }
    },
    inputs: [
      {
        name: "Electrolyte_Components",
        type: "list",
        unit: "mL",
        initial_value: ["H2SO4", "KNO3"]
      }
    ],
    parameters: [
      {
        name: "Mixing_Speed",
        value: 300,
        unit: "RPM"
      },
      {
        name: "Mixing_Time",
        value: 5,
        unit: "min"
      }
    ],
    outputs: [
      {
        name: "Homogeneity",
        type: "numeric",
        unit: "%",
        description: "Homogeneity of the electrolyte mixture."
      }
    ],
    constraints: {
      Environment: {
        Humidity: "30-50%",
        Temperature: "25°C"
      }
    }
  },
  {
    uo_name: "Electrodeposition_v1.0",
    description: "Deposition of catalyst on electrode.",
    category: "test",
    hardware: "Gamry Potentiostat",
    software: {
      Gamry_Framework: { version: "7.9" }
    },
    inputs: [
      {
        name: "Electrode_Surface",
        type: "string",
        unit: "cm2",
        initial_value: "Carbon Paper"
      }
    ],
    parameters: [
      {
        name: "Current_Density",
        value: 10,
        unit: "mA/cm2"
      },
      {
        name: "Deposition_Time",
        value: 20,
        unit: "min"
      }
    ],
    outputs: [
      {
        name: "Deposit_Quality",
        type: "categorical",
        unit: "grade",
        description: "Visual grading of deposit quality"
      }
    ],
    constraints: {
      Environment: {
        Temperature: "25°C"
      }
    }
  },
  {
    uo_name: "Electroreduction_NO3_to_NH3_v1.0",
    description: "Performs a NO3- to NH3 reduction reaction.",
    category: "test",
    hardware: "Pine Research Rotating Disk Electrode",
    software: {
      Custom_Software: { version: "1.0", dependencies: ["SciPy >= 1.5"] }
    },
    inputs: [
      {
        name: "Electrolyte_Components",
        type: "list",
        unit: "mL",
        initial_value: ["H2SO4", "KNO3"]
      }
    ],
    parameters: [
      {
        name: "Current_Density",
        value: 10,
        unit: "mA/cm2"
      },
      {
        name: "Reduction_Time",
        value: 20,
        unit: "min"
      }
    ],
    outputs: [
      {
        name: "Reduction_Efficiency",
        type: "numeric",
        unit: "%",
        description: "Efficiency of the reduction reaction"
      }
    ],
    constraints: {
      Environment: {
        Humidity: "30-50%",
        Temperature: "25°C"
      }
    }
  },
  {
    uo_name: "UV_VIS_Analysis_v1.0",
    description: "Analyzes reaction products using UV-VIS spectroscopy.",
    category: "test",
    hardware: "Shimadzu UV-1900 Spectrophotometer",
    software: {
      LabSolutions: { version: "1.20" }
    },
    inputs: [
      {
        name: "Reaction_Products",
        type: "list",
        unit: "mL",
        initial_value: ["H2O", "NH3"]
      }
    ],
    parameters: [
      {
        name: "Wavelength",
        value: 200,
        unit: "nm"
      },
      {
        name: "Integration_Time",
        value: 10,
        unit: "s"
      }
    ],
    outputs: [
      {
        name: "Absorbance",
        type: "numeric",
        unit: "AU",
        description: "Absorbance of the reaction products"
      }
    ],
    constraints: {
      Environment: {
        Humidity: "30-50%",
        Temperature: "25°C"
      }
    }
  }
];

async function insertTestData() {
  try {
    for (const uo of testUOs) {
      // Insert basic information
      const { rows: [uoRow] } = await pool.query(
        `INSERT INTO unit_operations 
         (uo_name, description, category, hardware, software) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id`,
        [uo.uo_name, uo.description, uo.category, uo.hardware, JSON.stringify(uo.software)]
      );

      // Insert inputs
      for (const input of uo.inputs) {
        await pool.query(
          `INSERT INTO uo_inputs 
           (uo_id, name, type, unit, initial_value) 
           VALUES ($1, $2, $3, $4, $5)`,
          [uoRow.id, input.name, input.type, input.unit, JSON.stringify(input.initial_value)]
        );
      }

      // Insert parameters
      for (const param of uo.parameters) {
        await pool.query(
          `INSERT INTO uo_parameters 
           (uo_id, name, value, unit) 
           VALUES ($1, $2, $3, $4)`,
          [uoRow.id, param.name, JSON.stringify(param.value), param.unit]
        );
      }

      // Insert outputs
      for (const output of uo.outputs) {
        await pool.query(
          `INSERT INTO uo_outputs 
           (uo_id, name, type, description, unit) 
           VALUES ($1, $2, $3, $4, $5)`,
          [uoRow.id, output.name, output.type, output.description, output.unit]
        );
      }

      // Insert constraints
      await pool.query(
        `INSERT INTO uo_constraints 
         (uo_id, category, conditions) 
         VALUES ($1, $2, $3)`,
        [uoRow.id, 'Environment', JSON.stringify(uo.constraints.Environment)]
      );
    }

    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    await pool.end();
  }
}

insertTestData(); 