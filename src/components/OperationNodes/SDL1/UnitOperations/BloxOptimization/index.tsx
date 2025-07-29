import React from 'react';
import { BaseUONode } from '../../BaseUONode';
import { UONodeConfig } from '../../types';
import { DEFAULT_VALUES, PARAMETER_GROUPS, PRIMITIVE_OPERATIONS } from './constants';
import { BloxOptimizationMeta } from './meta';

export const BloxOptimizationNode: React.FC<{ id: string; data: any }> = ({ id, data }) => {
  const nodeConfig: UONodeConfig = {
    nodeType: 'sdl1BloxOptimization',
    displayName: 'Blox Optimization',
    category: 'SDL1',
    description: 'Multi-objective Bayesian optimization using Blox framework for autonomous experimental design and parameter optimization',
    
    // Enhanced metadata
    version: '1.0.0',
    author: 'SDL1 Team',
    tags: ['optimization', 'bayesian', 'multi-objective', 'autonomous', 'blox'],
    
    // Technical specifications
    inputPorts: [
      {
        id: 'experiment_results',
        label: 'Experiment Results',
        type: 'data',
        description: 'Results from completed experiments for model updating'
      },
      {
        id: 'initial_parameters',
        label: 'Initial Parameters',
        type: 'parameters',
        description: 'Initial parameter space definition (optional)'
      }
    ],
    
    outputPorts: [
      {
        id: 'next_parameters',
        label: 'Next Parameters',
        type: 'parameters',
        description: 'Optimized parameters for next experiment'
      },
      {
        id: 'optimization_state',
        label: 'Optimization State',
        type: 'data',
        description: 'Current optimization state and convergence metrics'
      },
      {
        id: 'pareto_front',
        label: 'Pareto Front',
        type: 'data',
        description: 'Current Pareto-optimal solutions'
      }
    ],
    
    // Hardware and software compatibility
    hardwareRequirements: {
      minMemory: '4GB',
      minCPU: '2 cores',
      recommendedMemory: '8GB',
      recommendedCPU: '4 cores',
      gpuAcceleration: 'optional',
      specialHardware: []
    },
    
    softwareRequirements: {
      python: '>=3.8',
      packages: [
        'botorch>=0.8.0',
        'gpytorch>=1.9.0',
        'torch>=1.12.0',
        'numpy>=1.21.0',
        'pandas>=1.3.0',
        'scipy>=1.7.0',
        'scikit-learn>=1.0.0'
      ],
      operatingSystem: ['Windows', 'macOS', 'Linux'],
      additionalSoftware: []
    },
    
    // Execution environment
    executionEnvironment: {
      containerized: true,
      distributed: false,
      cloudCompatible: true,
      edgeCompatible: true
    },
    
    // Safety and constraints
    safetyLevel: 'medium',
    constraints: [
      'Requires valid experimental data for model training',
      'Parameter space must be properly defined',
      'Objectives must be extractable from experimental data',
      'Convergence criteria should be realistic for problem complexity'
    ],
    
    // Default configuration
    defaultParameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS,
    
    // Execution and control
    estimatedDuration: {
      min: 10,
      max: 3600,
      unit: 'seconds',
      factors: ['Number of iterations', 'Model complexity', 'Data size']
    },
    
    // Data handling
    dataInputs: [
      {
        name: 'experiment_results',
        type: 'json',
        description: 'Experimental results with objectives',
        required: false
      }
    ],
    
    dataOutputs: [
      {
        name: 'parameter_proposals',
        type: 'csv',
        description: 'Proposed parameters for next experiments'
      },
      {
        name: 'optimization_history',
        type: 'json',
        description: 'Complete optimization history and model state'
      },
      {
        name: 'pareto_solutions',
        type: 'json',
        description: 'Current Pareto-optimal solutions'
      }
    ],
    
    // Integration capabilities
    integrationPoints: [
      {
        type: 'input',
        source: 'DataExport',
        description: 'Receives experimental results for model updating'
      },
      {
        type: 'output',
        target: 'ExperimentSetup',
        description: 'Provides optimized parameters for next experiments'
      },
      {
        type: 'bidirectional',
        target: 'SequenceControl',
        description: 'Coordinates with sequence control for optimization loops'
      }
    ],
    
    // Validation and quality control
    validationRules: [
      {
        parameter: 'max_iterations',
        rule: 'Must be greater than initial_samples',
        severity: 'error'
      },
      {
        parameter: 'convergence_threshold',
        rule: 'Should be appropriate for problem scale',
        severity: 'warning'
      },
      {
        parameter: 'batch_size',
        rule: 'Should not exceed available computational resources',
        severity: 'warning'
      }
    ],
    
    // Documentation and help
    documentation: {
      overview: 'Multi-objective Bayesian optimization controller using the Blox framework for autonomous experimental design',
      detailedDescription: `
        The Blox Optimization node implements state-of-the-art multi-objective Bayesian optimization
        for autonomous experimental design. It uses Gaussian Process surrogate models to learn from
        experimental data and propose optimal parameter combinations for future experiments.
        
        Key features:
        - Multi-objective optimization with Pareto front discovery
        - Constraint handling for experimental feasibility
        - Real-time model updating as new data arrives
        - Integration with SDL1 workflow for closed-loop optimization
        - Support for categorical and continuous parameters
        - Uncertainty quantification for robust decision making
      `,
      usageInstructions: [
        '1. Define parameter space with categorical additives (A-G)',
        '2. Configure objective functions (capacity, efficiency, stability)',
        '3. Set optimization strategy and convergence criteria',
        '4. Connect to experiment workflow for closed-loop operation',
        '5. Monitor optimization progress and Pareto front evolution'
      ],
      troubleshooting: [
        'If convergence is slow, try reducing exploration_weight',
        'For noisy objectives, enable uncertainty_quantification',
        'Check constraint feasibility if no valid proposals generated',
        'Increase initial_samples for complex parameter spaces'
      ]
    },
    
    // Metadata for the node system
    metadata: BloxOptimizationMeta
  };

  return (
    <BaseUONode
      id={id}
      data={{
        ...data,
        ...nodeConfig,
        parameters: { ...nodeConfig.defaultParameters, ...data.parameters }
      }}
    />
  );
};

// Export configuration for the node registry
export const bloxOptimizationNodeConfig = {
  type: 'sdl1BloxOptimization',
  displayName: 'Blox Optimization',
  category: 'SDL1',
  description: 'Multi-objective Bayesian optimization using Blox framework',
  component: BloxOptimizationNode,
  defaultData: {
    label: 'Blox Optimization',
    nodeType: 'sdl1BloxOptimization',
    category: 'SDL1',
    parameters: DEFAULT_VALUES,
    parameterGroups: PARAMETER_GROUPS,
    primitiveOperations: PRIMITIVE_OPERATIONS
  }
};

export default BloxOptimizationNode;
