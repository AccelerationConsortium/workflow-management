import { parse as csvParse, stringify as csvStringify } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { FileType } from '../interfaces/IFileService';

/**
 * File format processing utilities
 * Only handles format conversion and basic structure validation
 * Does NOT perform data content validation
 */

export interface FormatOptions {
  encoding?: string;
  delimiter?: string;
  headers?: boolean;
  sheets?: string[];
}

/**
 * Parse CSV data
 * @param data Raw CSV string data
 * @param options Parsing options
 * @returns Parsed data as array or object
 */
export function parseCSV(data: string, options?: FormatOptions): any {
  try {
    return csvParse(data, {
      delimiter: options?.delimiter || ',',
      columns: options?.headers,
      skip_empty_lines: true,
      encoding: options?.encoding || 'utf-8'
    });
  } catch (error) {
    throw new Error(`CSV Parse Error: ${error.message}`);
  }
}

/**
 * Format data to CSV
 * @param data Data to format as CSV
 * @param options Formatting options
 * @returns CSV string
 */
export function formatCSV(data: any[], options?: FormatOptions): string {
  try {
    return csvStringify(data, {
      delimiter: options?.delimiter || ',',
      header: options?.headers,
      encoding: options?.encoding || 'utf-8'
    });
  } catch (error) {
    throw new Error(`CSV Format Error: ${error.message}`);
  }
}

/**
 * Parse Excel file data
 * @param data Excel file buffer
 * @param options Parsing options
 * @returns Parsed data as object with sheet data
 */
export function parseExcel(data: Buffer, options?: FormatOptions): any {
  try {
    const workbook = XLSX.read(data);
    const result: { [sheet: string]: any[] } = {};
    
    // Get sheets to process
    const sheets = options?.sheets || workbook.SheetNames;
    
    // Process each sheet
    for (const sheet of sheets) {
      if (workbook.SheetNames.includes(sheet)) {
        const worksheet = workbook.Sheets[sheet];
        result[sheet] = XLSX.utils.sheet_to_json(worksheet, {
          header: options?.headers ? 1 : undefined,
          raw: false
        });
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`Excel Parse Error: ${error.message}`);
  }
}

/**
 * Format data to Excel
 * @param data Data to format as Excel
 * @param options Formatting options
 * @returns Excel file buffer
 */
export function formatExcel(data: { [sheet: string]: any[] }, options?: FormatOptions): Buffer {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Process each sheet
    for (const [sheetName, sheetData] of Object.entries(data)) {
      const worksheet = XLSX.utils.json_to_sheet(sheetData, {
        header: options?.headers ? undefined : Object.keys(sheetData[0] || {})
      });
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }
    
    return XLSX.write(workbook, { type: 'buffer' });
  } catch (error) {
    throw new Error(`Excel Format Error: ${error.message}`);
  }
}

/**
 * Validate file structure based on type
 * Only checks file format validity, not data content
 */
export function validateFileStructure(data: any, type: FileType): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  switch (type) {
    case FileType.CSV:
      try {
        if (typeof data !== 'string') {
          errors.push('CSV data must be a string');
          break;
        }
        parseCSV(data);
      } catch (error) {
        errors.push(`Invalid CSV structure: ${error.message}`);
      }
      break;
      
    case FileType.EXCEL:
      try {
        if (!Buffer.isBuffer(data)) {
          errors.push('Excel data must be a buffer');
          break;
        }
        parseExcel(data);
      } catch (error) {
        errors.push(`Invalid Excel structure: ${error.message}`);
      }
      break;
      
    case FileType.JSON:
      try {
        if (typeof data === 'string') {
          JSON.parse(data);
        } else {
          JSON.stringify(data);
        }
      } catch (error) {
        errors.push(`Invalid JSON structure: ${error.message}`);
      }
      break;
      
    case FileType.TEXT:
      if (typeof data !== 'string') {
        errors.push('Text data must be a string');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
} 
