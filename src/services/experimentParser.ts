import { OperationNode } from '../types/workflow';

interface ExperimentPlan {
  title: string;
  suggestedNodes: OperationNode[];
  estimatedDuration: number;
}

// Simple template-based parser (can be replaced with LLM later)
export const experimentParser = {
  parseDescription: (description: string): ExperimentPlan => {
    const keywords = description.toLowerCase();
    const suggestedNodes: OperationNode[] = [];
    
    // Template matching for test nodes
    if (keywords.includes('electrolyte') || keywords.includes('solution')) {
      suggestedNodes.push({
        type: 'prepareElectrolyte',
        label: 'Prepare Electrolyte',
        category: 'Test',
        description: 'Prepare electrolyte solution',
        parameters: [
          { name: 'concentration', label: 'Concentration', type: 'number', unit: 'mol/L' },
          { name: 'volume', label: 'Volume', type: 'number', unit: 'mL' }
        ]
      });
    }

    if (keywords.includes('mix') || keywords.includes('mixing')) {
      suggestedNodes.push({
        type: 'mixSolution',
        label: 'Mix Solution',
        category: 'Test',
        description: 'Mix multiple solutions',
        parameters: [
          { name: 'speed', label: 'Mixing Speed', type: 'number', unit: 'rpm' },
          { name: 'time', label: 'Mixing Time', type: 'number', unit: 'min' }
        ]
      });
    }

    // Add more template matching as needed...

    return {
      title: 'Generated Workflow',
      suggestedNodes,
      estimatedDuration: suggestedNodes.length * 15 // Simple duration estimation
    };
  }
}; 