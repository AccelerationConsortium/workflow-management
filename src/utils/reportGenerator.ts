interface ExecutionResult {
  nodeId: string;
  type: string;
  status: string;
  output: {
    timestamp: string;
    data: any;
  };
}

export function generateWorkflowReport(results: ExecutionResult[]): string {
  // 生成CSV表头
  const headers = ['Node ID', 'Type', 'Status', 'Timestamp', 'Output Data'];
  
  // 生成CSV行
  const rows = results.map(result => [
    result.nodeId,
    result.type,
    result.status,
    result.output.timestamp,
    JSON.stringify(result.output.data)
  ]);

  // 组合CSV内容
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if ((navigator as any).msSaveBlob) {
    // IE 10+
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    // 其他浏览器
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 