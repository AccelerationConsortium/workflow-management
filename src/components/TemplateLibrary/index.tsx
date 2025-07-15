import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Download,
  Upload,
  Edit,
  Delete,
  Star,
  StarBorder,
  Share,
  Visibility,
  Code,
  Schedule,
  Security,
  Category,
  MoreVert,
  GetApp,
  CloudUpload,
} from '@mui/icons-material';
import { UOTemplate, TemplateFilter, templateService } from '../../services/templateService';
import { format } from 'date-fns';

interface TemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onUseTemplate?: (template: UOTemplate) => void;
}

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
} as const;

const TemplateCard: React.FC<{
  template: UOTemplate;
  onUse: (template: UOTemplate) => void;
  onEdit: (template: UOTemplate) => void;
  onDelete: (template: UOTemplate) => void;
  onExport: (template: UOTemplate) => void;
}> = ({ template, onUse, onEdit, onDelete, onExport }) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            {template.name}
          </Typography>
          <Box display="flex" alignItems="center">
            {template.metadata.isStandard && (
              <Tooltip title="Standard Operating Procedure">
                <Star color="warning" fontSize="small" />
              </Tooltip>
            )}
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {template.description}
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          <Chip
            label={template.category}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={template.metadata.difficulty}
            size="small"
            color={difficultyColors[template.metadata.difficulty]}
            variant="outlined"
          />
          {template.metadata.estimatedDuration && (
            <Chip
              icon={<Schedule />}
              label={`${template.metadata.estimatedDuration}min`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
          {template.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>

        <Box display="flex" justify="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Used {template.metadata.usageCount} times
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(template.updatedAt, 'MMM d, yyyy')}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          onClick={() => onUse(template)}
          size="small"
          fullWidth
        >
          Use Template
        </Button>
      </CardActions>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onEdit(template); handleMenuClose(); }}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onExport(template); handleMenuClose(); }}>
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => { onDelete(template); handleMenuClose(); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
};

const CreateTemplateDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (template: Partial<UOTemplate>) => void;
  initialData?: Partial<UOTemplate>;
}> = ({ open, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<UOTemplate>>(
    initialData || {
      name: '',
      description: '',
      category: 'Custom',
      nodeType: '',
      tags: [],
      parameters: {},
      metadata: {
        difficulty: 'intermediate',
        isPublic: false,
        isStandard: false,
        usageCount: 0,
      },
    }
  );

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Template' : 'Create New Template'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Node Type"
            value={formData.nodeType}
            onChange={(e) => setFormData({ ...formData, nodeType: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.metadata?.difficulty || 'intermediate'}
              onChange={(e) => setFormData({
                ...formData,
                metadata: {
                  ...formData.metadata,
                  difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                },
              })}
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  open,
  onClose,
  onUseTemplate,
}) => {
  const [templates, setTemplates] = useState<UOTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<UOTemplate[]>([]);
  const [filter, setFilter] = useState<TemplateFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UOTemplate | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  useEffect(() => {
    const filtered = templateService.filterTemplates({
      ...filter,
      searchTerm,
    });
    setFilteredTemplates(filtered);
  }, [templates, filter, searchTerm]);

  const loadTemplates = () => {
    const allTemplates = templateService.getAllTemplates();
    setTemplates(allTemplates);
  };

  const handleUseTemplate = (template: UOTemplate) => {
    templateService.useTemplate(template.id);
    if (onUseTemplate) {
      onUseTemplate(template);
    }
    loadTemplates(); // Refresh to update usage count
  };

  const handleCreateTemplate = (templateData: Partial<UOTemplate>) => {
    templateService.createTemplate(templateData);
    loadTemplates();
  };

  const handleEditTemplate = (template: UOTemplate) => {
    setEditingTemplate(template);
  };

  const handleUpdateTemplate = (templateData: Partial<UOTemplate>) => {
    if (editingTemplate) {
      templateService.updateTemplate(editingTemplate.id, templateData);
      setEditingTemplate(null);
      loadTemplates();
    }
  };

  const handleDeleteTemplate = (template: UOTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      templateService.deleteTemplate(template.id);
      loadTemplates();
    }
  };

  const handleExportTemplate = (template: UOTemplate) => {
    const exportData = templateService.exportTemplate(template.id);
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/\s+/g, '_')}_template.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const imported = templateService.importTemplate(jsonData);
        if (imported) {
          loadTemplates();
          setImportError(null);
        } else {
          setImportError('Failed to import template: Invalid format');
        }
      } catch (error) {
        setImportError(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Template Library</Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              component="label"
            >
              Import
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImportTemplate}
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreateDialog(true)}
            >
              Create Template
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {importError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setImportError(null)}>
            {importError}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filter.category || ''}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value || undefined })}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={filter.difficulty || ''}
                  onChange={(e) => setFilter({ ...filter, difficulty: e.target.value as any || undefined })}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <TemplateCard
                template={template}
                onUse={handleUseTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onExport={handleExportTemplate}
              />
            </Grid>
          ))}
        </Grid>

        {filteredTemplates.length === 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <Typography variant="body1" color="text.secondary">
              No templates found matching your criteria
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      <CreateTemplateDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSave={handleCreateTemplate}
      />

      <CreateTemplateDialog
        open={Boolean(editingTemplate)}
        onClose={() => setEditingTemplate(null)}
        onSave={handleUpdateTemplate}
        initialData={editingTemplate || undefined}
      />
    </Dialog>
  );
};