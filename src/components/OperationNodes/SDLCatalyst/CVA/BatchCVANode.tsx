import React, { useState } from 'react';
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

interface CVAParameters {
  cycles_per_measurement: number;
  vs_ref: boolean;
  sample_interval: number;
}

interface BatchParameters extends CVAParameters {
  iteration: number;
  start_voltage: number;
  end_voltage: number;
  scan_rate: number;
}

const parameters = {
  cycles_per_measurement: {
    type: 'number',
    label: 'Cycles Per Measurement',
    description: 'Number of cycles for each measurement',
    min: 1,
    defaultValue: 3,
    required: true
  },
  vs_ref: {
    type: 'boolean',
    label: 'VS',
    description: 'Voltage measurement against reference electrode',
    defaultValue: true
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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
}));

// 文件上传按钮样式
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
  const [batchParameters, setBatchParameters] = useState<BatchParameters[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);

  const handleAddIteration = () => {
    setBatchParameters(prev => [
      ...prev,
      {
        iteration: prev.length + 1,
        start_voltage: -0.5,
        end_voltage: 0.5,
        scan_rate: 0.1,
        cycles_per_measurement: parameters.cycles_per_measurement.defaultValue,
        sample_interval: parameters.sample_interval.defaultValue,
        vs_ref: parameters.vs_ref.defaultValue
      }
    ]);
  };

  const handleRemoveIteration = (index: number) => {
    setBatchParameters(prev => prev.filter((_, i) => i !== index));
  };

  const handleParameterChange = (index: number, field: keyof BatchParameters, value: number) => {
    setBatchParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
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
        let parsedData: BatchParameters[] = [];

        if (file.name.endsWith('.csv')) {
          // 解析 CSV
          const text = content as string;
          const rows = text.split('\n')
            .map(row => row.split(','))
            .filter(row => row.length > 1);
          
          const headers = rows[0].map(h => h.trim().toLowerCase());

          parsedData = rows.slice(1)
            .filter(row => row.some(cell => cell.trim() !== ''))
            .map((row, index) => {
              const rowData: any = {};
              headers.forEach((header, i) => {
                const value = row[i]?.trim() || '';
                if (header === 'vs_ref') {
                  rowData[header] = value.toLowerCase() === 'true' || value === '1';
                } else {
                  rowData[header] = value === '' ? null : (Number(value) || 0);
                }
              });

              return {
                iteration: index + 1,
                start_voltage: rowData.start_voltage ?? -0.5,
                end_voltage: rowData.end_voltage ?? 0.5,
                scan_rate: rowData.scan_rate ?? 0.1,
                cycles_per_measurement: rowData.cycles_per_measurement ?? parameters.cycles_per_measurement.defaultValue,
                sample_interval: rowData.sample_interval ?? parameters.sample_interval.defaultValue,
                vs_ref: typeof rowData.vs_ref === 'boolean' ? rowData.vs_ref : parameters.vs_ref.defaultValue
              };
            });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // 解析 Excel
          const data = new Uint8Array(content as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length < 2) {
            throw new Error('Excel 文件格式不正确或没有数据');
          }

          const headers = (jsonData[0] as string[]).map(h => String(h).trim().toLowerCase());
          
          parsedData = (jsonData.slice(1) as any[])
            .filter(row => row.some((cell: unknown) => cell !== undefined && cell !== ''))
            .map((row, index) => {
              const rowData: any = {};
              headers.forEach((header, i) => {
                const value = row[i];
                if (header === 'vs_ref') {
                  rowData[header] = String(value).toLowerCase() === 'true' || value === 1;
                } else {
                  rowData[header] = value === undefined || value === '' ? null : (Number(value) || 0);
                }
              });

              return {
                iteration: index + 1,
                start_voltage: rowData.start_voltage ?? -0.5,
                end_voltage: rowData.end_voltage ?? 0.5,
                scan_rate: rowData.scan_rate ?? 0.1,
                cycles_per_measurement: rowData.cycles_per_measurement ?? parameters.cycles_per_measurement.defaultValue,
                sample_interval: rowData.sample_interval ?? parameters.sample_interval.defaultValue,
                vs_ref: typeof rowData.vs_ref === 'boolean' ? rowData.vs_ref : parameters.vs_ref.defaultValue
              };
            });
        }

        if (parsedData.length > 0) {
          setBatchParameters(parsedData);
          setOpenDialog(true);
          handleUploadClose();
          // 通知父组件参数更新
          if (props.data.onParameterChange) {
            props.data.onParameterChange(parsedData);
          }
        } else {
          throw new Error('没有找到有效的数据');
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

    // 清除 input 的值以支持重复上传
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export logic
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
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell>Iteration</StyledTableCell>
                <StyledTableCell>Start V (V)</StyledTableCell>
                <StyledTableCell>End V (V)</StyledTableCell>
                <StyledTableCell>Scan Rate (V/s)</StyledTableCell>
                <StyledTableCell>Cycles/Measure</StyledTableCell>
                <StyledTableCell>Sample Int. (s)</StyledTableCell>
                <StyledTableCell>Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batchParameters.map((param, index) => (
                <TableRow key={param.iteration}>
                  <StyledTableCell>{param.iteration}</StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.start_voltage}
                      onChange={(e) => handleParameterChange(index, 'start_voltage', Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.end_voltage}
                      onChange={(e) => handleParameterChange(index, 'end_voltage', Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.scan_rate}
                      onChange={(e) => handleParameterChange(index, 'scan_rate', Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.cycles_per_measurement}
                      onChange={(e) => handleParameterChange(index, 'cycles_per_measurement', Number(e.target.value))}
                      style={{ width: '80px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                    <input
                      type="number"
                      value={param.sample_interval}
                      onChange={(e) => handleParameterChange(index, 'sample_interval', Number(e.target.value))}
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
        <Button onClick={() => setOpenDialog(false)}>Close</Button>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(false)}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );

  // 自定义文件上传输入控件
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

  return (
    <>
      <BaseUONode
        {...props}
        data={{
          ...props.data,
          label: 'Batch CVA',
          parameters: {
            ...parameters,
            uploadButton: {
              type: 'custom',
              label: '上传批量参数',
              render: () => (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUploadClick}
                  fullWidth
                  startIcon={<FileUploadIcon />}
                >
                  {uploadedFileName || '上传 CSV/Excel 文件'}
                </Button>
              )
            }
          },
          onDelete: (id: string) => {
            // 清理当前节点的状态
            setBatchParameters([]);
            setOpenDialog(false);
            setOpenUploadDialog(false);
            setUploadedFileName(null);
          },
          onNodeDelete: (id: string) => {
            // 通知父组件节点被删除
            if (props.data.onNodeDelete) {
              props.data.onNodeDelete(id);
            }
          },
          onExport: () => {
            console.log('Exporting CVA configuration');
            console.log('Batch parameters:', batchParameters);
          }
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
