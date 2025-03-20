import { OperationNode } from '../types/workflow';

export interface FileUploadResult {
  success: boolean;
  fileName?: string;
  fileType?: string;
  data?: any;
  error?: string;
}

class FileUploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  private validateFile(file: File): string | null {
    if (!file) {
      return 'No file selected';
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }

    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload CSV, JSON, or Excel files.';
    }

    return null;
  }

  private async readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result;
          if (typeof content !== 'string') {
            reject('Invalid file content');
            return;
          }

          if (file.type === 'application/json') {
            resolve(JSON.parse(content));
          } else if (file.type === 'text/csv') {
            // Simple CSV parsing
            const rows = content.split('\n').map(row => row.split(','));
            const headers = rows[0];
            const data = rows.slice(1).map(row => {
              const obj: { [key: string]: string } = {};
              headers.forEach((header, index) => {
                obj[header.trim()] = row[index]?.trim() || '';
              });
              return obj;
            });
            resolve(data);
          } else {
            // For Excel files, we'll need a proper Excel parser library
            // For now, just return the raw content
            resolve(content);
          }
        } catch (error) {
          reject('Error parsing file content');
        }
      };

      reader.onerror = () => reject('Error reading file');
      
      if (file.type === 'application/json' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }

  public async uploadFile(
    file: File,
    nodeId: string,
    inputId: string
  ): Promise<FileUploadResult> {
    try {
      const validationError = this.validateFile(file);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      const data = await this.readFile(file);

      // Here you can add additional processing or API calls if needed
      // For now, we'll just return the parsed data

      return {
        success: true,
        fileName: file.name,
        fileType: file.type,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
}

export const fileUploadService = new FileUploadService(); 
