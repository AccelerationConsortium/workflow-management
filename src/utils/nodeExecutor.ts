import { Node } from 'reactflow';

export async function simulateNodeExecution(node: Node): Promise<any> {
  // 模拟节点执行时间
  const executionTime = Math.random() * 2000 + 1000;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟执行结果
      const result = {
        nodeId: node.id,
        type: node.type,
        status: 'completed',
        output: {
          timestamp: new Date().toISOString(),
          data: generateMockData(node)
        }
      };
      resolve(result);
    }, executionTime);
  });
}

function generateMockData(node: Node): any {
  switch (node.type) {
    case 'powderDispenser':
      return {
        weight: Math.random() * 100,
        unit: 'mg',
        timestamp: new Date().toISOString()
      };
    case 'liquidHandler':
      return {
        volume: Math.random() * 1000,
        unit: 'μL',
        timestamp: new Date().toISOString()
      };
    case 'nmr':
      return {
        spectrum: Array.from({ length: 100 }, () => Math.random() * 100),
        frequency: '600MHz',
        solvent: 'CDCl3',
        timestamp: new Date().toISOString()
      };
    // ... 可以继续添加其他节点类型的模拟数据
    default:
      return {
        value: Math.random() * 100,
        timestamp: new Date().toISOString()
      };
  }
} 