import { Node, Edge } from 'reactflow';
import { validateValue } from './validator';
import { evaluateNodeConditions } from './conditionEvaluator';
import { NodeData, Connection } from '../types/workflow';

export interface ExecutionContext {
  nodes: Map<string, any>;
  edges: Map<string, any>;
  currentNode: string | null;
  executedNodes: Set<string>;
  results: Map<string, any>;
}

export class WorkflowExecutor {
  private context: ExecutionContext;

  constructor(nodes: Node[], edges: Edge[]) {
    this.context = {
      nodes: new Map(nodes.map(node => [node.id, node])),
      edges: new Map(edges.map(edge => [edge.id, edge])),
      currentNode: null,
      executedNodes: new Set(),
      results: new Map(),
    };
  }

  private async validateNode(nodeId: string): Promise<void> {
    const node = this.context.nodes.get(nodeId);
    if (!node) throw new Error(`节点不存在: ${nodeId}`);

    const nodeData = node.data as NodeData;
    if (nodeData.validationRules) {
      for (const [key, rules] of Object.entries(nodeData.validationRules)) {
        const value = nodeData.parameters?.find(p => p.name === key)?.default;
        validateValue(value, rules);
      }
    }
  }

  private async executeNode(nodeId: string): Promise<void> {
    await this.validateNode(nodeId);
    
    const node = this.context.nodes.get(nodeId);
    const nodeData = node.data as NodeData;

    // 执行节点的具体操作
    // 这里需要根据节点类型实现具体的操作逻辑
    const result = await this.executeOperation(nodeData);
    this.context.results.set(nodeId, result);
    this.context.executedNodes.add(nodeId);
  }

  private async executeOperation(nodeData: NodeData): Promise<any> {
    // 这里实现具体的操作执行逻辑
    switch (nodeData.type) {
      case 'fileInput':
        // 处理文件输入
        break;
      case 'powderDispenser':
        // 处理粉末分配
        break;
      // ... 其他操作类型
    }
    return null;
  }

  private getNextNodes(nodeId: string): string[] {
    const edges = Array.from(this.context.edges.values());
    const nextEdges = edges.filter(edge => edge.source === nodeId);
    
    return nextEdges.map(edge => {
      const connection = edge as Connection;
      if (connection.type === 'conditional') {
        // 评估条件
        const sourceNode = this.context.nodes.get(nodeId);
        const conditions = sourceNode.data.branchConditions || [];
        const results = evaluateNodeConditions(
          this.context.results.get(nodeId),
          conditions
        );
        return results.every(Boolean) ? edge.target : null;
      }
      return edge.target;
    }).filter(Boolean) as string[];
  }

  public async execute(startNodeId: string): Promise<Map<string, any>> {
    this.context.currentNode = startNodeId;
    const queue = [startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (this.context.executedNodes.has(nodeId)) continue;

      await this.executeNode(nodeId);
      const nextNodes = this.getNextNodes(nodeId);
      queue.push(...nextNodes);
    }

    return this.context.results;
  }
} 