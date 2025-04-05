import { WorkflowDAG, DAGNode, DAGEdge } from './WorkflowDAG';
import { Pool } from 'pg';

export class WorkflowManager {
  private dag: WorkflowDAG;
  private pool: Pool;
  private workflowId: string;

  constructor(workflowId: string) {
    this.workflowId = workflowId;
    this.dag = new WorkflowDAG();
    this.pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'workflow_test_db',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '5432'),
    });
  }

  // 从数据库加载工作流
  async load(): Promise<void> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT nodes, edges FROM workflow_templates WHERE id = $1',
        [this.workflowId]
      );

      if (result.rows.length > 0) {
        const { nodes, edges } = result.rows[0];
        this.dag = WorkflowDAG.fromJSON({ nodes, edges });
      }
    } finally {
      client.release();
    }
  }

  // 保存工作流到数据库
  async save(): Promise<void> {
    const client = await this.pool.connect();
    try {
      const { nodes, edges } = this.dag.toJSON();
      await client.query(
        `UPDATE workflow_templates 
         SET nodes = $1::jsonb, edges = $2::jsonb 
         WHERE id = $3`,
        [nodes, edges, this.workflowId]
      );
    } finally {
      client.release();
    }
  }

  // 添加节点
  async addNode(node: DAGNode): Promise<void> {
    this.dag.addNode(node);
    await this.save();
  }

  // 删除节点
  async removeNode(nodeId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 从 DAG 中删除节点
      this.dag.removeNode(nodeId);

      // 2. 保存更新后的 DAG
      const { nodes, edges } = this.dag.toJSON();
      await client.query(
        `UPDATE workflow_templates 
         SET nodes = $1::jsonb, edges = $2::jsonb 
         WHERE id = $3`,
        [nodes, edges, this.workflowId]
      );

      // 3. 删除节点的实验数据
      await client.query(
        'DELETE FROM experiment_data WHERE step_id = $1',
        [nodeId]
      );

      // 4. 更新实验室工作流实例
      await client.query(
        `UPDATE laboratory_workflows 
         SET customization = customization #- '{nodes,$1}'
         WHERE template_id = $2`,
        [nodeId, this.workflowId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 添加边
  async addEdge(edge: DAGEdge): Promise<boolean> {
    if (this.dag.addEdge(edge)) {
      await this.save();
      return true;
    }
    return false;
  }

  // 删除边
  async removeEdge(edgeId: string): Promise<void> {
    this.dag.removeEdge(edgeId);
    await this.save();
  }

  // 验证工作流
  validate(): { isValid: boolean; errors: string[] } {
    return this.dag.validate();
  }

  // 获取工作流的执行顺序
  getExecutionOrder(): DAGNode[] {
    return this.dag.getTopologicalOrder();
  }

  // 获取节点的依赖
  getDependencies(nodeId: string): {
    predecessors: DAGNode[];
    successors: DAGNode[];
  } {
    return {
      predecessors: this.dag.getPredecessors(nodeId),
      successors: this.dag.getSuccessors(nodeId)
    };
  }

  // 获取当前工作流状态
  getState() {
    return this.dag.toJSON();
  }

  // 清理资源
  async dispose(): Promise<void> {
    await this.pool.end();
  }
} 
