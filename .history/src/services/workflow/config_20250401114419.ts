import { WorkflowConfig, WorkflowNode, WorkflowConnection } from '../../types/workflow';

class WorkflowConfigService {
  private static instance: WorkflowConfigService;
  private currentConfig: WorkflowConfig | null = null;
  private readonly LOCAL_STORAGE_KEY = 'workflow_config';
  private readonly CONFIG_VERSION = '1.0.0';

  private constructor() {}

  public static getInstance(): WorkflowConfigService {
    if (!WorkflowConfigService.instance) {
      WorkflowConfigService.instance = new WorkflowConfigService();
    }
    return WorkflowConfigService.instance;
  }

  // Initialize empty workflow config
  public initEmptyConfig(): WorkflowConfig {
    const emptyConfig: WorkflowConfig = {
      nodes: {},
      connections: [],
      metadata: {
        lastModified: new Date().toISOString(),
        version: this.CONFIG_VERSION
      }
    };
    this.currentConfig = emptyConfig;
    return emptyConfig;
  }

  // Load config from local storage
  public loadConfig(): WorkflowConfig {
    try {
      const savedConfig = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (savedConfig) {
        this.currentConfig = JSON.parse(savedConfig);
        return this.currentConfig;
      }
      return this.initEmptyConfig();
    } catch (error) {
      console.error('Failed to load workflow config:', error);
      return this.initEmptyConfig();
    }
  }

  // Save current config to local storage
  public saveConfig(): void {
    if (!this.currentConfig) {
      throw new Error('No workflow config to save');
    }
    try {
      this.currentConfig.metadata.lastModified = new Date().toISOString();
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.currentConfig));
    } catch (error) {
      console.error('Failed to save workflow config:', error);
      throw error;
    }
  }

  // Add or update a node
  public updateNode(nodeId: string, node: WorkflowNode): void {
    if (!this.currentConfig) {
      this.initEmptyConfig();
    }
    this.currentConfig!.nodes[nodeId] = {
      ...node,
      id: nodeId
    };
    this.saveConfig();
  }

  // Remove a node
  public removeNode(nodeId: string): void {
    if (!this.currentConfig?.nodes[nodeId]) {
      return;
    }
    delete this.currentConfig.nodes[nodeId];
    // Remove associated connections
    this.currentConfig.connections = this.currentConfig.connections.filter(
      conn => conn.sourceId !== nodeId && conn.targetId !== nodeId
    );
    this.saveConfig();
  }

  // Update node parameters
  public updateNodeParameters(nodeId: string, parameters: Record<string, any>): void {
    if (!this.currentConfig?.nodes[nodeId]) {
      throw new Error(`Node ${nodeId} not found`);
    }
    this.currentConfig.nodes[nodeId].parameters = {
      ...this.currentConfig.nodes[nodeId].parameters,
      ...parameters
    };
    this.saveConfig();
  }

  // Update node files
  public updateNodeFiles(nodeId: string, files: { input?: string[], output?: string[] }): void {
    if (!this.currentConfig?.nodes[nodeId]) {
      throw new Error(`Node ${nodeId} not found`);
    }
    this.currentConfig.nodes[nodeId].files = {
      ...this.currentConfig.nodes[nodeId].files,
      ...files
    };
    this.saveConfig();
  }

  // Add or update a connection
  public updateConnection(connection: WorkflowConnection): void {
    if (!this.currentConfig) {
      this.initEmptyConfig();
    }
    const existingIndex = this.currentConfig!.connections.findIndex(
      conn => conn.sourceId === connection.sourceId && conn.targetId === connection.targetId
    );
    if (existingIndex >= 0) {
      this.currentConfig!.connections[existingIndex] = connection;
    } else {
      this.currentConfig!.connections.push(connection);
    }
    this.saveConfig();
  }

  // Remove a connection
  public removeConnection(sourceId: string, targetId: string): void {
    if (!this.currentConfig) return;
    this.currentConfig.connections = this.currentConfig.connections.filter(
      conn => !(conn.sourceId === sourceId && conn.targetId === targetId)
    );
    this.saveConfig();
  }

  // Export config to file
  public async exportConfig(filename: string = 'workflow.json'): Promise<void> {
    if (!this.currentConfig) {
      throw new Error('No workflow config to export');
    }
    const blob = new Blob([JSON.stringify(this.currentConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import config from file
  public async importConfig(file: File): Promise<WorkflowConfig> {
    try {
      const content = await file.text();
      const config = JSON.parse(content) as WorkflowConfig;
      this.currentConfig = config;
      this.saveConfig();
      return config;
    } catch (error) {
      console.error('Failed to import workflow config:', error);
      throw error;
    }
  }

  // Get current config
  public getCurrentConfig(): WorkflowConfig | null {
    return this.currentConfig;
  }
} 
