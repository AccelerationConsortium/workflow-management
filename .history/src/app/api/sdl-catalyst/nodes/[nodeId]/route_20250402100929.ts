import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// 创建数据库连接池
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'workflow_test_db',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export async function DELETE(
  request: Request,
  { params }: { params: { nodeId: string } }
) {
  const client = await pool.connect();
  
  try {
    const { nodeId } = params;

    if (!nodeId) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. 删除节点的实验数据
    await client.query(
      'DELETE FROM experiment_data WHERE step_id = $1',
      [nodeId]
    );

    // 2. 从工作流模板中移除节点
    const workflowResult = await client.query(
      `UPDATE workflow_templates 
       SET nodes = nodes - $1::text,
           edges = edges #- '{edges}[*]' || 
                   jsonb_build_object('edges', 
                     (SELECT jsonb_agg(edge) 
                      FROM jsonb_array_elements(edges->'edges') edge 
                      WHERE (edge->>'source')::text != $1 
                        AND (edge->>'target')::text != $1)
                   )
       WHERE nodes ? $1
       RETURNING id`,
      [nodeId]
    );

    // 3. 更新实验室工作流实例
    if (workflowResult.rows.length > 0) {
      const workflowId = workflowResult.rows[0].id;
      await client.query(
        `UPDATE laboratory_workflows 
         SET customization = customization #- '{nodes,$1}'
         WHERE template_id = $2`,
        [nodeId, workflowId]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: `Node ${nodeId} deleted successfully`,
      nodeId 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting node:', error);
    return NextResponse.json({ 
      error: 'Failed to delete node',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    client.release();
  }
} 
