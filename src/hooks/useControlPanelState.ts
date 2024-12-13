import { useState, useEffect } from 'react';
import { ParameterLinkageService } from '../services/parameterLinkageService';
import { VisualizationTemplateService } from '../services/visualizationTemplateService';
import { ShortcutHintService } from '../services/shortcutHintService';
import { HistoryGroupingService, Operation } from '../services/historyGroupingService';

export const useControlPanelState = () => {
  const [parameterService] = useState(() => new ParameterLinkageService());
  const [visualizationService] = useState(() => new VisualizationTemplateService());
  const [shortcutService] = useState(() => new ShortcutHintService());
  const [historyService] = useState(() => new HistoryGroupingService());
  
  const [operations, setOperations] = useState<Operation[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  
  // 处理参数变化
  const handleParameterChange = (nodeId: string, paramId: string, value: number) => {
    const operation: Operation = {
      id: `op-${Date.now()}`,
      type: 'update',
      timestamp: Date.now(),
      target: { id: nodeId, type: 'parameter' },
      data: { paramId, value },
      metadata: { parameterChanges: { [paramId]: value } }
    };
    
    setOperations(prev => [...prev, operation]);
  };
  
  // 处理操作撤销
  const handleUndo = (groupId: string) => {
    const groups = historyService.groupOperations(operations);
    const group = groups.find(g => g.id === groupId);
    
    if (group && group.canUndo) {
      // 移除该组的所有操作
      setOperations(prev => 
        prev.filter(op => !group.operations.find(groupOp => groupOp.id === op.id))
      );
    }
  };
  
  // 获取当前节点的相关参数影响
  const getParameterImpacts = () => {
    if (!currentNodeId) return [];
    // 从 parameterService 获取参数影响
    return [];
  };
  
  return {
    parameterImpacts: getParameterImpacts(),
    visualizationTemplates: visualizationService.getTemplates(),
    shortcuts: shortcutService.getAllShortcuts(),
    operationGroups: historyService.groupOperations(operations),
    handleParameterChange,
    handleUndo,
    setCurrentNodeId
  };
}; 