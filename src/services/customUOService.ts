/**
 * Custom UO Service - Manages custom Unit Operations
 */

import { GeneratedUOSchema, UORegistrationResult } from '../components/UOBuilder/types';

export interface CustomUONode {
  type: string;
  label: string;
  description: string;
  category: string;
  isCustom: boolean;
  schema: GeneratedUOSchema;
  icon?: string;
  color?: string;
}

class CustomUOService {
  private static instance: CustomUOService;
  private customUOs: Map<string, GeneratedUOSchema> = new Map();
  private storageKey = 'custom_unit_operations';
  private listeners: Array<(uos: CustomUONode[]) => void> = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): CustomUOService {
    if (!CustomUOService.instance) {
      CustomUOService.instance = new CustomUOService();
    }
    return CustomUOService.instance;
  }

  /**
   * Register a new custom UO
   */
  public registerUO(schema: GeneratedUOSchema): UORegistrationResult {
    try {
      // Validate schema
      if (!schema.id || !schema.name || !schema.description) {
        return {
          success: false,
          error: 'Invalid schema: missing required fields'
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

      // Notify listeners
      this.notifyListeners();

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
   * Get all custom UOs as operation nodes
   */
  public getCustomUONodes(): CustomUONode[] {
    return Array.from(this.customUOs.values()).map(schema => ({
      type: schema.id,
      label: schema.name,
      description: schema.description,
      category: schema.category,
      isCustom: true,
      schema: schema,
      icon: '🔧', // Default icon for custom UOs
      color: '#8F7FE8' // Matrix purple
    }));
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
      this.notifyListeners();
    }
    return deleted;
  }

  /**
   * Subscribe to custom UO changes
   */
  public subscribe(listener: (uos: CustomUONode[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const customNodes = this.getCustomUONodes();
    this.listeners.forEach(listener => listener(customNodes));
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
   * Export custom UOs to JSON
   */
  public exportUOs(): string {
    const data = {
      customUOs: Array.from(this.customUOs.values()),
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import custom UOs from JSON
   */
  public importUOs(jsonData: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      let imported = 0;

      if (data.customUOs && Array.isArray(data.customUOs)) {
        for (const uo of data.customUOs) {
          if (uo.id && uo.name && uo.description) {
            this.customUOs.set(uo.id, uo);
            imported++;
          } else {
            errors.push(`Invalid UO: ${uo.name || 'Unknown'}`);
          }
        }
      }

      this.saveToStorage();
      this.notifyListeners();

      return { success: true, imported, errors };

    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Invalid JSON format']
      };
    }
  }
}

export const customUOService = CustomUOService.getInstance();
