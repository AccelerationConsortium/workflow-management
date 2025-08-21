import React from 'react';
import { NodeProps } from 'reactflow';
import { BaseUONode } from '../BaseUONode';
import { ParameterGroup } from '../types';

const parameterGroups: Record<string, ParameterGroup> = {
  liquid_handling: {
    label: 'Liquid Handling Parameters',
    parameters: {
      labware_from: {
        type: 'select',
        label: 'Source Labware',
        description: 'Source labware for liquid handling',
        defaultValue: 'vial_rack_2',
        options: [
          { value: 'vial_rack_2', label: 'Vial Rack Slot 2' },
          { value: 'vial_rack_7', label: 'Vial Rack Slot 7' },
          { value: 'vial_rack_11', label: 'Vial Rack Slot 11' },
          { value: 'wash_station', label: 'Wash Station' },
        ],
        required: true,
      },
      well_from: {
        type: 'select',
        label: 'Source Well',
        description: 'Source well position',
        defaultValue: 'A1',
        options: [
          { value: 'A1', label: 'A1 (Mn-Ru Solution)' },
          { value: 'A2', label: 'A2 (KOH Solution)' },
          { value: 'A3', label: 'A3 (Electrolyte)' },
          { value: 'A4', label: 'A4 (Cleaning Solution)' },
        ],
        required: true,
      },
      labware_to: {
        type: 'select',
        label: 'Target Labware',
        description: 'Target labware for liquid handling',
        defaultValue: 'reactor',
        options: [
          { value: 'reactor', label: 'NIS Reactor' },
          { value: 'wash_station', label: 'Wash Station' },
          { value: 'waste', label: 'Waste Container' },
        ],
        required: true,
      },
      well_to: {
        type: 'string',
        label: 'Target Well',
        description: 'Target well position (e.g., A1, B2)',
        defaultValue: 'A1',
        required: true,
      },
      volume: {
        type: 'number',
        label: 'Transfer Volume',
        unit: 'µL',
        description: 'Volume to transfer',
        min: 1,
        max: 5000,
        defaultValue: 4000,
        required: true,
      },
    }
  },
  pipette_configuration: {
    label: 'Pipette Configuration',
    parameters: {
      pipette_name: {
        type: 'select',
        label: 'Pipette Type',
        description: 'Type of pipette to use',
        defaultValue: 'p1000_single_gen2',
        options: [
          { value: 'p20_single_gen2', label: 'P20 Single Gen 2' },
          { value: 'p300_single_gen2', label: 'P300 Single Gen 2' },
          { value: 'p1000_single_gen2', label: 'P1000 Single Gen 2' },
          { value: 'p1000_single_gen1', label: 'P1000 Single Gen 1' },
        ],
        required: true,
      },
      mount_position: {
        type: 'select',
        label: 'Mount Position',
        description: 'Pipette mount position',
        defaultValue: 'right',
        options: [
          { value: 'left', label: 'Left Mount' },
          { value: 'right', label: 'Right Mount' },
        ],
        required: true,
      },
      movement_speed: {
        type: 'number',
        label: 'Movement Speed',
        unit: 'mm/s',
        description: 'Pipette movement speed',
        min: 10,
        max: 500,
        defaultValue: 100,
        required: false,
      },
    }
  },
  position_offsets: {
    label: 'Position Offsets',
    parameters: {
      aspiration_offset_z: {
        type: 'number',
        label: 'Aspiration Z Offset',
        unit: 'mm',
        description: 'Z offset for aspiration (relative to bottom)',
        min: -10,
        max: 50,
        step: 0.1,
        defaultValue: 8,
        required: false,
      },
      dispense_offset_x: {
        type: 'number',
        label: 'Dispense X Offset',
        unit: 'mm',
        description: 'X offset for dispensing',
        min: -50,
        max: 50,
        step: 0.1,
        defaultValue: -1,
        required: false,
      },
      dispense_offset_y: {
        type: 'number',
        label: 'Dispense Y Offset',
        unit: 'mm',
        description: 'Y offset for dispensing',
        min: -50,
        max: 50,
        step: 0.1,
        defaultValue: 0.5,
        required: false,
      },
      dispense_offset_z: {
        type: 'number',
        label: 'Dispense Z Offset',
        unit: 'mm',
        description: 'Z offset for dispensing',
        min: -50,
        max: 50,
        step: 0.1,
        defaultValue: 0,
        required: false,
      },
    }
  },
  robot_configuration: {
    label: 'Robot Configuration',
    parameters: {
      robot_ip: {
        type: 'string',
        label: 'Robot IP Address',
        description: 'OT2 robot IP address',
        defaultValue: '169.254.69.185',
        required: true,
      },
      robot_port: {
        type: 'number',
        label: 'Robot Port',
        description: 'Communication port',
        min: 1,
        max: 65535,
        defaultValue: 31950,
        required: false,
      },
      enable_robot_lights: {
        type: 'boolean',
        label: 'Enable Robot Lights',
        description: 'Turn on robot lights during operation',
        defaultValue: true,
        required: false,
      },
      home_robot_before: {
        type: 'boolean',
        label: 'Home Robot Before Operation',
        description: 'Home robot before starting liquid handling',
        defaultValue: true,
        required: false,
      },
    }
  },
  tip_management: {
    label: 'Tip Management',
    parameters: {
      tip_rack_slot: {
        type: 'select',
        label: 'Tip Rack Slot',
        description: 'Slot containing tip rack',
        defaultValue: '1',
        options: [
          { value: '1', label: 'Slot 1' },
          { value: '2', label: 'Slot 2' },
          { value: '3', label: 'Slot 3' },
          { value: '4', label: 'Slot 4' },
          { value: '5', label: 'Slot 5' },
          { value: '6', label: 'Slot 6' },
        ],
        required: true,
      },
      tip_start_position: {
        type: 'string',
        label: 'Starting Tip Position',
        description: 'Initial tip position (e.g., A1, B5)',
        defaultValue: 'A1',
        required: true,
      },
      reuse_tips: {
        type: 'boolean',
        label: 'Reuse Tips',
        description: 'Reuse tips for multiple transfers',
        defaultValue: false,
        required: false,
      },
    }
  },
};

const primitiveOperations = [
  'initialize_robot',
  'home_robot',
  'enable_lights',
  'load_labware',
  'load_pipette',
  'pick_up_tip',
  'aspirate_solution',
  'move_to_target',
  'dispense_solution',
  'blowout',
  'drop_tip',
  'cleanup_robot',
];

export const OT2Node: React.FC<NodeProps> = (props) => {
  return (
    <BaseUONode
      {...props}
      data={{
        ...props.data,
        label: 'OT2 Liquid Handling',
        nodeType: 'ot2_liquid_handling',
        category: 'ot2',
        description: 'Automated liquid handling using OpenTrons OT2 robot',
        parameterGroups,
        primitiveOperations,
        onDataChange: (data) => {
          if (props.data.onDataChange) {
            props.data.onDataChange(data);
          }
        },
      }}
    />
  );
}; 
