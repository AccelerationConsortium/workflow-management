/**
 * Category Selector - Dialog for selecting or creating UO categories
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Category as CategoryIcon
} from '@mui/icons-material';

import { DEFAULT_UO_CATEGORIES } from './config/componentLibrary';
import { UOCategory } from './types';

interface CategorySelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  open,
  onClose,
  onSelect,
  selectedCategory
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#2196f3',
    icon: '🔬'
  });

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    onSelect(categoryId);
    onClose();
  };

  // Handle create new category
  const handleCreateCategory = () => {
    if (newCategory.name.trim()) {
      // In a real implementation, this would save to a backend or local storage
      const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '-');
      onSelect(categoryId);
      setNewCategory({ name: '', description: '', color: '#2196f3', icon: '🔬' });
      setShowCreateForm(false);
      onClose();
    }
  };

  // Handle cancel create
  const handleCancelCreate = () => {
    setNewCategory({ name: '', description: '', color: '#2196f3', icon: '🔬' });
    setShowCreateForm(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {showCreateForm ? 'Create New Category' : 'Select Category'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {showCreateForm ? (
          // Create Category Form
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  fullWidth
                  required
                  placeholder="e.g., Custom Reactions"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Icon"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  fullWidth
                  placeholder="🔬"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Describe what types of operations belong in this category..."
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Color
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {[
                      '#2196f3', '#4caf50', '#ff9800', '#f44336',
                      '#9c27b0', '#00bcd4', '#795548', '#607d8b'
                    ].map((color) => (
                      <Box
                        key={color}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: newCategory.color === color ? '3px solid #000' : '1px solid #ccc',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Preview */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: newCategory.color,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}
                    >
                      {newCategory.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6">
                        {newCategory.name || 'Category Name'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {newCategory.description || 'Category description'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        ) : (
          // Category Selection Grid
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              {DEFAULT_UO_CATEGORIES.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    variant={selectedCategory === category.id ? "outlined" : "elevation"}
                    sx={{
                      border: selectedCategory === category.id ? '2px solid #2196f3' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CardActionArea onClick={() => handleCategorySelect(category.id)}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: category.color,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem'
                            }}
                          >
                            {category.icon}
                          </Box>
                          <Typography variant="h6" component="div">
                            {category.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                        {selectedCategory === category.id && (
                          <Chip
                            label="Selected"
                            color="primary"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}

              {/* Create New Category Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
                  <CardActionArea onClick={() => setShowCreateForm(true)}>
                    <CardContent>
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        minHeight={120}
                        gap={1}
                      >
                        <AddIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary">
                          Create New
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Create a custom category for your unit operations
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {showCreateForm ? (
          <>
            <Button onClick={handleCancelCreate}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCategory}
              variant="contained"
              disabled={!newCategory.name.trim()}
            >
              Create Category
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
