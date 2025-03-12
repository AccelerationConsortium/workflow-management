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
  Grid,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  KeyboardReturn as KeyboardReturnIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { unitOperationsApi, laboratoriesApi } from '../services/api';
import { SpecificUnitOperation, UnitOperationCategory, UnitOperationStatus, Laboratory } from '../types/UnitOperation';
import { formatDate } from '../utils/formatters';

const SpecificUnitOperations: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [laboratoryFilter, setLaboratoryFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [specificUOs, setSpecificUOs] = useState<SpecificUnitOperation[]>([]);
  const [filteredUOs, setFilteredUOs] = useState<SpecificUnitOperation[]>([]);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  
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
  
  // Fetch all laboratories
  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        const data = await laboratoriesApi.getAll();
        setLaboratories(data);
      } catch (error) {
        console.error('Failed to fetch laboratories:', error);
        setNotification({
          show: true,
          message: 'Failed to fetch laboratories. Using default data.',
          type: 'warning'
        });
      }
    };
    
    fetchLaboratories();
  }, []);
  
  // Fetch all specific UOs
  useEffect(() => {
    const fetchSpecificUOs = async () => {
      try {
        setLoading(true);
        const data = await unitOperationsApi.getSpecific(laboratoryFilter);
        setSpecificUOs(data);
        setFilteredUOs(data);
      } catch (error) {
        console.error('Failed to fetch specific unit operations:', error);
        setNotification({
          show: true,
          message: 'Failed to fetch specific unit operations. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecificUOs();
  }, [laboratoryFilter]);
  
  // Filter UOs when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUOs(specificUOs);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = specificUOs.filter(uo => 
        uo.name.toLowerCase().includes(lowercasedSearch) || 
        uo.description.toLowerCase().includes(lowercasedSearch) ||
        getCategoryDisplayName(uo.category).toLowerCase().includes(lowercasedSearch) ||
        getLaboratoryName(uo.laboratoryId).toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUOs(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, specificUOs, laboratories]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle UO deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this specific unit operation?')) {
      try {
        await unitOperationsApi.delete(id);
        setSpecificUOs(prevUOs => prevUOs.filter(uo => uo.id !== id));
        setNotification({
          show: true,
          message: 'Unit operation deleted successfully.',
          type: 'success'
        });
      } catch (error) {
        console.error('Failed to delete unit operation:', error);
        setNotification({
          show: true,
          message: 'Failed to delete unit operation.',
          type: 'error'
        });
      }
    }
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };
  
  const getLaboratoryName = (labId: string) => {
    const lab = laboratories.find(l => l.id === labId);
    return lab ? lab.name : labId;
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
          Specific Unit Operations
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link}
          to="/unit-operations/generic" 
          startIcon={<KeyboardReturnIcon />}
        >
          Browse Generic Templates
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Specific unit operations are customized versions of generic templates for use in specific laboratories.
      </Typography>
      
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, category, or laboratory..."
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
          <FormControl fullWidth>
            <InputLabel id="laboratory-filter-label">Filter by Laboratory</InputLabel>
            <Select
              labelId="laboratory-filter-label"
              value={laboratoryFilter}
              label="Filter by Laboratory"
              onChange={(e) => setLaboratoryFilter(e.target.value as string)}
            >
              <MenuItem value="">All Laboratories</MenuItem>
              {laboratories.map((lab) => (
                <MenuItem key={lab.id} value={lab.id}>
                  {lab.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
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
                  <TableCell>Laboratory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUOs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" py={2}>
                        No specific unit operations found.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        component={Link}
                        to="/unit-operations/generic"
                        sx={{ my: 1 }}
                      >
                        Browse Generic Templates
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUOs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((uo) => (
                      <TableRow key={uo.id} hover>
                        <TableCell>
                          <Link to={`/unit-operations/specific/${uo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body1" fontWeight="medium">
                              {uo.name}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>{getCategoryDisplayName(uo.category)}</TableCell>
                        <TableCell>{getLaboratoryName(uo.laboratoryId)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusDisplayName(uo.status)} 
                            size="small" 
                            color={getStatusColor(uo.status)}
                          />
                        </TableCell>
                        <TableCell>{formatDate(uo.updatedAt)}</TableCell>
                        <TableCell align="center">
                          <Box display="flex" justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small"
                                component={Link} 
                                to={`/unit-operations/specific/${uo.id}`}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small"
                                component={Link} 
                                to={`/unit-operations/specific/${uo.id}/edit`}
                              >
                                <EditIcon />
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
          
          {filteredUOs.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUOs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          )}
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

export default SpecificUnitOperations; 
