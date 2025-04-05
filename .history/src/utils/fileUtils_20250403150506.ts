import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface BatchData {
  iteration: number;
  start_voltage: number;
  end_voltage: number;
  scan_rate: number;
  cycles_per_measurement: number;
  sample_interval: number;
  vs_ref: string;
}

export const parseCsvContent = (content: string): BatchData[] => {
  const { data } = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return data.map((row: any, index: number) => ({
    iteration: index + 1,
    start_voltage: parseFloat(row.start_voltage) || -0.5,
    end_voltage: parseFloat(row.end_voltage) || 0.5,
    scan_rate: parseFloat(row.scan_rate) || 0.1,
    cycles_per_measurement: parseInt(row.cycles_per_measurement) || 1,
    sample_interval: parseFloat(row.sample_interval) || 0.001,
    vs_ref: row.vs_ref || 'Ag/AgCl',
  }));
};

export const parseExcelContent = async (content: ArrayBuffer): Promise<BatchData[]> => {
  const workbook = XLSX.read(content, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(firstSheet);

  return data.map((row: any, index: number) => ({
    iteration: index + 1,
    start_voltage: parseFloat(row.start_voltage) || -0.5,
    end_voltage: parseFloat(row.end_voltage) || 0.5,
    scan_rate: parseFloat(row.scan_rate) || 0.1,
    cycles_per_measurement: parseInt(row.cycles_per_measurement) || 1,
    sample_interval: parseFloat(row.sample_interval) || 0.001,
    vs_ref: row.vs_ref || 'Ag/AgCl',
  }));
};

export const validateBatchData = (data: BatchData[]): void => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('数据格式无效：必须包含至少一行数据');
  }

  data.forEach((row, index) => {
    if (typeof row.start_voltage !== 'number' || isNaN(row.start_voltage)) {
      throw new Error(`第 ${index + 1} 行的起始电压无效`);
    }
    if (typeof row.end_voltage !== 'number' || isNaN(row.end_voltage)) {
      throw new Error(`第 ${index + 1} 行的结束电压无效`);
    }
    if (typeof row.scan_rate !== 'number' || isNaN(row.scan_rate) || row.scan_rate <= 0) {
      throw new Error(`第 ${index + 1} 行的扫描速率无效`);
    }
    if (typeof row.cycles_per_measurement !== 'number' || isNaN(row.cycles_per_measurement) || row.cycles_per_measurement < 1) {
      throw new Error(`第 ${index + 1} 行的每次测量循环数无效`);
    }
    if (typeof row.sample_interval !== 'number' || isNaN(row.sample_interval) || row.sample_interval <= 0) {
      throw new Error(`第 ${index + 1} 行的采样间隔无效`);
    }
  });
}; 
