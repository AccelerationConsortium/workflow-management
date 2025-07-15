import './styles.css';

// Import all Unit Operations
import {
  PrepareAndInjectHPLCSampleNode,
  PrepareAndInjectHPLCSampleForm,
  prepareAndInjectHPLCSampleNodeConfig,
} from './UnitOperations/PrepareAndInjectHPLCSample';

import {
  RunExtractionAndTransferToHPLCNode,
  RunExtractionAndTransferToHPLCForm,
  runExtractionAndTransferToHPLCNodeConfig,
} from './UnitOperations/RunExtractionAndTransferToHPLC';

import {
  DeckInitializationNode,
  DeckInitializationForm,
  deckInitializationNodeConfig,
} from './UnitOperations/DeckInitialization';

import {
  AddSolventToSampleVialNode,
  AddSolventToSampleVialForm,
  addSolventToSampleVialNodeConfig,
} from './UnitOperations/AddSolventToSampleVial';

// Export node components for React Flow
export const SDL7Nodes = {
  sdl7PrepareAndInjectHPLCSample: PrepareAndInjectHPLCSampleNode,
  sdl7RunExtractionAndTransferToHPLC: RunExtractionAndTransferToHPLCNode,
  sdl7DeckInitialization: DeckInitializationNode,
  sdl7AddSolventToSampleVial: AddSolventToSampleVialNode,
};

// Export forms for standalone usage
export const SDL7Forms = {
  PrepareAndInjectHPLCSample: PrepareAndInjectHPLCSampleForm,
  RunExtractionAndTransferToHPLC: RunExtractionAndTransferToHPLCForm,
  DeckInitialization: DeckInitializationForm,
  AddSolventToSampleVial: AddSolventToSampleVialForm,
};

// Export node configurations for sidebar
export const SDL7NodeConfigs = [
  prepareAndInjectHPLCSampleNodeConfig,
  runExtractionAndTransferToHPLCNodeConfig,
  deckInitializationNodeConfig,
  addSolventToSampleVialNodeConfig,
];

// Export types
export * from './types';