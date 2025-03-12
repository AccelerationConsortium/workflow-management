import React, { useState } from 'react';
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
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data - would come from API in real implementation
const mockOperations = [
  { 
    id: '1', 
    name: 'Distillation Column', 
    category: 'Separation', 
    status: 'Active',
    createdAt: '2023-09-15', 
    updatedAt: '2023-10-15' 
  },
  { 
    id: '2', 
    name: 'Heat Exchanger', 
    category: 'Energy Transfer', 
    status: 'Active',
    createdAt: '2023-09-12', 
    updatedAt: '2023-10-12' 
  },
  { 
    id: '3', 
    name: 'Reactor', 
    category: 'Chemical Reaction', 
    status: 'Inactive',
    createdAt: '2023-09-10', 
    updatedAt: '2023-10-10' 
  },
  { 
    id: '4', 
    name: 'Absorption Column', 
    category: 'Separation', 
    status: 'Pending',
    createdAt: '2023-09-08', 
    updatedAt: '2023-10-08' 
  },
  { 
    id: '5', 
    name: 'Centrifuge', 
    category: 'Separation', 
    status: 'Active',
    createdAt: '2023-09-05', 
    updatedAt: '2023-10-05' 
  }
];

const UnitOperationsList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter operations based on search term
  const filteredOperations = mockOperations.filter(
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Unit Operations
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/unit-operations/create')}
        >
          Add New
        </Button>
      </Box>
      
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
        sx={{ mb: 3 }}
      />
      
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Category</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
              <TableCell><Typography variant="subtitle2">Last Updated</Typography></TableCell>
              <TableCell align="right"><Typography variant="subtitle2">Actions</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOperations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((operation) => (
                <TableRow key={operation.id} hover>
                  <TableCell>{operation.name}</TableCell>
                  <TableCell>{operation.category}</TableCell>
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
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOperations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default UnitOperationsList; 
 