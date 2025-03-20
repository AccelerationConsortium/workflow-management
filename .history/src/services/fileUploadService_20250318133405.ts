export const fileUploadService = {
  uploadFile: async (nodeId: string, inputId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nodeId', nodeId);
      formData.append('inputId', inputId);

      // TODO: 替换为实际的 API 端点
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },

  parseFile: async (file: File) => {
    // 根据文件类型解析文件内容
    const content = await file.text();
    if (file.name.endsWith('.csv')) {
      // 解析 CSV
      return parseCSV(content);
    } else if (file.name.endsWith('.json')) {
      // 解析 JSON
      return JSON.parse(content);
    }
    // ... 添加其他文件类型的处理
  }
};

function parseCSV(content: string) {
  // 简单的 CSV 解析实现
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim();
      return obj;
    }, {} as Record<string, string>);
  });
  return data;
} 