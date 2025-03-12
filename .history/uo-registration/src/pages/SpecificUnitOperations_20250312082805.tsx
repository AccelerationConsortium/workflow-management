import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  KeyboardReturn as KeyboardReturnIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { unitOperationsApi } from '../services/api';
import { SpecificUnitOperation, UnitOperationType } from '../types/UnitOperation';

// 模拟实验室数据，实际应用中应该从API获取
const MOCK_LABORATORIES = [
  { id: 'lab001', name: 'Laboratory A' },
  { id: 'lab002', name: 'Laboratory B' },
  { id: 'lab003', name: 'Laboratory C' },
];

const SpecificUnitOperations: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [laboratoryFilter, setLaboratoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [specificOperations, setSpecificOperations] = useState<SpecificUnitOperation[]>([]);
  
  // 获取所有特定UO
  useEffect(() => {
    const fetchSpecificOperations = async () => {
      try {
        setLoading(true);
        const response = await unitOperationsApi.getSpecific(laboratoryFilter);
        setSpecificOperations(response);
      } catch (error) {
        console.error('Error fetching specific unit operations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecificOperations();
  }, [laboratoryFilter]);
  
  // 根据搜索词过滤
  const filteredOperations = specificOperations.filter(
    (operation) => 
      operation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operation.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const getLaboratoryName = (labId: string) => {
    const lab = MOCK_LABORATORIES.find(l => l.id === labId);
    return lab ? lab.name : labId;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Specific Unit Operations
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/unit-operations/generic')}
          startIcon={<KeyboardReturnIcon />}
        >
          Go to Generic Templates
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Specific unit operations are customized versions of generic templates for use in specific laboratories.
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="laboratory-filter-label">Filter by Laboratory</InputLabel>
            <Select
              labelId="laboratory-filter-label"
              value={laboratoryFilter}
              label="Filter by Laboratory"
              onChange={(e) => setLaboratoryFilter(e.target.value as string)}
            >
              <MenuItem value="">All Laboratories</MenuItem>
              {MOCK_LABORATORIES.map((lab) => (
                <MenuItem key={lab.id} value={lab.id}>
                  {lab.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Category</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Laboratory</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Last Updated</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No specific unit operations found
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate('/unit-operations/generic')}
                      sx={{ my: 1 }}
                    >
                      Browse Generic Templates
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOperations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((operation) => (
                    <TableRow key={operation.id} hover>
                      <TableCell>{operation.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.category} 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{getLaboratoryName(operation.laboratoryId)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.status} 
                          color={getStatusColor(operation.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{operation.updatedAt}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/unit-operations/${operation.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="secondary"
                            onClick={() => navigate(`/unit-operations/${operation.id}/edit`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error"
                            onClick={() => {
                              // Would call delete API in real implementation
                              alert(`Delete operation ${operation.id}`);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          {filteredOperations.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredOperations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
        </TableContainer>
      )}
    </Box>
  );
};

export default SpecificUnitOperations; 
