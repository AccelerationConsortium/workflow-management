export function getTopologicalOrder(nodes: any[], edges: any[]): any[] {
  // 构建邻接表
  const graph = new Map();
  const inDegree = new Map();
  
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    graph.get(edge.source).push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // 找出所有入度为0的节点
  const queue = nodes
    .filter(node => inDegree.get(node.id) === 0)
    .map(node => node.id);
  
  const result = [];

  while (queue.length) {
    const nodeId = queue.shift()!;
    result.push(nodes.find(n => n.id === nodeId));

    graph.get(nodeId).forEach((neighbor: string) => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  return result;
} 