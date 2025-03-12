import { Node } from 'reactflow';
import SettingsIcon from '@mui/icons-material/Settings';

// 创建测试节点数据
export const testNodes: Node[] = [
  {
    id: 'test-node-1',
    type: 'baseNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Hardware Test Node',
      description: 'This is a test node to verify styling',
      icon: SettingsIcon,
      metric: '42',
      metricLabel: 'Value'
    },
    // 这里的category需要匹配nodeStyles.categories中的键
    category: 'hardware'
  },
  {
    id: 'test-node-2',
    type: 'baseNode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Analysis Test Node',
      description: 'This is another test node with different category',
      icon: SettingsIcon,
      metric: '87%',
      metricLabel: 'Accuracy'
    },
    category: 'analysis'
  },
  {
    id: 'test-node-3',
    type: 'baseNode',
    position: { x: 100, y: 300 },
    data: {
      label: 'Optimization Test Node',
      description: 'This node tests the optimization category style',
      icon: SettingsIcon,
      metric: '3.14',
      metricLabel: 'Factor'
    },
    category: 'optimization'
  },
  {
    id: 'test-node-4',
    type: 'baseNode',
    position: { x: 400, y: 300 },
    data: {
      label: 'Data Test Node',
      description: 'This node tests the data category style',
      icon: SettingsIcon,
      metric: '1.2TB',
      metricLabel: 'Size'
    },
    category: 'data'
  }
]; 
