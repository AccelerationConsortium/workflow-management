import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');

    if (!nodeId) {
      return NextResponse.json({ error: 'Node ID is required' }, { status: 400 });
    }

    // TODO: 在这里添加你的数据库删除逻辑
    // 例如：await db.nodes.delete({ where: { id: nodeId } });

    return NextResponse.json({ success: true, message: `Node ${nodeId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json({ error: 'Failed to delete node' }, { status: 500 });
  }
} 
