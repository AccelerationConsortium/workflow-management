import { Edge, Node } from 'reactflow';

export interface DAGNode extends Node {
  data: {
    label: string;
    type: string;
    parameters: Record<string, any>;
    [key: string]: any;
  };
}

export interface DAGEdge extends Edge {
  data?: {
    type?: string;
    [key: string]: any;
  };
}

export class WorkflowDAG {
  private nodes: Map<string, DAGNode>;
  private edges: Map<string, DAGEdge>;
  private adjacencyList: Map<string, Set<string>>;
  private reverseAdjList: Map<string, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjList = new Map();
  }

  // 添加节点
  addNode(node: DAGNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
    if (!this.reverseAdjList.has(node.id)) {
      this.reverseAdjList.set(node.id, new Set());
    }
  }

  // 添加边
  addEdge(edge: DAGEdge): boolean {
    // 检查是否会形成环
    if (this.wouldCreateCycle(edge.source, edge.target)) {
      return false;
    }

    this.edges.set(edge.id, edge);
    this.adjacencyList.get(edge.source)?.add(edge.target);
    this.reverseAdjList.get(edge.target)?.add(edge.source);
    return true;
  }

  // 删除节点
  removeNode(nodeId: string): void {
    // 删除相关的边
    const edgesToDelete = Array.from(this.edges.values()).filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );
    edgesToDelete.forEach(edge => this.removeEdge(edge.id));

    // 删除节点
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.reverseAdjList.delete(nodeId);

    // 从其他节点的邻接表中删除
    this.adjacencyList.forEach(neighbors => neighbors.delete(nodeId));
    this.reverseAdjList.forEach(neighbors => neighbors.delete(nodeId));
  }

  // 删除边
  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (edge) {
      this.adjacencyList.get(edge.source)?.delete(edge.target);
      this.reverseAdjList.get(edge.target)?.delete(edge.source);
      this.edges.delete(edgeId);
    }
  }

  // 检查是否会形成环
  private wouldCreateCycle(source: string, target: string): boolean {
    const visited = new Set<string>();
    
    const dfs = (current: string): boolean => {
      if (current === source) return true;
      visited.add(current);
      
      const neighbors = this.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && dfs(neighbor)) {
          return true;
        }
      }
      
      return false;
    };

    return dfs(target);
  }

  // 获取节点的所有前驱节点
  getPredecessors(nodeId: string): DAGNode[] {
    const predecessors = this.reverseAdjList.get(nodeId) || new Set();
    return Array.from(predecessors).map(id => this.nodes.get(id)!);
  }

  // 获取节点的所有后继节点
  getSuccessors(nodeId: string): DAGNode[] {
    const successors = this.adjacencyList.get(nodeId) || new Set();
    return Array.from(successors).map(id => this.nodes.get(id)!);
  }

  // 获取拓扑排序
  getTopologicalOrder(): DAGNode[] {
    const visited = new Set<string>();
    const order: DAGNode[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const successors = this.adjacencyList.get(nodeId) || new Set();
      for (const successor of successors) {
        visit(successor);
      }
      
      const node = this.nodes.get(nodeId);
      if (node) order.unshift(node);
    };
    
    for (const nodeId of this.nodes.keys()) {
      visit(nodeId);
    }
    
    return order;
  }

  // 验证工作流
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查是否有孤立节点
    for (const [nodeId, node] of this.nodes) {
      const hasIncoming = this.reverseAdjList.get(nodeId)?.size ?? 0;
      const hasOutgoing = this.adjacencyList.get(nodeId)?.size ?? 0;
      
      if (hasIncoming === 0 && hasOutgoing === 0) {
        errors.push(`Node ${node.data.label} (${nodeId}) is isolated`);
      }
    }

    // 检查参数完整性
    for (const node of this.nodes.values()) {
      const requiredParams = Object.entries(node.data.parameters)
        .filter(([_, param]) => param.required)
        .map(([key]) => key);

      for (const param of requiredParams) {
        if (node.data.parameters[param].value === undefined) {
          errors.push(`Required parameter ${param} is missing in node ${node.data.label}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 序列化为 JSON
  toJSON() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }

  // 从 JSON 恢复
  static fromJSON(data: { nodes: DAGNode[]; edges: DAGEdge[] }): WorkflowDAG {
    const dag = new WorkflowDAG();
    data.nodes.forEach(node => dag.addNode(node));
    data.edges.forEach(edge => dag.addEdge(edge));
    return dag;
  }
} 
