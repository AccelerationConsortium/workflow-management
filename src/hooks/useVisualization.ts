import { useState, useEffect, useRef } from 'react';
import { VisualizationService, VisualizationOptions } from '../services/visualization/visualizationService';
import { VisualizationTemplateService } from '../services/visualizationTemplateService';

// 创建服务实例
const templateService = new VisualizationTemplateService();
const visualizationService = new VisualizationService(templateService);

// 初始化服务
visualizationService.initialize();

export interface UseVisualizationOptions extends VisualizationOptions {
  autoStart?: boolean;
}

export interface UseVisualizationResult {
  data: Record<string, any>[];
  isActive: boolean;
  start: () => void;
  stop: () => void;
  applyTemplate: (templateId?: string) => Record<string, any>;
}

/**
 * 使用可视化数据的React钩子
 */
export const useVisualization = (options: UseVisualizationOptions): UseVisualizationResult => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const visualizationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 创建可视化
    const visualizationId = visualizationService.createVisualization({
      nodeId: options.nodeId,
      templateId: options.templateId,
      refreshInterval: options.refreshInterval,
      dataLimit: options.dataLimit
    });
    
    visualizationIdRef.current = visualizationId;
    
    // 添加数据监听器
    const dataListener = (newData: Record<string, any>[]) => {
      setData([...newData]);
    };
    
    visualizationService.addDataListener(visualizationId, dataListener);
    
    // 如果设置了自动启动，则启动可视化
    if (options.autoStart) {
      visualizationService.startVisualization(visualizationId);
      setIsActive(true);
    }
    
    // 清理函数
    return () => {
      if (visualizationIdRef.current) {
        visualizationService.removeDataListener(visualizationIdRef.current, dataListener);
        visualizationService.stopVisualization(visualizationIdRef.current);
      }
    };
  }, [options.nodeId, options.templateId]);

  /**
   * 启动可视化
   */
  const start = () => {
    if (visualizationIdRef.current && !isActive) {
      visualizationService.startVisualization(visualizationIdRef.current);
      setIsActive(true);
    }
  };

  /**
   * 停止可视化
   */
  const stop = () => {
    if (visualizationIdRef.current && isActive) {
      visualizationService.stopVisualization(visualizationIdRef.current);
      setIsActive(false);
    }
  };

  /**
   * 应用可视化模板
   */
  const applyTemplate = (templateId?: string) => {
    if (!visualizationIdRef.current) {
      throw new Error('Visualization not initialized');
    }
    
    return visualizationService.applyTemplate(visualizationIdRef.current, templateId);
  };

  return {
    data,
    isActive,
    start,
    stop,
    applyTemplate
  };
};
