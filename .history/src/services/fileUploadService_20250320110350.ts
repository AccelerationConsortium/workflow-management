import { OperationNode } from '../types/workflow';

interface FileUploadResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  fileType: string;
  error?: string;
  data?: any;
}

export const fileUploadService = {
  // Validate file before upload
  validateFile(file: File, allowedTypes: string[]): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    // Check file type
    const fileType = file.type;
    if (allowedTypes && !allowedTypes.includes(fileType)) {
      return { 
        valid: false, 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'File size exceeds 10MB limit' 
      };
    }

    return { valid: true };
  },

  // Read file content
  async readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            // Parse content based on file type
            if (file.type === 'application/json') {
              resolve(JSON.parse(content));
            } else if (file.type === 'text/csv') {
              // Simple CSV parsing
              const rows = content.split('\n').map(row => row.split(','));
              resolve(rows);
            } else {
              resolve(content);
            }
          }
        } catch (error) {
          reject(new Error('Failed to parse file content'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'application/json' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  },

  // Upload file and process it
  async uploadFile(
    file: File, 
    nodeId: string, 
    inputId: string,
    allowedTypes: string[] = ['application/json', 'text/csv']
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, allowedTypes);
      if (!validation.valid) {
        return {
          success: false,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          error: validation.error
        };
      }

      // Read and process file content
      const data = await this.readFile(file);

      return {
        success: true,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        data
      };
    } catch (error) {
      return {
        success: false,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}; 
