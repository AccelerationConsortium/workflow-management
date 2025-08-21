// DeckPlanner UO Metadata
import { 
  DECK_PLANNER_NODE_TYPE, 
  DECK_PLANNER_DISPLAY_NAME, 
  DECK_PLANNER_DESCRIPTION,
  DECK_PLANNER_CATEGORY,
  DECK_PLANNER_PARAMETERS,
  DECK_PLANNER_DEFAULT_VALUES
} from './constants';

export const DECK_PLANNER_META = {
  type: DECK_PLANNER_NODE_TYPE,
  displayName: DECK_PLANNER_DISPLAY_NAME,
  description: DECK_PLANNER_DESCRIPTION,
  category: DECK_PLANNER_CATEGORY,
  
  parameters: DECK_PLANNER_PARAMETERS,
  defaultValues: DECK_PLANNER_DEFAULT_VALUES,
  
  // Node appearance
  style: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
    color: '#1565C0'
  },
  
  // Input/Output handles
  inputs: [
    {
      id: 'runtime_context',
      label: 'Runtime Context',
      type: 'runtimeContext',
      required: false
    },
    {
      id: 'deck_spec',
      label: 'Deck Specification', 
      type: 'deckSpec',
      required: false
    }
  ],
  
  outputs: [
    {
      id: 'binding_map',
      label: 'Binding Map',
      type: 'bindingMap'
    },
    {
      id: 'validation_results',
      label: 'Validation Results',
      type: 'validationResults'
    },
    {
      id: 'deck_session',
      label: 'Deck Session',
      type: 'deckSession'
    }
  ],
  
  // Tags for filtering
  tags: [
    'planning',
    'deck',
    'labware',
    'automation',
    'optimization',
    'validation'
  ],
  
  // Version info
  version: '1.0.0',
  author: 'Workflow Management Team',
  
  // Help documentation
  helpUrl: '/docs/deck-planner',
  
  // Execution info
  executionMode: 'sync',
  estimatedDuration: '1-10s',
  
  // Resource requirements
  resources: {
    cpu: 'medium',
    memory: 'low',
    storage: 'minimal'
  },
  
  // Feature flags
  features: {
    visualization: true,
    caching: true,
    validation: true,
    migration: true
  }
};