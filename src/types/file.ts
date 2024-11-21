export interface FileData {
  id: string;
  fileName: string;
  fileType: 'csv' | 'excel';
  headers: string[];
  preview: any[][];
  mapping: Record<string, string>;
}

export interface FileNodeData {
  label: string;
  fileData?: FileData;
} 