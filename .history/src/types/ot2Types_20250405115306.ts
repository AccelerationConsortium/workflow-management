import { Parameter } from './workflow';

export type PipetteMount = 'left' | 'right';
export type OffsetStartPosition = 'top' | 'bottom' | 'center';
export type TipReuseStrategy = 'single_use' | 'reuse_sequence' | 'reuse_batch';

export interface BasicConfig {
    robotIP: string;
    pipetteName: string;
    pipetteMount: PipetteMount;
}

export interface LabwareSlot {
    slotNumber: number;
    labwareType: string;
    labwareName: string;
    isCustom: boolean;
    customDefinitionPath?: string;
}

export interface LabwareConfig {
    labwareSlots: LabwareSlot[];
}

export interface LiquidHandlingConfig {
    sourceLabware: string;
    sourceWell: string;
    destinationLabware: string;
    destinationWell: string;
    volume: number;
    flowRate: number;
    mixingCycles?: number;
    blowoutLocation?: string;
}

export interface PositionConfig {
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    moveSpeed: number;
    offsetStart: OffsetStartPosition;
}

export interface TipConfig {
    tipRackLabware: string;
    tipLocation: string;
    tipType: string;
    reuseStrategy: TipReuseStrategy;
}

export interface OT2Parameters {
    basic: BasicConfig;
    labware: LabwareConfig;
    liquidHandling: LiquidHandlingConfig;
    position: PositionConfig;
    tipManagement: TipConfig;
}

// OT2 节点的参数定义
export const OT2_PARAMETERS: Parameter[] = [
    // 基础配置
    {
        name: 'robotIP',
        label: 'Robot IP',
        type: 'string',
        default: '169.254.1.1'
    },
    {
        name: 'pipetteName',
        label: 'Pipette Type',
        type: 'select',
        options: ['p1000_single_gen2', 'p300_single_gen2', 'p20_single_gen2'],
        default: 'p1000_single_gen2'
    },
    {
        name: 'pipetteMount',
        label: 'Pipette Mount',
        type: 'select',
        options: ['left', 'right'],
        default: 'right'
    },
    
    // Labware 配置
    {
        name: 'labwareSlots',
        label: 'Labware Configuration',
        type: 'select',
        options: Array.from({length: 11}, (_, i) => `Slot ${i + 1}`),
        default: 'Slot 1'
    },
    {
        name: 'labwareType',
        label: 'Labware Type',
        type: 'select',
        options: ['opentrons_96_tiprack_1000ul', 'opentrons_24_tuberack_generic_2ml_screwcap', 'custom'],
        default: 'opentrons_96_tiprack_1000ul'
    },
    
    // 液体操作配置
    {
        name: 'volume',
        label: 'Volume (µL)',
        type: 'number',
        default: 100,
        unit: 'µL',
        constraints: {
            min: 0,
            max: 1000
        }
    },
    {
        name: 'flowRate',
        label: 'Flow Rate',
        type: 'number',
        default: 1,
        unit: 'µL/s',
        constraints: {
            min: 0.1,
            max: 10
        }
    },
    {
        name: 'mixingCycles',
        label: 'Mixing Cycles',
        type: 'number',
        default: 0,
        constraints: {
            min: 0,
            max: 10
        }
    },
    
    // 位置配置
    {
        name: 'offsetX',
        label: 'X Offset',
        type: 'number',
        default: 0,
        unit: 'mm',
        constraints: {
            min: -5,
            max: 5
        }
    },
    {
        name: 'offsetY',
        label: 'Y Offset',
        type: 'number',
        default: 0,
        unit: 'mm',
        constraints: {
            min: -5,
            max: 5
        }
    },
    {
        name: 'offsetZ',
        label: 'Z Offset',
        type: 'number',
        default: 0,
        unit: 'mm',
        constraints: {
            min: -5,
            max: 5
        }
    },
    {
        name: 'moveSpeed',
        label: 'Move Speed',
        type: 'number',
        default: 100,
        unit: 'mm/s',
        constraints: {
            min: 1,
            max: 400
        }
    },
    
    // 吸头管理配置
    {
        name: 'tipReuseStrategy',
        label: 'Tip Reuse Strategy',
        type: 'select',
        options: ['single_use', 'reuse_sequence', 'reuse_batch'],
        default: 'single_use'
    }
]; 
