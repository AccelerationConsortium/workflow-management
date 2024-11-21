export interface SampleFile {
  id: string;
  name: string;
  description: string;
  data: {
    headers: string[];
    rows: any[][];
  };
}

export const sampleFiles: SampleFile[] = [
  {
    id: 'csv1',
    name: 'Sample Concentration Data.csv',
    description: 'Concentration measurements for 10 samples',
    data: {
      headers: ['Sample ID', 'Concentration (mg/mL)', 'Volume (μL)', 'Temperature (°C)'],
      rows: [
        ['Sample-001', 1.5, 100, 25],
        ['Sample-002', 2.0, 150, 25],
        ['Sample-003', 1.8, 120, 25],
        ['Sample-004', 2.2, 110, 25],
        ['Sample-005', 1.7, 130, 25]
      ]
    }
  },
  {
    id: 'csv2',
    name: 'Reaction Parameters.csv',
    description: 'Different reaction condition settings',
    data: {
      headers: ['Reaction ID', 'Temperature (°C)', 'Time (min)', 'pH Value', 'Pressure (bar)'],
      rows: [
        ['R-001', 37, 30, 7.2, 1.0],
        ['R-002', 42, 45, 7.4, 1.2],
        ['R-003', 35, 60, 7.0, 1.1],
        ['R-004', 40, 40, 7.3, 1.0],
        ['R-005', 38, 50, 7.1, 1.3]
      ]
    }
  },
  {
    id: 'csv3',
    name: 'Plate Layout.csv',
    description: '96-well plate sample distribution',
    data: {
      headers: ['Well Position', 'Sample Type', 'Volume (μL)', 'Notes'],
      rows: [
        ['A1', 'Control', 200, 'Blank'],
        ['A2', 'Test Group 1', 200, 'Low Concentration'],
        ['A3', 'Test Group 2', 200, 'High Concentration'],
        ['A4', 'Standard 1', 200, 'Reference'],
        ['A5', 'Standard 2', 200, 'Calibration']
      ]
    }
  },
  {
    id: 'csv4',
    name: 'HPLC Analysis.csv',
    description: 'HPLC analysis results for multiple samples',
    data: {
      headers: ['Peak ID', 'Retention Time (min)', 'Area', 'Height', 'Concentration (mg/L)'],
      rows: [
        ['P1', 2.45, 15234, 2456, 0.156],
        ['P2', 3.12, 25678, 3789, 0.234],
        ['P3', 4.56, 18945, 2890, 0.178],
        ['P4', 5.23, 30456, 4567, 0.289],
        ['P5', 6.78, 22345, 3234, 0.198]
      ]
    }
  },
  {
    id: 'csv5',
    name: 'Mass Spec Data.csv',
    description: 'Mass spectrometry analysis results',
    data: {
      headers: ['m/z', 'Intensity', 'Resolution', 'S/N Ratio', 'Charge State'],
      rows: [
        [234.56, 45678, 12000, 156, 2],
        [456.78, 78945, 15000, 234, 3],
        [678.90, 34567, 11000, 123, 1],
        [789.12, 56789, 13000, 189, 2],
        [890.23, 67890, 14000, 210, 3]
      ]
    }
  },
  {
    id: 'csv6',
    name: 'Cell Culture Data.csv',
    description: 'Cell culture growth and conditions monitoring',
    data: {
      headers: ['Time (h)', 'Cell Density (cells/mL)', 'Viability (%)', 'pH', 'DO (%)'],
      rows: [
        [0, 1.2e6, 98.5, 7.2, 95],
        [24, 2.5e6, 97.8, 7.1, 92],
        [48, 4.8e6, 96.5, 6.9, 88],
        [72, 8.2e6, 94.2, 6.8, 85],
        [96, 1.2e7, 92.1, 6.7, 82]
      ]
    }
  }
]; 