import { VisualizationTemplate } from '../visualizationTemplateService';
import visualizationWebSocketService, { VisualizationData } from '../websocket/visualizationWebSocketService';

export interface VisualizationOptions {
  nodeId: string;
  templateId: string;
  refreshInterval?: number; // 毫秒
  dataLimit?: number; // 最大数据点数量
}

export interface VisualizationState {
  nodeId: string;
  templateId: string;
  data: Record<string, any>[];
  lastUpdated: Date | null;
  isActive: boolean;
}

export class VisualizationService {
  private visualizationStates: Map<string, VisualizationState> = new Map();
  private templateService: any; // 使用实际的模板服务类型
  private dataListeners: Map<string, Set<(data: Record<string, any>[]) => void>> = new Map();
  private isInitialized = false;

  constructor(templateService: any) {
    this.templateService = templateService;
  }

  /**
   * 初始化可视化服务
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // 连接WebSocket
    visualizationWebSocketService.connect();

    // 监听数据事件
    visualizationWebSocketService.on('data', this.handleVisualizationData.bind(this));

    this.isInitialized = true;
  }

  /**
   * 处理从WebSocket接收到的可视化数据
   */
  private handleVisualizationData(data: VisualizationData): void {
    const { nodeId, data: visualizationData } = data;
    
    // 查找所有使用该节点的可视化状态
    for (const [stateId, state] of this.visualizationStates.entries()) {
      if (state.nodeId === nodeId && state.isActive) {
        // 更新数据
        state.data.push(visualizationData);
        state.lastUpdated = new Date();
        
        // 限制数据点数量
        if (state.data.length > 1000) { // 默认限制
          state.data = state.data.slice(-1000);
        }
        
        // 通知监听器
        this.notifyDataListeners(stateId, state.data);
      }
    }
  }

  /**
   * 创建新的可视化
   */
  public createVisualization(options: VisualizationOptions): string {
    const id = `visualization_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.visualizationStates.set(id, {
      nodeId: options.nodeId,
      templateId: options.templateId,
      data: [],
      lastUpdated: null,
      isActive: false
    });
    
    return id;
  }

  /**
   * 启动可视化数据收集
   */
  public startVisualization(id: string): void {
    const state = this.visualizationStates.get(id);
    if (!state) {
      throw new Error(`Visualization with ID ${id} not found`);
    }
    
    state.isActive = true;
    
    // 订阅节点数据
    visualizationWebSocketService.subscribeToNode(state.nodeId);
  }

  /**
   * 停止可视化数据收集
   */
  public stopVisualization(id: string): void {
    const state = this.visualizationStates.get(id);
    if (!state) {
      throw new Error(`Visualization with ID ${id} not found`);
    }
    
    state.isActive = false;
    
    // 取消订阅节点数据
    visualizationWebSocketService.unsubscribeFromNode(state.nodeId);
  }

  /**
   * 获取可视化数据
   */
  public getVisualizationData(id: string): Record<string, any>[] {
    const state = this.visualizationStates.get(id);
    if (!state) {
      throw new Error(`Visualization with ID ${id} not found`);
    }
    
    return state.data;
  }

  /**
   * 应用可视化模板
   */
  public applyTemplate(id: string, templateId?: string): Record<string, any> {
    const state = this.visualizationStates.get(id);
    if (!state) {
      throw new Error(`Visualization with ID ${id} not found`);
    }
    
    const template = this.templateService.getTemplateById(templateId || state.templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId || state.templateId} not found`);
    }
    
    return this.templateService.applyTemplate(template, state.data);
  }

  /**
   * 添加数据监听器
   */
  public addDataListener(id: string, listener: (data: Record<string, any>[]) => void): void {
    if (!this.dataListeners.has(id)) {
      this.dataListeners.set(id, new Set());
    }
    
    this.dataListeners.get(id)?.add(listener);
  }

  /**
   * 移除数据监听器
   */
  public removeDataListener(id: string, listener: (data: Record<string, any>[]) => void): void {
    if (this.dataListeners.has(id)) {
      this.dataListeners.get(id)?.delete(listener);
    }
  }

  /**
   * 通知数据监听器
   */
  private notifyDataListeners(id: string, data: Record<string, any>[]): void {
    if (this.dataListeners.has(id)) {
      for (const listener of this.dataListeners.get(id) || []) {
        listener(data);
      }
    }
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    visualizationWebSocketService.disconnect();
    this.visualizationStates.clear();
    this.dataListeners.clear();
    this.isInitialized = false;
  }
}
