export interface UOTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeType: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  parameters: Record<string, any>;
  primitiveOperations: any[];
  metadata: {
    usageCount: number;
    lastUsed?: Date;
    isPublic: boolean;
    isStandard: boolean; // For SOPs
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration?: number; // in minutes
    requiredEquipment?: string[];
    safetyNotes?: string[];
  };
  exportData?: {
    fileName: string;
    exportedAt: Date;
    format: 'json' | 'yaml';
  };
}

export interface TemplateFilter {
  category?: string;
  nodeType?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPublic?: boolean;
  isStandard?: boolean;
  searchTerm?: string;
}

export class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, UOTemplate> = new Map();
  private storageKey = 'workflow-templates';

  private constructor() {
    this.loadTemplates();
    this.initializeDefaultTemplates();
  }

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  // Load templates from localStorage
  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const templates: UOTemplate[] = JSON.parse(stored);
        templates.forEach(template => {
          // Convert date strings back to Date objects
          template.createdAt = new Date(template.createdAt);
          template.updatedAt = new Date(template.updatedAt);
          if (template.metadata.lastUsed) {
            template.metadata.lastUsed = new Date(template.metadata.lastUsed);
          }
          this.templates.set(template.id, template);
        });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  // Save templates to localStorage
  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  // Initialize default templates for common operations
  private initializeDefaultTemplates(): void {
    if (this.templates.size === 0) {
      const defaultTemplates: Partial<UOTemplate>[] = [
        {
          name: 'Basic HPLC Analysis',
          description: 'Standard HPLC sample preparation and analysis workflow',
          category: 'SDL7',
          nodeType: 'sdl7PrepareAndInjectHPLCSample',
          parameters: {
            source_tray: 'reaction_tray',
            source_vial: 'A1',
            aliquot_volume_ul: 100,
            dest_tray: 'hplc',
            dest_vial: 'A1',
            perform_weighing: true,
            sample_name: '',
            hplc_method: 'standard_curve_01',
            injection_volume: 5,
            stall: false,
          },
          tags: ['hplc', 'analysis', 'standard'],
          metadata: {
            isPublic: true,
            isStandard: true,
            difficulty: 'beginner',
            estimatedDuration: 10,
            requiredEquipment: ['HPLC', 'Balance', 'Robotic Arm'],
            safetyNotes: ['Wear safety glasses', 'Handle solvents in fume hood'],
          },
        },
        {
          name: 'Deck Initialization SOP',
          description: 'Standard operating procedure for deck initialization',
          category: 'SDL7',
          nodeType: 'sdl7DeckInitialization',
          parameters: {
            experiment_name: 'SDL7_Experiment',
            solvent_file: 'solvents_default.csv',
            method_name: 'standard_curve_01',
            injection_volume: 5,
            sequence: '',
          },
          tags: ['initialization', 'sop', 'startup'],
          metadata: {
            isPublic: true,
            isStandard: true,
            difficulty: 'beginner',
            estimatedDuration: 5,
            requiredEquipment: ['Robotic Arm', 'Balance', 'HPLC'],
            safetyNotes: ['Ensure workspace is clear', 'Verify all connections'],
          },
        },
      ];

      defaultTemplates.forEach(template => this.createTemplate(template));
    }
  }

  // Create a new template
  createTemplate(templateData: Partial<UOTemplate>): UOTemplate {
    const template: UOTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: templateData.name || 'Unnamed Template',
      description: templateData.description || '',
      category: templateData.category || 'Custom',
      nodeType: templateData.nodeType || '',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user', // TODO: Get from auth system
      tags: templateData.tags || [],
      parameters: templateData.parameters || {},
      primitiveOperations: templateData.primitiveOperations || [],
      metadata: {
        usageCount: 0,
        isPublic: false,
        isStandard: false,
        difficulty: 'intermediate',
        ...templateData.metadata,
      },
    };

    this.templates.set(template.id, template);
    this.saveTemplates();
    return template;
  }

  // Get all templates
  getAllTemplates(): UOTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by ID
  getTemplate(id: string): UOTemplate | undefined {
    return this.templates.get(id);
  }

  // Update template
  updateTemplate(id: string, updates: Partial<UOTemplate>): UOTemplate | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    this.templates.set(id, updatedTemplate);
    this.saveTemplates();
    return updatedTemplate;
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveTemplates();
    }
    return deleted;
  }

  // Filter templates
  filterTemplates(filter: TemplateFilter): UOTemplate[] {
    const templates = this.getAllTemplates();
    
    return templates.filter(template => {
      // Category filter
      if (filter.category && template.category !== filter.category) {
        return false;
      }

      // Node type filter
      if (filter.nodeType && template.nodeType !== filter.nodeType) {
        return false;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => template.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Difficulty filter
      if (filter.difficulty && template.metadata.difficulty !== filter.difficulty) {
        return false;
      }

      // Public filter
      if (filter.isPublic !== undefined && template.metadata.isPublic !== filter.isPublic) {
        return false;
      }

      // Standard filter
      if (filter.isStandard !== undefined && template.metadata.isStandard !== filter.isStandard) {
        return false;
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        const searchableText = [
          template.name,
          template.description,
          template.category,
          ...template.tags,
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Use template (increment usage count)
  useTemplate(id: string): UOTemplate | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    template.metadata.usageCount += 1;
    template.metadata.lastUsed = new Date();
    this.saveTemplates();
    return template;
  }

  // Export template
  exportTemplate(id: string): string | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const exportData = {
      ...template,
      exportData: {
        fileName: `${template.name.replace(/\s+/g, '_')}_template.json`,
        exportedAt: new Date(),
        format: 'json' as const,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import template
  importTemplate(jsonData: string): UOTemplate | undefined {
    try {
      const templateData = JSON.parse(jsonData);
      
      // Validate required fields
      if (!templateData.name || !templateData.nodeType) {
        throw new Error('Invalid template format: missing required fields');
      }

      // Create new template with imported data
      const newTemplate = this.createTemplate({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        nodeType: templateData.nodeType,
        parameters: templateData.parameters,
        primitiveOperations: templateData.primitiveOperations,
        tags: templateData.tags,
        metadata: {
          ...templateData.metadata,
          usageCount: 0,
          lastUsed: undefined,
          isPublic: false, // Reset public status on import
        },
      });

      return newTemplate;
    } catch (error) {
      console.error('Error importing template:', error);
      return undefined;
    }
  }

  // Get template statistics
  getTemplateStats(): {
    total: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    mostUsed: UOTemplate[];
    recent: UOTemplate[];
  } {
    const templates = this.getAllTemplates();
    
    const byCategory: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    
    templates.forEach(template => {
      byCategory[template.category] = (byCategory[template.category] || 0) + 1;
      byDifficulty[template.metadata.difficulty] = (byDifficulty[template.metadata.difficulty] || 0) + 1;
    });

    const mostUsed = templates
      .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
      .slice(0, 5);

    const recent = templates
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    return {
      total: templates.length,
      byCategory,
      byDifficulty,
      mostUsed,
      recent,
    };
  }
}

export const templateService = TemplateService.getInstance();