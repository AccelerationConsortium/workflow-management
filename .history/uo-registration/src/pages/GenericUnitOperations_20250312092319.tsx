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
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FileCopy as CloneIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { unitOperationsApi } from '../services/api';
import { GenericUnitOperation, UnitOperationCategory, UnitOperationStatus } from '../types/UnitOperation';
import { formatDate } from '../utils/formatters';

const GenericUnitOperations: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [genericUOs, setGenericUOs] = useState<GenericUnitOperation[]>([]);
  const [filteredUOs, setFilteredUOs] = useState<GenericUnitOperation[]>([]);
  
  // Notification states
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    show: false,
    message: '',
    type: 'info'
  });
  
  // Fetch all generic UOs
  useEffect(() => {
    const fetchGenericUOs = async () => {
      try {
        setLoading(true);
        const data = await unitOperationsApi.getGeneric();
        setGenericUOs(data);
        setFilteredUOs(data);
      } catch (error) {
        console.error('Failed to fetch generic unit operations:', error);
        setNotification({
          show: true,
          message: 'Failed to fetch generic unit operations. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenericUOs();
  }, []);
  
  // Filter UOs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUOs(genericUOs);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = genericUOs.filter(uo => 
        uo.name.toLowerCase().includes(lowercasedSearch) || 
        uo.description.toLowerCase().includes(lowercasedSearch) ||
        getCategoryDisplayName(uo.category).toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUOs(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, genericUOs]);
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle creating new specific UO from a generic UO
  const handleCreateSpecific = (genericUoId: string) => {
    navigate(`/unit-operations/specific/create?genericId=${genericUoId}`);
  };
  
  // Handle UO deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this generic unit operation?')) {
      try {
        await unitOperationsApi.delete(id);
        setGenericUOs(prevUOs => prevUOs.filter(uo => uo.id !== id));
        setNotification({
          show: true,
          message: 'Unit operation deleted successfully.',
          type: 'success'
        });
      } catch (error) {
        console.error('Failed to delete unit operation:', error);
        setNotification({
          show: true,
          message: 'Failed to delete unit operation. It may be in use by specific operations.',
          type: 'error'
        });
      }
    }
  };
  
  // Handle viewing derived specific UOs
  const handleViewDerived = (genericUoId: string) => {
    navigate(`/unit-operations/generic/${genericUoId}/derived`);
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  return (
    <Box>
      {/* Notification snackbar */}
      <Snackbar 
        open={notification.show} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Generic Unit Operations
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/unit-operations/generic/create"
        >
          Create New Generic UO
        </Button>
      </Box>
      
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search generic unit operations..."
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
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Parameters</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" py={2}>
                        No generic unit operations found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUOs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((uo) => (
                      <TableRow key={uo.id}>
                        <TableCell>
                          <Link to={`/unit-operations/generic/${uo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body1" fontWeight="medium">
                              {uo.name}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>{getCategoryDisplayName(uo.category)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusDisplayName(uo.status)} 
                            size="small" 
                            color={getStatusColor(uo.status)}
                          />
                        </TableCell>
                        <TableCell>{uo.parameters.length}</TableCell>
                        <TableCell>{formatDate(uo.updatedAt)}</TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                component={Link} 
                                to={`/unit-operations/generic/${uo.id}`}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                component={Link} 
                                to={`/unit-operations/generic/${uo.id}/edit`}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Create Specific UO">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleCreateSpecific(uo.id)}
                              >
                                <CloneIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View Derived UOs">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => handleViewDerived(uo.id)}
                              >
                                <AssignmentIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDelete(uo.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUOs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Box>
  );
};

// Helper function to get category display name
const getCategoryDisplayName = (category: UnitOperationCategory): string => {
  switch (category) {
    case UnitOperationCategory.REACTION:
      return 'Reaction';
    case UnitOperationCategory.SEPARATION:
      return 'Separation';
    case UnitOperationCategory.HEAT_TRANSFER:
      return 'Heat Transfer';
    case UnitOperationCategory.MASS_TRANSFER:
      return 'Mass Transfer';
    case UnitOperationCategory.FLUID_FLOW:
      return 'Fluid Flow';
    case UnitOperationCategory.OTHERS:
      return 'Others';
    default:
      return category;
  }
};

// Helper function to get status display name
const getStatusDisplayName = (status: UnitOperationStatus): string => {
  switch (status) {
    case UnitOperationStatus.DRAFT:
      return 'Draft';
    case UnitOperationStatus.PENDING_REVIEW:
      return 'Pending Review';
    case UnitOperationStatus.APPROVED:
      return 'Approved';
    case UnitOperationStatus.REJECTED:
      return 'Rejected';
    case UnitOperationStatus.ARCHIVED:
      return 'Archived';
    default:
      return status;
  }
};

// Helper function for status chip color
const getStatusColor = (status: UnitOperationStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case UnitOperationStatus.DRAFT:
      return 'default';
    case UnitOperationStatus.PENDING_REVIEW:
      return 'warning';
    case UnitOperationStatus.APPROVED:
      return 'success';
    case UnitOperationStatus.REJECTED:
      return 'error';
    case UnitOperationStatus.ARCHIVED:
      return 'secondary';
    default:
      return 'default';
  }
};

export default GenericUnitOperations; 
