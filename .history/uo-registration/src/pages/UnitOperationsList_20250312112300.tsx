import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableHead, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Button, 
  Box, 
  TextField, 
  InputAdornment,
  Chip, 
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useGetGenericUnitOperations, useGetSpecificUnitOperations } from '../services/api/unitOperations';
import { GenericUnitOperation, SpecificUnitOperation, UnitOperationCategory, Laboratory } from '../types/UnitOperation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`unit-ops-tabpanel-${index}`}
      aria-labelledby={`unit-ops-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `unit-ops-tab-${index}`,
    'aria-controls': `unit-ops-tabpanel-${index}`,
  };
}

const UnitOperationsList: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<UnitOperationCategory | null>(null);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  
  // 获取通用和特定单元操作
  const { 
    data: genericUnitOperations = [], 
    isLoading: isLoadingGeneric 
  } = useGetGenericUnitOperations(selectedCategory || undefined, selectedLab || undefined);
  
  const { 
    data: specificUnitOperations = [], 
    isLoading: isLoadingSpecific 
  } = useGetSpecificUnitOperations(undefined, selectedLab || undefined);
  
  // 处理标签页变更
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 过滤功能
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleCategorySelect = (category: UnitOperationCategory | null) => {
    setSelectedCategory(category);
    handleFilterClose();
  };
  
  const handleLabSelect = (lab: Laboratory | null) => {
    setSelectedLab(lab);
    handleFilterClose();
  };
  
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLab(null);
    handleFilterClose();
  };
  
  // 基于搜索词和过滤条件过滤UOs
  const filteredGenericUOs = genericUnitOperations.filter(uo => 
    uo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSpecificUOs = specificUnitOperations.filter(uo => 
    uo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    uo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 获取类别显示名称
  const getCategoryDisplayName = (category: UnitOperationCategory): string => {
    return category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // 获取实验室显示名称
  const getLabDisplayName = (lab: Laboratory): string => {
    return lab.toUpperCase();
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题和操作按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Unit Operations</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{ mr: 2 }}
          >
            Filter
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/unit-operations/create" 
            sx={{ mr: 2 }}
          >
            Create Specific UO
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/generic-unit-operations/create"
          >
            Create Generic UO
          </Button>
        </Box>
      </Box>
      
      {/* 过滤菜单 */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>Categories</Typography>
        <MenuItem onClick={() => handleCategorySelect(null)} selected={selectedCategory === null}>
          All Categories
        </MenuItem>
        {Object.values(UnitOperationCategory).map((category) => (
          <MenuItem 
            key={category} 
            onClick={() => handleCategorySelect(category)}
            selected={selectedCategory === category}
          >
            {getCategoryDisplayName(category)}
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>Laboratories</Typography>
        <MenuItem onClick={() => handleLabSelect(null)} selected={selectedLab === null}>
          All Laboratories
        </MenuItem>
        {Object.values(Laboratory).map((lab) => (
          <MenuItem 
            key={lab} 
            onClick={() => handleLabSelect(lab)}
            selected={selectedLab === lab}
          >
            {getLabDisplayName(lab)}
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          <Button variant="outlined" size="small" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Menu>
      
      {/* 过滤器标签 */}
      {(selectedCategory || selectedLab) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {selectedCategory && (
            <Chip 
              label={`Category: ${getCategoryDisplayName(selectedCategory)}`} 
              onDelete={() => setSelectedCategory(null)} 
            />
          )}
          {selectedLab && (
            <Chip 
              label={`Lab: ${getLabDisplayName(selectedLab)}`} 
              onDelete={() => setSelectedLab(null)} 
            />
          )}
        </Box>
      )}
      
      {/* 搜索框 */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search unit operations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="unit operations tabs">
          <Tab label="Generic UOs" {...a11yProps(0)} />
          <Tab label="Specific UOs" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      {/* 通用单元操作标签页内容 */}
      <TabPanel value={tabValue} index={0}>
        {isLoadingGeneric ? (
          <Typography>Loading generic unit operations...</Typography>
        ) : filteredGenericUOs.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No generic unit operations found.</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              component={RouterLink} 
              to="/generic-unit-operations/create" 
              sx={{ mt: 2 }}
            >
              Create Generic UO
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Laboratories</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGenericUOs.map((uo: GenericUnitOperation) => (
                  <TableRow key={uo.id}>
                    <TableCell>{uo.name}</TableCell>
                    <TableCell>{getCategoryDisplayName(uo.category)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={uo.status.replace('_', ' ').toUpperCase()}
                        color={
                          uo.status === 'approved' ? 'success' :
                          uo.status === 'pending_review' ? 'warning' :
                          uo.status === 'rejected' ? 'error' :
                          uo.status === 'archived' ? 'default' : 'primary'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {uo.applicableLabs.map((lab) => (
                          <Chip key={lab} label={getLabDisplayName(lab)} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        component={RouterLink} 
                        to={`/unit-operations/${uo.id}`}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        component={RouterLink} 
                        to={`/generic-unit-operations/${uo.id}/edit`}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
      
      {/* 特定单元操作标签页内容 */}
      <TabPanel value={tabValue} index={1}>
        {isLoadingSpecific ? (
          <Typography>Loading specific unit operations...</Typography>
        ) : filteredSpecificUOs.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No specific unit operations found.</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              component={RouterLink} 
              to="/unit-operations/create" 
              sx={{ mt: 2 }}
            >
              Create Specific UO
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Laboratory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSpecificUOs.map((uo: SpecificUnitOperation) => (
                  <TableRow key={uo.id}>
                    <TableCell>{uo.name}</TableCell>
                    <TableCell>{getCategoryDisplayName(uo.category)}</TableCell>
                    <TableCell>{getLabDisplayName(uo.laboratoryId)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={uo.status.replace('_', ' ').toUpperCase()}
                        color={
                          uo.status === 'approved' ? 'success' :
                          uo.status === 'pending_review' ? 'warning' :
                          uo.status === 'rejected' ? 'error' :
                          uo.status === 'archived' ? 'default' : 'primary'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        component={RouterLink} 
                        to={`/unit-operations/${uo.id}`}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        component={RouterLink} 
                        to={`/unit-operations/${uo.id}/edit`}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Container>
  );
};

export default UnitOperationsList; 
 