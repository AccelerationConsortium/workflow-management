import { ParameterGroup } from '../../types';

export const TRAY_OPTIONS = [
  { value: 'hplc', label: 'HPLC Tray' },
  { value: 'reaction_tray', label: 'Reaction Tray' },
  { value: 'sample_tray', label: 'Sample Tray' },
  { value: 'solvent_tray', label: 'Solvent Tray' },
];

export const VIAL_OPTIONS = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'A3', label: 'A3' },
  { value: 'A4', label: 'A4' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'B3', label: 'B3' },
  { value: 'B4', label: 'B4' },
  { value: 'C1', label: 'C1' },
  { value: 'C2', label: 'C2' },
  { value: 'C3', label: 'C3' },
  { value: 'C4', label: 'C4' },
];

export const SOLVENT_OPTIONS = [
  { value: 'Methanol', label: 'Methanol' },
  { value: 'Acetonitrile', label: 'Acetonitrile' },
  { value: 'Water', label: 'Water' },
  { value: 'Ethanol', label: 'Ethanol' },
  { value: 'Isopropanol', label: 'Isopropanol' },
  { value: 'DMSO', label: 'DMSO' },
  { value: 'DCM', label: 'Dichloromethane' },
  { value: 'THF', label: 'Tetrahydrofuran' },
];

export const DEFAULT_VALUES = {
  // Vial parameters
  vial: 'A1',
  tray: 'hplc',
  
  // Solvent parameters
  solvent: 'Methanol',
  solvent_vol: 900,
  clean: false,
  
  // Optional weighing
  perform_weighing: false,
  sample_name: '',
};

export const PARAMETER_GROUPS: Record<string, ParameterGroup> = {
  vial: {
    label: 'Vial Configuration',
    parameters: {
      tray: {
        type: 'select',
        label: 'Tray',
        description: 'Tray containing the target vial',
        options: TRAY_OPTIONS,
        defaultValue: DEFAULT_VALUES.tray,
        required: true,
      },
      vial: {
        type: 'select',
        label: 'Vial Position',
        description: 'Target vial for solvent addition',
        options: VIAL_OPTIONS,
        defaultValue: DEFAULT_VALUES.vial,
        required: true,
      },
    },
  },
  solvent: {
    label: 'Solvent Parameters',
    parameters: {
      solvent: {
        type: 'select',
        label: 'Solvent',
        description: 'Solvent to add',
        options: SOLVENT_OPTIONS,
        defaultValue: DEFAULT_VALUES.solvent,
        required: true,
      },
      solvent_vol: {
        type: 'number',
        label: 'Solvent Volume',
        description: 'Volume of solvent to add',
        defaultValue: DEFAULT_VALUES.solvent_vol,
        min: 10,
        max: 2000,
        step: 10,
        unit: 'μL',
        required: true,
      },
      clean: {
        type: 'boolean',
        label: 'Clean Pipette',
        description: 'Clean pipette before and after transfer',
        defaultValue: DEFAULT_VALUES.clean,
      },
    },
  },
  weighing: {
    label: 'Optional Weighing',
    parameters: {
      perform_weighing: {
        type: 'boolean',
        label: 'Weigh After Addition',
        description: 'Weigh vial after solvent addition',
        defaultValue: DEFAULT_VALUES.perform_weighing,
      },
      sample_name: {
        type: 'string',
        label: 'Sample Name',
        description: 'Name for weight tracking',
        defaultValue: DEFAULT_VALUES.sample_name,
        required: false,
        dependsOn: {
          parameter: 'perform_weighing',
          value: true,
        },
      },
    },
  },
};

export const PRIMITIVE_OPERATIONS = [
  'add_solvent',
  'weigh_container',
];