import { Node, Edge } from 'reactflow';

export const demoWorkflow = {
  nodes: [
    {
      id: '1',
      type: 'prepareElectrolyte',
      position: { x: 100, y: 100 },
      data: {
        label: 'Prepare Electrolyte',
        parameters: [
          { name: 'concentration', value: 1.0, unit: 'mol/L' },
          { name: 'volume', value: 100, unit: 'mL' }
        ]
      }
    },
    {
      id: '2',
      type: 'mixSolution',
      position: { x: 300, y: 100 },
      data: {
        label: 'Mix Solution',
        parameters: [
          { name: 'speed', value: 500, unit: 'rpm' },
          { name: 'time', value: 30, unit: 'min' }
        ]
      }
    },
    // Add more nodes as needed...
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default'
    }
  ]
}; 