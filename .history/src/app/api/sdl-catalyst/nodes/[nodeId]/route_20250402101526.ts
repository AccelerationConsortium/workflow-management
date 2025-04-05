import { NextResponse } from 'next/server';
import { WorkflowManager } from '@/lib/dag/WorkflowManager';

export async function DELETE(
  request: Request,
  { params }: { params: { nodeId: string } }
) {
  const { nodeId } = params;
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflowId');

  if (!nodeId) {
    return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
  }

  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
  }

  const workflowManager = new WorkflowManager(workflowId);

  try {
    // 1. 加载当前工作流状态
    await workflowManager.load();

    // 2. 删除节点（这会同时更新 DAG 和数据库）
    await workflowManager.removeNode(nodeId);

    // 3. 验证工作流的完整性
    const validation = workflowManager.validate();
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: true,
        message: `Node ${nodeId} deleted successfully, but workflow has validation issues`,
        nodeId,
        warnings: validation.errors
      });
    }

    return NextResponse.json({ 
      success: true,
      message: `Node ${nodeId} deleted successfully`,
      nodeId
    });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json({ 
      error: 'Failed to delete node',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await workflowManager.dispose();
  }
} 
