import React, { useState, useCallback, useEffect } from 'react';
import { NodeProps } from 'reactflow';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  ButtonGroup,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ScienceIcon from '@mui/icons-material/Science';
import { BaseUONode } from '../BaseUONode';
import * as XLSX from 'xlsx';

interface CVANodeParameters {
  cycles_per_measurement: number;
  vs_ref: string;
  sample_interval: number;
}

interface BatchIterationParameters {
  iteration: number;
  start_voltage: number;
  end_voltage: number;
  scan_rate: number;
}

const baseParametersDefinition = {
  cycles_per_measurement: {
    type: 'number',
    label: 'Cycles Per Measurement',
    description: 'Number of cycles for each measurement',
    min: 1,
    defaultValue: 3,
    required: true
  },
  vs_ref: {
    type: 'string',
    label: 'VS Ref',
    description: 'Voltage measurement against reference electrode',
    defaultValue: 'true',
    options: [
      { label: 'True', value: 'true' },
      { label: 'False', value: 'false' }
    ],
    required: true
  },
  sample_interval: {
    type: 'number',
    label: 'Sample Interval',
    unit: 's',
    description: 'Time between measurements',
    min: 0.1,
    defaultValue: 0.1,
    required: true
  }
};

const defaultIterationParams: Omit<BatchIterationParameters, 'iteration'> = {
    start_voltage: -0.5,
    end_voltage: 0.5,
    scan_rate: 0.1,
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const UploadButton = styled('button')(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  border: 'none',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  }
}));

export const BatchCVANode: React.FC<NodeProps> = (props) => {
  const [baseParams, setBaseParams] = useState<CVANodeParameters>(() => ({
      cycles_per_measurement: props.data?.params?.cycles_per_measurement ?? baseParametersDefinition.cycles_per_measurement.defaultValue,
      vs_ref: props.data?.params?.vs_ref ?? baseParametersDefinition.vs_ref.defaultValue,
      sample_interval: props.data?.params?.sample_interval ?? baseParametersDefinition.sample_interval.defaultValue,
  }));

  const [batchIterations, setBatchIterations] = useState<BatchIterationParameters[]>(
      props.data?.params?.batch_iterations ?? []
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  const handleBaseParameterChange = useCallback((newParams: Partial<CVANodeParameters>) => {
     const updatedBaseParams = { ...baseParams, ...newParams };
     setBaseParams(updatedBaseParams);

     const fullNodeParams = {
         ...updatedBaseParams,
         batch_iterations: batchIterations
     };

     if (props.data.onParameterChange) {
         props.data.onParameterChange(props.id, fullNodeParams);
     }
  }, [baseParams, batchIterations, props.data, props.id]);

  const handleAddIteration = () => {
    setBatchIterations(prev => [
      ...prev,
      {
        iteration: prev.length + 1,
        ...defaultIterationParams
      }
    ]);
  };

  const handleRemoveIteration = (index: number) => {
    setBatchIterations(prev => prev.filter((_, i) => i !== index));
  };

  const handleIterationParameterChange = useCallback((index: number, field: keyof BatchIterationParameters, value: number) => {
    setBatchIterations(prev => prev.map((param, i) =>
      i === index ? { ...param, [field]: value } : param
    ));
  }, []);

  const handleApplyBatchParams = () => {
     const fullNodeParams = {
         ...baseParams,
         batch_iterations: batchIterations
     };
     if (props.data.onParameterChange) {
         props.data.onParameterChange(props.id, fullNodeParams);
     }
    setOpenDialog(false);
  };

  const handleUploadClick = () => {
    setOpenUploadDialog(true);
  };

  const handleUploadClose = () => {
    setOpenUploadDialog(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFileName(file.name);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result;
        let parsedIterations: BatchIterationParameters[] = [];
        const requiredHeaders = ['start_voltage', 'end_voltage', 'scan_rate'];

        if (file.name.endsWith('.csv')) {
          const text = content as string;
          const rows = text.split('\n')
            .map(row => row.split(','))
            .filter(row => row.length > 1);
          
          const headers = rows[0].map(h => h.trim().toLowerCase());

          parsedIterations = rows.slice(1)
            .filter(row => row.some(cell => cell.trim() !== ''))
            .map((row, index) => {
              const rowData: any = {};
              headers.forEach((header, i) => {
                const value = row[i]?.trim() || '';
                if (requiredHeaders.includes(header)) {
                  rowData[header] = value === '' ? null : (Number(value) || 0);
                }
              });

              return {
                iteration: index + 1,
                start_voltage: rowData.start_voltage ?? -0.5,
                end_voltage: rowData.end_voltage ?? 0.5,
                scan_rate: rowData.scan_rate ?? 0.1,
              };
            });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const data = new Uint8Array(content as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('Excel 文件格式不正确或没有数据');
          }

          const headers = (jsonData[0] as string[]).map(h => String(h).trim().toLowerCase());
          
          parsedIterations = (jsonData.slice(1) as any[])
            .filter(row => row.some((cell: unknown) => cell !== undefined && cell !== ''))
            .map((row, index) => {
              const rowData: any = {};
              headers.forEach((header, i) => {
                const value = row[i];
                if (requiredHeaders.includes(header)) {
                  rowData[header] = value === undefined || value === '' ? null : (Number(value) || 0);
                }
              });

              return {
                iteration: index + 1,
                start_voltage: rowData.start_voltage ?? -0.5,
                end_voltage: rowData.end_voltage ?? 0.5,
                scan_rate: rowData.scan_rate ?? 0.1,
              };
            });
        } else {
          throw new Error('Unsupported file type.');
        }

        if (parsedIterations.length > 0) {
          setBatchIterations(parsedIterations);
          setOpenDialog(true);
          const fullNodeParams = { ...baseParams, batch_iterations: parsedIterations };
          if (props.data.onParameterChange) {
            props.data.onParameterChange(props.id, fullNodeParams);
          }
        } else {
          throw new Error('No valid iteration data found.');
        }
      };

      reader.onerror = () => {
        throw new Error('文件读取失败');
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('文件上传失败: ' + (error as Error).message);
      setUploadedFileName(null);
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleExportExcel = () => {
    console.log('Exporting parameters to Excel');
  };

  const BatchParametersDialog = () => (
    <Dialog
      open={openDialog}
      onClose={() => setOpenDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Batch Parameters</Typography>
          <Box>
            <Tooltip title="Export to Excel">
              <IconButton onClick={handleExportExcel}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Iteration">
              <IconButton onClick={handleAddIteration}>
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableCell>Iter.</StyledTableCell>
                <StyledTableCell>Start V (V)</StyledTableCell>
                <StyledTableCell>End V (V)</StyledTableCell>
                <StyledTableCell>Scan Rate (V/s)</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batchIterations.map((param, index) => (
                <TableRow key={param.iteration}>
                  <StyledTableCell>{param.iteration}</StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.start_voltage}
                      onChange={(e) => handleIterationParameterChange(index, 'start_voltage', Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.end_voltage}
                      onChange={(e) => handleIterationParameterChange(index, 'end_voltage', Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.scan_rate}
                      onChange={(e) => handleIterationParameterChange(index, 'scan_rate', Number(e.target.value))}
                      step="0.001"
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <IconButton size="small" onClick={() => handleRemoveIteration(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleApplyBatchParams}>
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  const FileUploadControl = () => (
    <Box>
      <input
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        id="batch-parameters-upload"
        type="file"
        onChange={handleFileSelect}
      />
      <label htmlFor="batch-parameters-upload">
        <UploadButton>
          <FileUploadIcon sx={{ fontSize: 20 }} />
        </UploadButton>
      </label>
      {uploadedFileName && (
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          已上传: {uploadedFileName}
        </Typography>
      )}
    </Box>
  );

  const internalCleanup = () => {
    console.log(`Performing internal cleanup for BatchCVANode ${props.id}`);
    setBatchIterations([]);
    setOpenDialog(false);
    setUploadedFileName(null);
  };

  return (
    <>
      <BaseUONode
        {...props}
        data={{
          ...props.data,
          label: 'Batch CVA',
          parameters: baseParametersDefinition,
          params: baseParams,
          onParameterChange: handleBaseParameterChange,
          internalCleanup: internalCleanup,
          customControls: (
             <Box sx={{ p: 1, borderTop: '1px solid #eee', mt: 1}}>
                 <Button
                     variant="outlined"
                     size="small"
                     fullWidth
                     onClick={() => setOpenDialog(true)}
                     startIcon={<ScienceIcon />}
                 >
                    Configure Batch ({batchIterations.length} Iterations)
                 </Button>
                 {uploadedFileName && <Typography variant="caption" display="block" sx={{mt:0.5, textAlign:'center'}}>File: {uploadedFileName}</Typography>}
             </Box>
          )
        }}
      />
      <BatchParametersDialog />

      <Dialog open={openUploadDialog} onClose={handleUploadClose}>
        <DialogTitle>上传批量参数文件</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            请选择 CSV 或 Excel 文件上传。文件应包含以下列：
          </Typography>
          <ul>
            <li>start_voltage（起始电压）</li>
            <li>end_voltage（结束电压）</li>
            <li>scan_rate（扫描速率）</li>
            <li>cycles_per_measurement（每次测量的循环数）</li>
            <li>sample_interval（采样间隔）</li>
            <li>vs_ref（是否使用参考电极）</li>
          </ul>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              startIcon={<FileUploadIcon />}
            >
              选择文件
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                hidden
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose}>取消</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
