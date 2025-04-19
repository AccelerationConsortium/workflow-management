import * as XLSX from 'xlsx';

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'custom';
  field?: string;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationError {
  message: string;
  type: 'error' | 'warning';
  field?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  headers?: string[];
  preview?: any[];
}

export async function validateFile(
  file: File, 
  rules?: ValidationRule[]
): Promise<FileValidationResult> {
  const errors: ValidationError[] = [];
  
  try {
    // 验证文件类型
    if (!isValidFileType(file)) {
      errors.push({
        message: 'Invalid file type. Please upload CSV or Excel file.',
        type: 'error'
      });
      return { isValid: false, errors };
    }

    // 读取文件内容
    const data = await readFileContent(file);
    const headers = Object.keys(data[0] || {});

    // 验证必需字段
    if (rules) {
      rules.forEach(rule => {
        if (rule.type === 'required' && rule.field) {
          if (!headers.includes(rule.field)) {
            errors.push({
              message: rule.message || `Required field "${rule.field}" is missing`,
              type: 'error',
              field: rule.field
            });
          }
        }
      });
    }

    // 返回验证结果
    return {
      isValid: errors.length === 0,
      errors,
      headers,
      preview: data.slice(0, 5) // 返回前5行预览
    };
  } catch (error) {
    errors.push({
      message: 'Failed to process file: ' + (error.message || 'Unknown error'),
      type: 'error'
    });
    return { isValid: false, errors };
  }
}

function isValidFileType(file: File): boolean {
  const validTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  return validTypes.includes(file.type);
}

async function readFileContent(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
} 