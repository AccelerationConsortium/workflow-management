import { ChartOptions } from 'chart.js';

export interface VisualizationTemplate {
  id: string;
  name: string;
  type: 'chart' | 'gauge' | 'timeline';
  dataMapping: {
    x?: string;
    y?: string;
    color?: string;
    size?: string;
  };
  config: ChartOptions;
  description: string;
  applicableTypes: string[];
}

export class VisualizationTemplateService {
  private readonly templates: VisualizationTemplate[] = [
    {
      id: 'temp-time',
      name: 'Temperature vs Time',
      type: 'chart',
      dataMapping: {
        x: 'time',
        y: 'temperature'
      },
      config: {
        type: 'line',
        options: {
          scales: {
            y: { title: { text: 'Temperature (°C)' } },
            x: { title: { text: 'Time (min)' } }
          }
        }
      },
      description: 'Monitor temperature changes over time',
      applicableTypes: ['heating', 'cooling', 'reaction']
    },
    {
      id: 'speed-gauge',
      name: 'Speed Monitor',
      type: 'gauge',
      dataMapping: {
        value: 'speed'
      },
      config: {
        min: 0,
        max: 1000,
        zones: [
          { value: 300, color: 'green' },
          { value: 700, color: 'yellow' },
          { value: 1000, color: 'red' }
        ]
      },
      description: 'Real-time speed monitoring with zones',
      applicableTypes: ['mixing', 'stirring']
    }
  ];

  getTemplates(): VisualizationTemplate[] {
    return this.templates;
  }

  getTemplatesForNode(nodeType: string): VisualizationTemplate[] {
    return this.templates.filter(t => 
      t.applicableTypes.includes(nodeType)
    );
  }

  applyTemplate(
    template: VisualizationTemplate,
    data: Record<string, any>[]
  ): Record<string, any> {
    const mappedData = data.map(item => {
      const result: Record<string, any> = {};
      for (const [key, field] of Object.entries(template.dataMapping)) {
        if (field && item[field] !== undefined) {
          result[key] = item[field];
        }
      }
      return result;
    });

    return {
      ...template.config,
      data: mappedData
    };
  }
} 