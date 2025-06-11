/**
 * UO Registration Service - Handles saving, loading, and managing custom UOs
 */

import { 
  GeneratedUOSchema, 
  UORegistrationResult, 
  UOCategory 
} from '../types/UOBuilder';

export class UORegistrationService {
  private static instance: UORegistrationService;
  private customUOs: Map<string, GeneratedUOSchema> = new Map();
  private customCategories: Map<string, UOCategory> = new Map();
  private storageKey = 'custom_unit_operations';
  private categoriesKey = 'custom_uo_categories';

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): UORegistrationService {
    if (!UORegistrationService.instance) {
      UORegistrationService.instance = new UORegistrationService();
    }
    return UORegistrationService.instance;
  }

  /**
   * Register a new Unit Operation
   */
  public async registerUO(schema: GeneratedUOSchema): Promise<UORegistrationResult> {
    try {
      // Validate schema
      const validation = this.validateSchema(schema);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check for duplicate names
      const existingUO = Array.from(this.customUOs.values())
        .find(uo => uo.name.toLowerCase() === schema.name.toLowerCase());
      
      if (existingUO) {
        return {
          success: false,
          error: `A Unit Operation with the name "${schema.name}" already exists`
        };
      }

      // Save to memory and storage
      this.customUOs.set(schema.id, schema);
      this.saveToStorage();

      // Generate operation node data for the sidebar
      const operationNode = this.generateOperationNode(schema);

      return {
        success: true,
        uoId: schema.id,
        schema: schema
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all registered custom UOs
   */
  public getCustomUOs(): GeneratedUOSchema[] {
    return Array.from(this.customUOs.values());
  }

  /**
   * Get a specific UO by ID
   */
  public getUOById(id: string): GeneratedUOSchema | null {
    return this.customUOs.get(id) || null;
  }

  /**
   * Delete a custom UO
   */
  public deleteUO(id: string): boolean {
    const deleted = this.customUOs.delete(id);
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  /**
   * Update an existing UO
   */
  public updateUO(id: string, updates: Partial<GeneratedUOSchema>): UORegistrationResult {
    const existingUO = this.customUOs.get(id);
    if (!existingUO) {
      return {
        success: false,
        error: 'Unit Operation not found'
      };
    }

    const updatedUO = { ...existingUO, ...updates, id }; // Preserve ID
    const validation = this.validateSchema(updatedUO);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    this.customUOs.set(id, updatedUO);
    this.saveToStorage();

    return {
      success: true,
      uoId: id,
      schema: updatedUO
    };
  }

  /**
   * Register a custom category
   */
  public registerCategory(category: UOCategory): boolean {
    this.customCategories.set(category.id, category);
    this.saveCategoriesStorage();
    return true;
  }

  /**
   * Get all custom categories
   */
  public getCustomCategories(): UOCategory[] {
    return Array.from(this.customCategories.values());
  }

  /**
   * Export UOs to JSON
   */
  public exportUOs(): string {
    const data = {
      uos: Array.from(this.customUOs.values()),
      categories: Array.from(this.customCategories.values()),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import UOs from JSON
   */
  public importUOs(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;

      if (data.uos && Array.isArray(data.uos)) {
        for (const uo of data.uos) {
          const validation = this.validateSchema(uo);
          if (validation.isValid) {
            this.customUOs.set(uo.id, uo);
            imported++;
          } else {
            errors.push(`UO "${uo.name}": ${validation.errors.join(', ')}`);
          }
        }
      }

      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          this.customCategories.set(category.id, category);
        }
      }

      this.saveToStorage();
      this.saveCategoriesStorage();

      return { success: true, imported, errors };

    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Invalid JSON format']
      };
    }
  }

  /**
   * Validate UO schema
   */
  private validateSchema(schema: GeneratedUOSchema): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema.id) errors.push('ID is required');
    if (!schema.name?.trim()) errors.push('Name is required');
    if (!schema.description?.trim()) errors.push('Description is required');
    if (!schema.category?.trim()) errors.push('Category is required');
    if (!Array.isArray(schema.parameters)) errors.push('Parameters must be an array');

    // Validate parameters
    schema.parameters?.forEach((param, index) => {
      if (!param.id) errors.push(`Parameter ${index + 1}: ID is required`);
      if (!param.name?.trim()) errors.push(`Parameter ${index + 1}: Name is required`);
      if (!param.type) errors.push(`Parameter ${index + 1}: Type is required`);
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate operation node data for sidebar integration
   */
  private generateOperationNode(schema: GeneratedUOSchema) {
    return {
      id: schema.id,
      name: schema.name,
      category: schema.category,
      description: schema.description,
      icon: '🔧', // Default icon for custom UOs
      color: '#8F7FE8', // Matrix purple
      parameters: schema.parameters.map(param => ({
        id: param.id,
        name: param.name,
        type: param.type,
        defaultValue: param.defaultValue,
        required: param.required,
        unit: param.unit,
        validation: param.validation
      })),
      isCustom: true,
      createdAt: schema.createdAt,
      version: schema.version
    };
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const storedUOs = localStorage.getItem(this.storageKey);
      if (storedUOs) {
        const uos = JSON.parse(storedUOs);
        this.customUOs = new Map(Object.entries(uos));
      }

      const storedCategories = localStorage.getItem(this.categoriesKey);
      if (storedCategories) {
        const categories = JSON.parse(storedCategories);
        this.customCategories = new Map(Object.entries(categories));
      }
    } catch (error) {
      console.error('Failed to load custom UOs from storage:', error);
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      const uosObject = Object.fromEntries(this.customUOs);
      localStorage.setItem(this.storageKey, JSON.stringify(uosObject));
    } catch (error) {
      console.error('Failed to save custom UOs to storage:', error);
    }
  }

  /**
   * Save categories to localStorage
   */
  private saveCategoriesStorage(): void {
    try {
      const categoriesObject = Object.fromEntries(this.customCategories);
      localStorage.setItem(this.categoriesKey, JSON.stringify(categoriesObject));
    } catch (error) {
      console.error('Failed to save custom categories to storage:', error);
    }
  }
}
