import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { customUOService, CustomUONode } from '../../services/customUOService';
import { GeneratedUOSchema } from '../UOBuilder/types';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface UOManagementModalProps {
  open: boolean;
  onClose: () => void;
  onEditUO?: (uo: GeneratedUOSchema) => void;
}

export const UOManagementModal: React.FC<UOManagementModalProps> = ({
  open,
  onClose,
  onEditUO
}) => {
  const [customUOs, setCustomUOs] = useState<CustomUONode[]>([]);
  const [selectedUOs, setSelectedUOs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uoToDelete, setUoToDelete] = useState<string | string[] | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  // Load custom UOs
  useEffect(() => {
    if (open) {
      loadCustomUOs();
    }
  }, [open]);

  // Subscribe to UO changes
  useEffect(() => {
    const unsubscribe = customUOService.subscribe((uos) => {
      setCustomUOs(uos);
    });
    return unsubscribe;
  }, []);

  const loadCustomUOs = () => {
    const uos = customUOService.getCustomUONodes();
    setCustomUOs(uos);
    setSelectedUOs(new Set());
  };

  const filteredUOs = customUOs.filter(uo =>
    uo.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uo.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUO = (uoId: string) => {
    const newSelected = new Set(selectedUOs);
    if (newSelected.has(uoId)) {
      newSelected.delete(uoId);
    } else {
      newSelected.add(uoId);
    }
    setSelectedUOs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUOs.size === filteredUOs.length) {
      setSelectedUOs(new Set());
    } else {
      setSelectedUOs(new Set(filteredUOs.map(uo => uo.type)));
    }
  };

  const handleDeleteSingle = (uoId: string) => {
    setUoToDelete(uoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedUOs.size === 0) return;
    setUoToDelete(Array.from(selectedUOs));
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!uoToDelete) return;

    try {
      if (Array.isArray(uoToDelete)) {
        // Batch delete
        const result = customUOService.deleteMultipleUOs(uoToDelete);
        if (result.success.length > 0) {
          setSnackbar({
            open: true,
            message: `Successfully deleted ${result.success.length} UO(s)`,
            severity: 'success'
          });
        }
        if (result.failed.length > 0) {
          setSnackbar({
            open: true,
            message: `Failed to delete ${result.failed.length} UO(s)`,
            severity: 'error'
          });
        }
        setSelectedUOs(new Set());
      } else {
        // Single delete
        const success = customUOService.deleteUO(uoToDelete);
        if (success) {
          setSnackbar({
            open: true,
            message: 'UO deleted successfully',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to delete UO',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting',
        severity: 'error'
      });
    }

    setDeleteDialogOpen(false);
    setUoToDelete(null);
  };

  const handleEditUO = (uo: CustomUONode) => {
    if (onEditUO) {
      onEditUO(uo.schema);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Manage Custom Unit Operations</Typography>
            <Typography variant="body2" color="text.secondary">
              {customUOs.length} UO(s) registered
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {/* Search and Actions Bar */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search UOs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              startIcon={<SelectAllIcon />}
              onClick={handleSelectAll}
              size="small"
              variant="outlined"
            >
              {selectedUOs.size === filteredUOs.length ? 'Deselect All' : 'Select All'}
            </Button>

            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDeleteMultiple}
              disabled={selectedUOs.size === 0}
              color="error"
              variant="outlined"
              size="small"
            >
              Delete Selected ({selectedUOs.size})
            </Button>
          </Box>

          {/* UO Table */}
          {filteredUOs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'No UOs match your search' : 'No custom UOs found'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first custom UO to get started'}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUOs.size === filteredUOs.length && filteredUOs.length > 0}
                        indeterminate={selectedUOs.size > 0 && selectedUOs.size < filteredUOs.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Parameters</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUOs.map((uo) => (
                    <TableRow
                      key={uo.type}
                      hover
                      selected={selectedUOs.has(uo.type)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUOs.has(uo.type)}
                          onChange={() => handleSelectUO(uo.type)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {uo.label}
                          </Typography>
                          {uo.isCustom && (
                            <Chip
                              label="Custom"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={uo.category}
                          size="small"
                          sx={{ backgroundColor: uo.color || '#8F7FE8', color: 'white' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {uo.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {uo.schema.parameters.length} parameter(s)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(uo.schema.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Edit UO">
                            <IconButton
                              size="small"
                              onClick={() => handleEditUO(uo)}
                              disabled={!onEditUO}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete UO">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSingle(uo.type)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        uoToDelete={uoToDelete}
        customUOs={customUOs}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
