# SDL2 Workflow Implementation Guide

This document provides detailed specifications for implementing the SDL2 workflow, which consists of four unit operations: Compound Preparation, Electrochemical Measurement, Cleaning, and Data Analysis.

## Table of Contents

1. [Overview](#overview)
2. [Hardware Structure](#hardware-structure)
3. [Experimental Process](#experimental-process)
4. [Software Architecture](#software-architecture)
5. [Unit Operations](#unit-operations)
6. [Implementation Plan](#implementation-plan)

## Overview

The SDL2 workflow is designed for electrochemical experiments involving compound preparation, measurement, cleaning, and data analysis. This document outlines the implementation details for integrating this workflow into the system.

## Hardware Structure

The experimental setup consists of:

- **Pump Control System**:
  - Connected to multiple input solutions: metal salts, ligands, buffers
  - Output paths to: mixing container, electrochemical cell, or waste
- **Mixing Area**:
  - Used for compound preparation by mixing metal + ligand + buffer
- **Electrochemical Cell**:
  - Used for potential step type electrochemical measurements
  - Electrode data transmitted back to the control computer via D/A interface
- **Waste Outlet**:
  - For disposal of all liquids after experiments or during cleaning
- **Control Computer**:
  - Connected to all devices, responsible for task scheduling and result collection
  - Controls pump movement and Biologic instruments via REST API

## Experimental Process

### Step 1: Compound Preparation
- Input JSON file specifying:
  - Metal type
  - Ligand type
  - Buffer1/Buffer2 selection and volume
- Pump automatically executes liquid addition tasks, mixing compounds in the intermediate container

### Step 2: Electrochemical Measurement
- Compound is pumped into the electrochemical cell
- Voltage program (potential step) is activated
- Biologic device begins measurement, data saved as .csv format

### Step 3: Cleaning
- Pump controls discharge of liquid from electrochemical cell to waste container
- Cleaning is an independent operation with a fixed process

## Software Architecture

### REST API Control Structure
- FastAPI implementation:
  - POST /execute: Pass JSON parameters for the experiment
  - System returns a UUID, task enters execution queue
  - GET /status/{UUID}: Poll status, check if task is complete
  - Status updated to "completed" after data is written to database

### Database Structure (PostgreSQL)
- Each task stores:
  - uuid
  - function_type (e.g., mixing, measurement, cleaning)
  - input_params (e.g., ligand type, volume)
  - output_result (e.g., maximum voltage, maximum current)
  - timestamp
- Future additions:
  - Metadata (instrument number, operator, temperature)
  - CSV file path or parsed data results

## Unit Operations

The SDL2 workflow consists of four unit operations:

1. **Compound Preparation**
2. **Electrochemical Measurement**
3. **Cleaning**
4. **Data Analysis**

### 1. Compound Preparation

**Parameters:**

```typescript
const parameters = {
  metal: {
    type: 'string',
    label: 'Metal Salt Type',
    description: 'Select the metal salt to use',
    required: true,
    options: ['Cu', 'Fe', 'Ni', 'Co', 'Zn'],
    defaultValue: 'Cu'
  },
  metalVolume: {
    type: 'number',
    label: 'Metal Salt Volume',
    unit: 'mL',
    description: 'Volume of metal salt solution',
    min: 0.1,
    max: 10.0,
    defaultValue: 1.0,
    required: true
  },
  metalConcentration: {
    type: 'number',
    label: 'Metal Salt Concentration',
    unit: 'mM',
    description: 'Concentration of metal salt solution',
    min: 0.1,
    max: 100.0,
    defaultValue: 10.0,
    required: true
  },
  ligand: {
    type: 'string',
    label: 'Ligand Type',
    description: 'Select the ligand to use',
    required: true,
    options: ['EDTA', 'Bipyridine', 'Phenanthroline', 'Porphyrin'],
    defaultValue: 'EDTA'
  },
  ligandVolume: {
    type: 'number',
    label: 'Ligand Volume',
    unit: 'mL',
    description: 'Volume of ligand solution',
    min: 0.1,
    max: 10.0,
    defaultValue: 1.0,
    required: true
  },
  ligandConcentration: {
    type: 'number',
    label: 'Ligand Concentration',
    unit: 'mM',
    description: 'Concentration of ligand solution',
    min: 0.1,
    max: 100.0,
    defaultValue: 10.0,
    required: true
  },
  bufferType: {
    type: 'string',
    label: 'Buffer Type',
    description: 'Select the buffer to use',
    required: true,
    options: ['buffer1', 'buffer2'],
    defaultValue: 'buffer1'
  },
  bufferVolume: {
    type: 'number',
    label: 'Buffer Volume',
    unit: 'mL',
    description: 'Volume of buffer',
    min: 0.1,
    max: 20.0,
    defaultValue: 5.0,
    required: true
  },
  mixingTime: {
    type: 'number',
    label: 'Mixing Time',
    unit: 's',
    description: 'Time to mix the solution',
    min: 5,
    max: 300,
    defaultValue: 30,
    required: true
  },
  outputDestination: {
    type: 'string',
    label: 'Output Destination',
    description: 'Destination for the mixed solution',
    required: true,
    options: ['Mixing Container', 'Electrochemical Cell', 'Waste'],
    defaultValue: 'Mixing Container'
  }
};
```

### 2. Electrochemical Measurement

**Parameters:**

```typescript
const parameters = {
  measurementType: {
    type: 'string',
    label: 'Measurement Type',
    description: 'Type of electrochemical measurement',
    required: true,
    options: ['Potential Step', 'Cyclic Voltammetry', 'Chronoamperometry'],
    defaultValue: 'Potential Step'
  },
  startPotential: {
    type: 'number',
    label: 'Start Potential',
    unit: 'V',
    description: 'Starting potential for measurement',
    min: -2.0,
    max: 2.0,
    defaultValue: 0.0,
    required: true
  },
  endPotential: {
    type: 'number',
    label: 'End Potential',
    unit: 'V',
    description: 'Ending potential for measurement',
    min: -2.0,
    max: 2.0,
    defaultValue: 1.0,
    required: true
  },
  scanRate: {
    type: 'number',
    label: 'Scan Rate',
    unit: 'mV/s',
    description: 'Rate of potential scanning',
    min: 1,
    max: 1000,
    defaultValue: 100,
    required: true
  },
  sampleInterval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time interval for data sampling',
    min: 0.01,
    max: 10.0,
    defaultValue: 0.1,
    required: true
  },
  duration: {
    type: 'number',
    label: 'Measurement Duration',
    unit: 's',
    description: 'Total duration of measurement',
    min: 1,
    max: 3600,
    defaultValue: 60,
    required: true
  },
  electrodeType: {
    type: 'string',
    label: 'Electrode Type',
    description: 'Type of electrode used',
    required: true,
    options: ['Glassy Carbon', 'Platinum', 'Gold', 'Silver/Silver Chloride'],
    defaultValue: 'Glassy Carbon'
  },
  referenceElectrode: {
    type: 'string',
    label: 'Reference Electrode',
    description: 'Reference electrode used',
    required: true,
    options: ['Ag/AgCl', 'SCE', 'Hg/HgO', 'Hg/Hg2SO4'],
    defaultValue: 'Ag/AgCl'
  },
  saveDataPath: {
    type: 'string',
    label: 'Data Save Path',
    description: 'Path to save measurement data',
    required: true,
    defaultValue: './data/measurements/'
  }
};
```

### 3. Cleaning

**Parameters:**

```typescript
const parameters = {
  cleaningAgent: {
    type: 'string',
    label: 'Cleaning Agent',
    description: 'Solution used for cleaning',
    required: true,
    options: ['Deionized Water', 'Ethanol', 'Acetone', 'Dilute HCl'],
    defaultValue: 'Deionized Water'
  },
  cleaningVolume: {
    type: 'number',
    label: 'Cleaning Volume',
    unit: 'mL',
    description: 'Volume of cleaning solution',
    min: 1.0,
    max: 50.0,
    defaultValue: 10.0,
    required: true
  },
  cleaningCycles: {
    type: 'number',
    label: 'Cleaning Cycles',
    description: 'Number of cleaning repetitions',
    min: 1,
    max: 10,
    defaultValue: 3,
    required: true
  },
  flowRate: {
    type: 'number',
    label: 'Flow Rate',
    unit: 'mL/min',
    description: 'Flow rate of cleaning solution',
    min: 0.1,
    max: 10.0,
    defaultValue: 2.0,
    required: true
  },
  dryingTime: {
    type: 'number',
    label: 'Drying Time',
    unit: 's',
    description: 'Time for drying after cleaning',
    min: 0,
    max: 300,
    defaultValue: 60,
    required: false
  },
  cleaningTarget: {
    type: 'string',
    label: 'Cleaning Target',
    description: 'Part of the system to clean',
    required: true,
    options: ['Electrochemical Cell', 'Mixing Container', 'Entire System'],
    defaultValue: 'Entire System'
  }
};
```

### 4. Data Analysis

**Parameters:**

```typescript
const parameters = {
  dataSource: {
    type: 'string',
    label: 'Data Source',
    description: 'Path to data file for analysis',
    required: true,
    defaultValue: ''
  },
  analysisType: {
    type: 'string',
    label: 'Analysis Type',
    description: 'Type of analysis to perform',
    required: true,
    options: ['Peak Analysis', 'Kinetic Analysis', 'Impedance Analysis', 'Stability Analysis'],
    defaultValue: 'Peak Analysis'
  },
  smoothingFactor: {
    type: 'number',
    label: 'Smoothing Factor',
    description: 'Intensity of data smoothing',
    min: 0,
    max: 1,
    defaultValue: 0.2,
    required: false
  },
  baselineCorrectionMethod: {
    type: 'string',
    label: 'Baseline Correction Method',
    description: 'Method for baseline correction',
    required: false,
    options: ['Linear', 'Polynomial', 'Moving Average', 'None'],
    defaultValue: 'Linear'
  },
  peakDetectionThreshold: {
    type: 'number',
    label: 'Peak Detection Threshold',
    description: 'Sensitivity threshold for peak detection',
    min: 0.01,
    max: 1.0,
    defaultValue: 0.1,
    required: false
  },
  exportFormat: {
    type: 'string',
    label: 'Export Format',
    description: 'Format for exporting analysis results',
    required: true,
    options: ['CSV', 'JSON', 'Excel', 'PDF'],
    defaultValue: 'CSV'
  },
  saveResultsPath: {
    type: 'string',
    label: 'Results Save Path',
    description: 'Path to save analysis results',
    required: true,
    defaultValue: './data/results/'
  },
  generatePlots: {
    type: 'boolean',
    label: 'Generate Plots',
    description: 'Whether to generate analysis plots',
    required: false,
    defaultValue: true
  }
};
```

## Implementation Plan

### 1. Directory Structure

Create the following directory structure:

```
src/
└── components/
    └── OperationNodes/
        └── SDL2/
            ├── README.md
            ├── index.ts
            ├── types.ts
            ├── BaseUONode.tsx
            ├── CompoundPreparation/
            │   ├── index.tsx
            │   ├── constants.ts
            │   ├── types.ts
            │   └── styles.css
            ├── ElectrochemicalMeasurement/
            │   ├── index.tsx
            │   ├── constants.ts
            │   ├── types.ts
            │   └── styles.css
            ├── Cleaning/
            │   ├── index.tsx
            │   ├── constants.ts
            │   ├── types.ts
            │   └── styles.css
            └── DataAnalysis/
                ├── index.tsx
                ├── constants.ts
                ├── types.ts
                └── styles.css
```

### 2. Backend API Structure

Create the following API routes:

```
src/
└── app/
    └── api/
        └── sdl2/
            ├── node/
            │   └── route.ts
            └── nodes/
                └── [nodeId]/
                    └── route.ts
```

### 3. Backend Implementation

Create the following backend structure:

```
backend/
└── sdl2/
    ├── __init__.py
    ├── config/
    │   └── uo_function_map.yaml
    ├── primitives/
    │   ├── __init__.py
    │   ├── compound_preparation.py
    │   ├── electrochemical_measurement.py
    │   ├── cleaning.py
    │   └── data_analysis.py
    └── utils/
        └── helpers.py
```

### 4. System Registration

Update the necessary system files to register the SDL2 workflow and its unit operations.

### 5. Testing

Develop comprehensive tests for each unit operation and the complete workflow.

### 6. Documentation

Create detailed documentation for users and developers on how to use the SDL2 workflow.
