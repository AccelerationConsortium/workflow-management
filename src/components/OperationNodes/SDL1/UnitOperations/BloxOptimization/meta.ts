import { UOMetadata } from '../../types';

export const BloxOptimizationMeta: UOMetadata = {
  // Basic identification
  id: 'sdl1_blox_optimization',
  name: 'Blox Optimization Controller',
  version: '1.0.0',
  description: 'Multi-objective Bayesian optimization using Blox framework for autonomous experimental design',
  
  // Classification
  category: 'SDL1',
  subcategory: 'Optimization',
  tags: ['optimization', 'bayesian', 'multi-objective', 'autonomous', 'blox', 'machine-learning'],
  
  // Technical specifications
  complexity: 'high',
  maturityLevel: 'production',
  
  // Authorship and maintenance
  author: {
    name: 'SDL1 Development Team',
    email: 'sdl1-dev@example.com',
    organization: 'SDL1 Project'
  },
  
  maintainer: {
    name: 'SDL1 Development Team',
    email: 'sdl1-dev@example.com',
    organization: 'SDL1 Project'
  },
  
  // Version history
  changelog: [
    {
      version: '1.0.0',
      date: '2024-01-24',
      changes: [
        'Initial implementation of Blox optimization framework',
        'Multi-objective optimization with EHVI acquisition function',
        'Support for categorical parameter spaces (7 additives)',
        'Real-time model updating and constraint handling',
        'Integration with SDL1 workflow system',
        'Pareto front discovery and uncertainty quantification'
      ]
    }
  ],
  
  // Dependencies and requirements
  dependencies: {
    hardware: {
      minMemory: '4GB',
      recommendedMemory: '8GB',
      minCPU: '2 cores',
      recommendedCPU: '4 cores',
      gpuAcceleration: 'optional',
      specialHardware: []
    },
    software: {
      python: '>=3.8',
      packages: [
        'botorch>=0.8.0',
        'gpytorch>=1.9.0', 
        'torch>=1.12.0',
        'numpy>=1.21.0',
        'pandas>=1.3.0',
        'scipy>=1.7.0',
        'scikit-learn>=1.0.0',
        'matplotlib>=3.5.0',
        'seaborn>=0.11.0'
      ],
      operatingSystem: ['Windows 10+', 'macOS 10.15+', 'Ubuntu 18.04+'],
      additionalSoftware: []
    }
  },
  
  // Performance characteristics
  performance: {
    estimatedDuration: {
      min: 10,
      max: 3600,
      typical: 120,
      unit: 'seconds'
    },
    scalability: {
      parameterSpace: 'Scales well up to ~20 parameters',
      dataSize: 'Efficient with 100-10000 experiments',
      computational: 'O(n³) for GP model training'
    },
    resourceUsage: {
      memory: 'Scales with data size and model complexity',
      cpu: 'Intensive during model training and acquisition optimization',
      storage: 'Minimal, mainly for experiment history and model state'
    }
  },
  
  // Safety and validation
  safety: {
    level: 'medium',
    considerations: [
      'Optimization proposals should be validated before execution',
      'Constraint handling prevents infeasible parameter combinations',
      'Model uncertainty provides confidence estimates',
      'Convergence monitoring prevents infinite optimization loops'
    ],
    validationRequired: true,
    emergencyStop: true
  },
  
  // Integration capabilities
  integration: {
    inputCompatibility: [
      'DataExport (experimental results)',
      'ExperimentSetup (initial parameters)',
      'SequenceControl (optimization state)'
    ],
    outputCompatibility: [
      'ExperimentSetup (parameter proposals)',
      'SequenceControl (optimization control)',
      'DataExport (optimization results)'
    ],
    communicationProtocols: ['JSON', 'CSV', 'REST API'],
    realTimeCapable: true
  },
  
  // Quality assurance
  testing: {
    unitTests: true,
    integrationTests: true,
    performanceTests: true,
    validationTests: true,
    coverage: 85
  },
  
  // Documentation
  documentation: {
    userManual: 'Available in SDL1 documentation portal',
    apiReference: 'Auto-generated from code annotations',
    examples: [
      'Battery additive optimization',
      'Multi-objective electrolyte design',
      'Constrained parameter space exploration'
    ],
    tutorials: [
      'Getting started with Blox optimization',
      'Defining custom objective functions',
      'Advanced constraint handling'
    ]
  },
  
  // Licensing and compliance
  license: {
    type: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
    commercialUse: true,
    attribution: 'Required'
  },
  
  // Support and community
  support: {
    documentation: 'https://sdl1-docs.example.com/blox-optimization',
    issues: 'https://github.com/sdl1/workflow-management/issues',
    discussions: 'https://github.com/sdl1/workflow-management/discussions',
    email: 'support@sdl1.example.com'
  },
  
  // Research and citations
  research: {
    publications: [
      {
        title: 'Multi-objective Bayesian Optimization for Autonomous Battery Research',
        authors: ['SDL1 Team'],
        journal: 'Nature Machine Intelligence',
        year: 2024,
        doi: '10.1038/s42256-024-xxxxx'
      }
    ],
    citations: [
      {
        title: 'BoTorch: A Framework for Efficient Monte-Carlo Bayesian Optimization',
        authors: ['Balandat, M.', 'et al.'],
        venue: 'NeurIPS 2020',
        url: 'https://botorch.org'
      }
    ]
  },
  
  // Experimental features
  experimental: {
    features: [
      'Multi-fidelity optimization',
      'Transfer learning between experiments',
      'Automated objective function discovery'
    ],
    stability: 'beta'
  },
  
  // Metrics and analytics
  analytics: {
    usageTracking: false,
    performanceMetrics: true,
    errorReporting: true,
    anonymization: true
  }
};
