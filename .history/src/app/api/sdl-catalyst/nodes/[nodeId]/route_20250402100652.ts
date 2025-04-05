import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;

    if (!nodeId) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    // TODO: 在这里添加你的数据库删除逻辑
    // 例如：await db.nodes.delete({ where: { id: nodeId } });
    
    // 模拟删除成功
    console.log(`Deleting node: ${nodeId}`);

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
  }
} 
