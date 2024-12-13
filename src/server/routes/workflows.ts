import express from 'express';
import { Pool } from 'pg';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 创建或更新工作流
router.post('/workflows', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id, name, description, steps, nodes, edges, metadata } = req.body;
    
    // 保存工作流基本信息
    const workflowResult = await client.query(
      `INSERT INTO workflows (id, name, description, metadata)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET name = $2, description = $3, metadata = $4
       RETURNING *`,
      [id, name, description, metadata]
    );

    // 保存步骤
    await client.query('DELETE FROM workflow_steps WHERE workflow_id = $1', [id]);
    for (const step of steps) {
      await client.query(
        `INSERT INTO workflow_steps 
         (id, workflow_id, name, description, node_ids, order_index, status, dependencies, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [step.id, id, step.name, step.description, step.nodeIds, step.order, 
         step.status, step.dependencies, step.metadata]
      );
    }

    // 保存节点和边
    await client.query('DELETE FROM workflow_nodes WHERE workflow_id = $1', [id]);
    await client.query('DELETE FROM workflow_edges WHERE workflow_id = $1', [id]);
    
    for (const node of nodes) {
      await client.query(
        `INSERT INTO workflow_nodes (id, workflow_id, type, data, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [node.id, id, node.type, node.data, node.position]
      );
    }

    for (const edge of edges) {
      await client.query(
        `INSERT INTO workflow_edges (id, workflow_id, source, target, type, data)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [edge.id, id, edge.source, edge.target, edge.type, edge.data]
      );
    }

    await client.query('COMMIT');
    res.json(workflowResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving workflow:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  } finally {
    client.release();
  }
});

export default router; 