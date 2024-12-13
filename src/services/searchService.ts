import { operationNodes } from '../data/operationNodes';
import { OperationNode } from '../types/workflow';

interface SearchOptions {
  keyword?: string;
  device?: string;
  format?: string;
  volumeRange?: [number, number];
  category?: string;
}

interface SearchResult extends OperationNode {
  score: number;  // 用于结果排序的相关性分数
}

export const searchService = {
  searchNodes: (options: SearchOptions): SearchResult[] => {
    const results: SearchResult[] = [];
    
    for (const node of operationNodes) {
      let score = 0;
      let matches = true;
      
      // 1. 关键词匹配（标题、描述）
      if (options.keyword) {
        const keyword = options.keyword.toLowerCase();
        if (node.label.toLowerCase().includes(keyword)) {
          score += 3;  // 标题匹配权重更高
        }
        if (node.description?.toLowerCase().includes(keyword)) {
          score += 2;
        }
        if (score === 0) {
          matches = false;  // 如果关键词没有匹配，直接跳过
        }
      }

      // 2. 设备匹配
      if (matches && options.device && node.supportedDevices) {
        const deviceMatch = node.supportedDevices.some(device => 
          device.manufacturer.toLowerCase().includes(options.device!.toLowerCase()) ||
          device.model.toLowerCase().includes(options.device!.toLowerCase())
        );
        if (!deviceMatch) {
          matches = false;
        } else {
          score += 2;
        }
      }

      // 3. 板型格式匹配
      if (matches && options.format && node.supportedDevices) {
        const formatMatch = node.supportedDevices.some(device =>
          device.constraints?.plateFormat?.some(format => 
            format.toLowerCase().includes(options.format!.toLowerCase())
          )
        );
        if (!formatMatch) {
          matches = false;
        } else {
          score += 1;
        }
      }

      // 4. 体积范围匹配
      if (matches && options.volumeRange && node.supportedDevices) {
        const [minVol, maxVol] = options.volumeRange;
        const volumeMatch = node.supportedDevices.some(device => {
          const range = device.constraints?.volumeRange;
          return range && range[0] <= minVol && range[1] >= maxVol;
        });
        if (!volumeMatch) {
          matches = false;
        } else {
          score += 1;
        }
      }

      // 5. 类别匹配
      if (matches && options.category) {
        if (node.category.toLowerCase() !== options.category.toLowerCase()) {
          matches = false;
        } else {
          score += 2;
        }
      }

      // 如果所有条件都匹配，添加到结果中
      if (matches) {
        results.push({
          ...node,
          score
        });
      }
    }

    // 按相关性分数排序
    return results.sort((a, b) => b.score - a.score);
  },

  // 解析搜索语法
  parseSearchString: (searchString: string): SearchOptions => {
    const terms = searchString.split(' ');
    const options: SearchOptions = {};

    terms.forEach(term => {
      if (term.startsWith('@device:')) {
        options.device = term.slice(8);
      } else if (term.startsWith('@format:')) {
        options.format = term.slice(8);
      } else if (term.startsWith('@category:')) {
        options.category = term.slice(10);
      } else if (term.startsWith('@volume:')) {
        const range = term.slice(8).split('-');
        if (range.length === 2) {
          options.volumeRange = [parseFloat(range[0]), parseFloat(range[1])];
        }
      } else if (term) {
        options.keyword = options.keyword 
          ? `${options.keyword} ${term}`
          : term;
      }
    });

    return options;
  }
}; 