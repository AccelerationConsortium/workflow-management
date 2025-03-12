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
  Card,
  CardHeader,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { unitOperationsApi } from '../services/api';
import { GenericUnitOperation, SpecificUnitOperation, UnitOperationType } from '../types/UnitOperation';

const GenericUnitOperations: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [genericOperations, setGenericOperations] = useState<GenericUnitOperation[]>([]);
  const [expandedGenericId, setExpandedGenericId] = useState<string | null>(null);
  const [derivedOperations, setDerivedOperations] = useState<Record<string, SpecificUnitOperation[]>>({});
  
  // 获取所有通用UO
  useEffect(() => {
    const fetchGenericOperations = async () => {
      try {
        setLoading(true);
        const response = await unitOperationsApi.getGeneric();
        setGenericOperations(response);
      } catch (error) {
        console.error('Error fetching generic unit operations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGenericOperations();
  }, []);
  
  // 获取特定通用UO的派生UO
  const fetchDerivedOperations = async (genericId: string) => {
    if (derivedOperations[genericId]) {
      // 已加载过，切换显示/隐藏状态
      setExpandedGenericId(expandedGenericId === genericId ? null : genericId);
      return;
    }
    
    try {
      const response = await unitOperationsApi.getDerivedOperations(genericId);
      setDerivedOperations({
        ...derivedOperations,
        [genericId]: response
      });
      setExpandedGenericId(genericId);
    } catch (error) {
      console.error(`Error fetching derived operations for generic UO ${genericId}:`, error);
    }
  };
  
  // 根据搜索词过滤
  const filteredOperations = genericOperations.filter(
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

  // 创建特定UO
  const handleCreateSpecificUO = (genericId: string) => {
    navigate(`/unit-operations/create-specific/${genericId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Generic Unit Operations
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/unit-operations/create-generic')}
        >
          Add New Generic UO
        </Button>
      </Box>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Generic unit operations serve as templates that can be customized by individual laboratories. 
        Click on a generic operation to see derived specific operations.
      </Typography>
      
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
      
      {loading ? (
        <Typography variant="body1">Loading...</Typography>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><Typography variant="subtitle2">Name</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Category</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Parameters</Typography></TableCell>
                <TableCell><Typography variant="subtitle2">Last Updated</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOperations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((operation) => (
                  <React.Fragment key={operation.id}>
                    <TableRow 
                      hover 
                      onClick={() => fetchDerivedOperations(operation.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {expandedGenericId === operation.id ? 
                            <ExpandLessIcon sx={{ mr: 1 }} /> : 
                            <ExpandMoreIcon sx={{ mr: 1 }} />
                          }
                          {operation.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={operation.category} 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{operation.defaultParameters.length}</TableCell>
                      <TableCell>{operation.updatedAt}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton 
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/unit-operations/${operation.id}`);
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/unit-operations/${operation.id}/edit`);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Create Specific UO">
                          <IconButton 
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateSpecificUO(operation.id);
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    
                    {/* 派生的特定UO */}
                    <TableRow>
                      <TableCell 
                        style={{ paddingBottom: 0, paddingTop: 0 }} 
                        colSpan={5}
                      >
                        <Collapse 
                          in={expandedGenericId === operation.id} 
                          timeout="auto" 
                          unmountOnExit
                        >
                          <Box sx={{ py: 2, px: 3, backgroundColor: '#f8f9fa' }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Derived Specific Unit Operations
                            </Typography>
                            
                            {!derivedOperations[operation.id] ? (
                              <Typography variant="body2" color="text.secondary">
                                Loading derived operations...
                              </Typography>
                            ) : derivedOperations[operation.id].length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No specific unit operations have been derived from this generic template.
                              </Typography>
                            ) : (
                              <List component={Paper} variant="outlined" sx={{ mb: 2 }}>
                                {derivedOperations[operation.id].map((derived) => (
                                  <ListItem key={derived.id} divider>
                                    <ListItemText
                                      primary={derived.name}
                                      secondary={`Lab: ${derived.laboratoryId} • Updated: ${derived.updatedAt}`}
                                    />
                                    <ListItemSecondaryAction>
                                      <Tooltip title="View">
                                        <IconButton 
                                          edge="end" 
                                          aria-label="view"
                                          onClick={() => navigate(`/unit-operations/${derived.id}`)}
                                        >
                                          <VisibilityIcon />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Edit">
                                        <IconButton 
                                          edge="end" 
                                          aria-label="edit"
                                          onClick={() => navigate(`/unit-operations/${derived.id}/edit`)}
                                        >
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </List>
                            )}
                            
                            <Button 
                              variant="outlined" 
                              color="primary"
                              startIcon={<AddIcon />}
                              onClick={() => handleCreateSpecificUO(operation.id)}
                            >
                              Create New Specific UO from this Template
                            </Button>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
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
      )}
    </Box>
  );
};

export default GenericUnitOperations; 
