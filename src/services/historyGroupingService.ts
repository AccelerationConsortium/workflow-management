import { Node, Edge } from 'reactflow';

export interface Operation {
  id: string;
  type: 'add' | 'remove' | 'update' | 'connect' | 'disconnect' | 'group' | 'ungroup';
  timestamp: number;
  target: {
    id: string;
    type: string;
  };
  data?: any;
  metadata?: {
    relatedNodes?: string[];
    parameterChanges?: Record<string, any>;
    groupId?: string;
  };
}

export interface OperationGroup {
  id: string;
  name: string;
  operations: Operation[];
  timestamp: number;
  canUndo: boolean;
  description: string;
  category: 'parameter' | 'structure' | 'workflow' | 'environment';
}

export class HistoryGroupingService {
  private readonly timeThreshold = 2000; // 2秒内的操作可能属于同一组
  
  groupOperations(operations: Operation[]): OperationGroup[] {
    if (!operations.length) return [];
    
    const sortedOps = [...operations].sort((a, b) => a.timestamp - b.timestamp);
    const groups: OperationGroup[] = [];
    let currentGroup: Operation[] = [sortedOps[0]];
    let currentType = this.getOperationType(sortedOps[0]);

    for (let i = 1; i < sortedOps.length; i++) {
      const op = sortedOps[i];
      const prevOp = sortedOps[i - 1];
      
      if (
        this.shouldGroupTogether(op, prevOp, currentType) &&
        op.timestamp - prevOp.timestamp <= this.timeThreshold
      ) {
        currentGroup.push(op);
      } else {
        // 创建新组
        if (currentGroup.length > 0) {
          groups.push(this.createGroup(currentGroup));
        }
        currentGroup = [op];
        currentType = this.getOperationType(op);
      }
    }

    // 添加最后一组
    if (currentGroup.length > 0) {
      groups.push(this.createGroup(currentGroup));
    }

    return groups;
  }

  private getOperationType(operation: Operation): string {
    if (operation.type === 'update' && operation.metadata?.parameterChanges) {
      return 'parameter';
    }
    if (['connect', 'disconnect'].includes(operation.type)) {
      return 'structure';
    }
    if (['group', 'ungroup'].includes(operation.type)) {
      return 'workflow';
    }
    return operation.type;
  }

  private shouldGroupTogether(
    currentOp: Operation,
    prevOp: Operation,
    currentType: string
  ): boolean {
    // 同类型操作分组
    if (this.getOperationType(currentOp) !== currentType) {
      return false;
    }

    // 相关节点操作分组
    if (currentOp.metadata?.relatedNodes && prevOp.metadata?.relatedNodes) {
      const hasCommonNodes = currentOp.metadata.relatedNodes.some(
        id => prevOp.metadata?.relatedNodes?.includes(id)
      );
      if (hasCommonNodes) return true;
    }

    // 同一工作流组的操作分组
    if (currentOp.metadata?.groupId && currentOp.metadata.groupId === prevOp.metadata?.groupId) {
      return true;
    }

    return false;
  }

  private createGroup(operations: Operation[]): OperationGroup {
    const firstOp = operations[0];
    const type = this.getOperationType(firstOp);
    
    return {
      id: `group-${firstOp.timestamp}`,
      name: this.generateGroupName(operations, type),
      operations,
      timestamp: firstOp.timestamp,
      canUndo: this.canUndoGroup(operations),
      description: this.generateDescription(operations),
      category: this.mapTypeToCategory(type)
    };
  }

  private generateGroupName(operations: Operation[], type: string): string {
    const count = operations.length;
    
    switch (type) {
      case 'parameter':
        return `Modified ${count} parameter${count > 1 ? 's' : ''}`;
      case 'structure':
        return `Changed workflow structure`;
      case 'workflow':
        return `Modified workflow organization`;
      default:
        return `${count} operation${count > 1 ? 's' : ''}`;
    }
  }

  private generateDescription(operations: Operation[]): string {
    const details = operations.map(op => {
      switch (op.type) {
        case 'update':
          return `Updated ${op.target.type} (${op.target.id})`;
        case 'connect':
          return 'Connected nodes';
        case 'disconnect':
          return 'Disconnected nodes';
        default:
          return `${op.type} operation`;
      }
    });

    return details.join(', ');
  }

  private canUndoGroup(operations: Operation[]): boolean {
    // 某些操作组合可能无法撤销
    return operations.every(op => 
      !['environment', 'execution'].includes(this.getOperationType(op))
    );
  }

  private mapTypeToCategory(type: string): OperationGroup['category'] {
    const mapping: Record<string, OperationGroup['category']> = {
      parameter: 'parameter',
      structure: 'structure',
      workflow: 'workflow',
      environment: 'environment'
    };
    return mapping[type] || 'structure';
  }
} 