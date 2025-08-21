// DeckPlanner React Component
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlanIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as PreviewIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import { Node } from 'reactflow';

import {
  DeckSpec,
  DeckTemplate,
  RoleDefinition,
  CapabilityType,
  OptimizationPriority,
  SolverStrategy,
  ValidationResult,
  BindingMap
} from './types';
import { DeckPlannerUO } from './DeckPlannerUO';

interface DeckPlannerNodeProps {
  data: {
    label: string;
    deckSpec?: DeckSpec;
    bindingMap?: BindingMap;
    validationResults?: ValidationResult[];
  };
  id: string;
  selected?: boolean;
}

interface DeckPlannerState {
  deckSpec: DeckSpec;
  bindingMap?: BindingMap;
  validationResults: ValidationResult[];
  isPlanning: boolean;
  planningError?: string;
  showPreview: boolean;
}

export const DeckPlannerNode: React.FC<DeckPlannerNodeProps> = ({ data, id }) => {
  const [state, setState] = useState<DeckPlannerState>({
    deckSpec: data.deckSpec || createDefaultDeckSpec(),
    bindingMap: data.bindingMap,
    validationResults: data.validationResults || [],
    isPlanning: false,
    showPreview: false
  });
  
  const [deckPlanner] = useState(() => new DeckPlannerUO());
  const [activeRole, setActiveRole] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState<string>('');
  
  // ============= Event Handlers =============
  
  const handlePlanDeck = useCallback(async () => {
    setState(prev => ({ ...prev, isPlanning: true, planningError: undefined }));
    
    try {
      const result = await deckPlanner.plan(state.deckSpec);
      
      setState(prev => ({
        ...prev,
        bindingMap: result.bindingMap,
        validationResults: result.validationResults,
        isPlanning: false,
        planningError: result.success ? undefined : result.errors.join(', ')
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isPlanning: false,
        planningError: error instanceof Error ? error.message : 'Planning failed'
      }));
    }
  }, [state.deckSpec, deckPlanner]);
  
  const handleAddRole = useCallback(() => {
    if (!newRoleName.trim()) return;
    
    const newRole: RoleDefinition = {
      description: `Role: ${newRoleName}`,
      capabilities: [{ type: 'hold_liquid' }]
    };
    
    setState(prev => ({
      ...prev,
      deckSpec: {
        ...prev.deckSpec,
        roles: {
          ...prev.deckSpec.roles,
          [newRoleName]: newRole
        }
      }
    }));
    
    setNewRoleName('');
    setActiveRole(newRoleName);
  }, [newRoleName]);
  
  const handleRemoveRole = useCallback((roleId: string) => {
    setState(prev => {
      const newRoles = { ...prev.deckSpec.roles };
      delete newRoles[roleId];
      
      return {
        ...prev,
        deckSpec: {
          ...prev.deckSpec,
          roles: newRoles
        }
      };
    });
    
    if (activeRole === roleId) {
      setActiveRole('');
    }
  }, [activeRole]);
  
  const handleRoleChange = useCallback((roleId: string, updates: Partial<RoleDefinition>) => {
    setState(prev => ({
      ...prev,
      deckSpec: {
        ...prev.deckSpec,
        roles: {
          ...prev.deckSpec.roles,
          [roleId]: {
            ...prev.deckSpec.roles[roleId],
            ...updates
          }
        }
      }
    }));
  }, []);
  
  const handleTemplateChange = useCallback((template: DeckTemplate) => {
    const templateSpec = getTemplateSpec(template);
    setState(prev => ({
      ...prev,
      deckSpec: {
        ...prev.deckSpec,
        template,
        roles: {
          ...prev.deckSpec.roles,
          ...templateSpec.roles
        }
      }
    }));
  }, []);
  
  // ============= Render Methods =============
  
  const renderProtocolSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Protocol Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Protocol Name"
              value={state.deckSpec.protocol.name}
              onChange={(e) => setState(prev => ({
                ...prev,
                deckSpec: {
                  ...prev.deckSpec,
                  protocol: {
                    ...prev.deckSpec.protocol,
                    name: e.target.value
                  }
                }
              }))}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={state.deckSpec.template || 'custom'}
                onChange={(e) => handleTemplateChange(e.target.value as DeckTemplate)}
                label="Template"
              >
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="PCR">PCR</MenuItem>
                <MenuItem value="ELISA">ELISA</MenuItem>
                <MenuItem value="NGS_prep">NGS Prep</MenuItem>
                <MenuItem value="cell_culture">Cell Culture</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={state.deckSpec.protocol.description || ''}
              onChange={(e) => setState(prev => ({
                ...prev,
                deckSpec: {
                  ...prev.deckSpec,
                  protocol: {
                    ...prev.deckSpec.protocol,
                    description: e.target.value
                  }
                }
              }))}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
  
  const renderRoleEditor = () => (
    <Accordion expanded={!!activeRole}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Roles ({Object.keys(state.deckSpec.roles).length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={8}>
              <TextField
                fullWidth
                size="small"
                label="New Role Name"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddRole}
                disabled={!newRoleName.trim()}
              >
                Add Role
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          {Object.keys(state.deckSpec.roles).map(roleId => (
            <Chip
              key={roleId}
              label={roleId}
              color={activeRole === roleId ? 'primary' : 'default'}
              onClick={() => setActiveRole(activeRole === roleId ? '' : roleId)}
              onDelete={() => handleRemoveRole(roleId)}
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
        
        {activeRole && renderRoleDetails(activeRole)}
      </AccordionDetails>
    </Accordion>
  );
  
  const renderRoleDetails = (roleId: string) => {
    const role = state.deckSpec.roles[roleId];
    if (!role) return null;
    
    return (
      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Edit Role: {roleId}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={role.description}
              onChange={(e) => handleRoleChange(roleId, { description: e.target.value })}
            />
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" gutterBottom>
              Capabilities
            </Typography>
            {role.capabilities.map((cap, index) => (
              <Chip
                key={index}
                label={cap.type}
                onDelete={() => {
                  const newCapabilities = role.capabilities.filter((_, i) => i !== index);
                  handleRoleChange(roleId, { capabilities: newCapabilities });
                }}
                sx={{ mr: 1, mb: 1 }}
                size="small"
              />
            ))}
            <Select
              size="small"
              displayEmpty
              value=""
              onChange={(e) => {
                const newCap = { type: e.target.value as CapabilityType };
                const newCapabilities = [...role.capabilities, newCap];
                handleRoleChange(roleId, { capabilities: newCapabilities });
              }}
              sx={{ mt: 1, minWidth: 200 }}
            >
              <MenuItem value="" disabled>Add Capability</MenuItem>
              <MenuItem value="hold_liquid">Hold Liquid</MenuItem>
              <MenuItem value="temperature_control">Temperature Control</MenuItem>
              <MenuItem value="mixing">Mixing</MenuItem>
              <MenuItem value="tip_rack">Tip Rack</MenuItem>
              <MenuItem value="waste">Waste</MenuItem>
              <MenuItem value="reagent_reservoir">Reagent Reservoir</MenuItem>
              <MenuItem value="96_well_compatible">96-Well Compatible</MenuItem>
            </Select>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" gutterBottom>
              Constraints
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={role.constraints?.isolated || false}
                  onChange={(e) => handleRoleChange(roleId, {
                    constraints: {
                      ...role.constraints,
                      isolated: e.target.checked
                    }
                  })}
                />
              }
              label="Isolated"
            />
            
            <TextField
              fullWidth
              type="number"
              label="Fixed Slot (optional)"
              value={role.constraints?.fixedSlot || ''}
              onChange={(e) => handleRoleChange(roleId, {
                constraints: {
                  ...role.constraints,
                  fixedSlot: e.target.value ? parseInt(e.target.value) : undefined
                }
              })}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderOptimizationSettings = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Optimization</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={state.deckSpec.optimization?.priority || 'minimize_moves'}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  deckSpec: {
                    ...prev.deckSpec,
                    optimization: {
                      ...prev.deckSpec.optimization,
                      priority: e.target.value as OptimizationPriority
                    }
                  }
                }))}
                label="Priority"
              >
                <MenuItem value="minimize_moves">Minimize Moves</MenuItem>
                <MenuItem value="maximize_throughput">Maximize Throughput</MenuItem>
                <MenuItem value="minimize_tips">Minimize Tips</MenuItem>
                <MenuItem value="minimize_time">Minimize Time</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Solver Strategy</InputLabel>
              <Select
                value={deckPlanner.options?.solverStrategy || 'greedy'}
                onChange={(e) => {
                  // This would need to be implemented in DeckPlannerUO
                  console.log('Solver strategy:', e.target.value);
                }}
                label="Solver Strategy"
              >
                <MenuItem value="greedy">Greedy (Fast)</MenuItem>
                <MenuItem value="simulated_annealing">Simulated Annealing</MenuItem>
                <MenuItem value="ilp">ILP (Optimal)</MenuItem>
                <MenuItem value="genetic_algorithm">Genetic Algorithm</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
  
  const renderPlanningResults = () => {
    if (!state.bindingMap && state.validationResults.length === 0) return null;
    
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Planning Results
            {state.validationResults.length > 0 && (
              <Chip
                size="small"
                label={state.validationResults.length}
                color={state.validationResults.some(r => r.severity === 'error') ? 'error' : 'warning'}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {state.bindingMap && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Slot Assignments
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Slot</TableCell>
                      <TableCell>Labware</TableCell>
                      <TableCell>Module</TableCell>
                      <TableCell>Pipette</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(state.bindingMap.bindings).map(([roleId, binding]) => (
                      <TableRow key={roleId}>
                        <TableCell>{roleId}</TableCell>
                        <TableCell>{binding.slot}</TableCell>
                        <TableCell>{binding.labware.displayName}</TableCell>
                        <TableCell>{binding.module?.type || '-'}</TableCell>
                        <TableCell>
                          {binding.pipette ? 
                            `${binding.pipette.mount} ${binding.pipette.type}` : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {state.validationResults.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Validation Results
              </Typography>
              {state.validationResults.map((result, index) => (
                <Alert
                  key={index}
                  severity={result.severity}
                  icon={
                    result.severity === 'error' ? <ErrorIcon /> :
                    result.severity === 'warning' ? <WarningIcon /> :
                    <SuccessIcon />
                  }
                  sx={{ mb: 1 }}
                >
                  <Box>
                    <Typography variant="body2">
                      {result.message}
                    </Typography>
                    {result.suggestedFix && (
                      <Typography variant="caption" color="textSecondary">
                        Suggestion: {result.suggestedFix}
                      </Typography>
                    )}
                  </Box>
                </Alert>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };
  
  const renderDeckVisualization = () => {
    if (!state.bindingMap?.visualization?.svg) return null;
    
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" gutterBottom>
          Deck Layout Preview
        </Typography>
        <div
          dangerouslySetInnerHTML={{
            __html: state.bindingMap.visualization.svg
          }}
        />
      </Box>
    );
  };
  
  // ============= Main Render =============
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        minWidth: 400,
        maxWidth: 800,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Deck Planner
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={state.isPlanning ? <CircularProgress size={16} /> : <PlanIcon />}
            onClick={handlePlanDeck}
            disabled={state.isPlanning || Object.keys(state.deckSpec.roles).length === 0}
          >
            {state.isPlanning ? 'Planning...' : 'Plan Deck'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setState(prev => ({ ...prev, showPreview: !prev.showPreview }))}
            disabled={!state.bindingMap}
          >
            Preview
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setState(prev => ({
              ...prev,
              bindingMap: undefined,
              validationResults: [],
              planningError: undefined
            }))}
          >
            Clear
          </Button>
        </Box>
      </Box>
      
      {state.planningError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.planningError}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {renderProtocolSettings()}
        {renderRoleEditor()}
        {renderOptimizationSettings()}
        {renderPlanningResults()}
      </Box>
      
      {state.showPreview && renderDeckVisualization()}
    </Paper>
  );
};

// ============= Helper Functions =============

function createDefaultDeckSpec(): DeckSpec {
  return {
    version: '1.0',
    protocol: {
      name: 'New Protocol',
      description: 'Deck planning for automated workflow'
    },
    roles: {},
    optimization: {
      priority: 'minimize_moves'
    }
  };
}

function getTemplateSpec(template: DeckTemplate): { roles: Record<string, RoleDefinition> } {
  const templates: Record<DeckTemplate, { roles: Record<string, RoleDefinition> }> = {
    'PCR': {
      roles: {
        'samples': {
          description: 'Sample tubes',
          capabilities: [{ type: 'hold_liquid' }],
          constraints: { temperature: { min: 4, max: 8 } }
        },
        'pcr_plate': {
          description: 'PCR reaction plate',
          capabilities: [
            { type: 'hold_liquid' },
            { type: '96_well_compatible' },
            { type: 'temperature_control' }
          ]
        },
        'tips_20ul': {
          description: '20µL filter tips',
          capabilities: [{ type: 'tip_rack' }]
        }
      }
    },
    
    'ELISA': {
      roles: {
        'sample_plate': {
          description: 'Sample plate',
          capabilities: [
            { type: 'hold_liquid' },
            { type: '96_well_compatible' }
          ]
        },
        'reagents': {
          description: 'ELISA reagents',
          capabilities: [
            { type: 'reagent_reservoir' },
            { type: 'large_volume' }
          ]
        },
        'wash_buffer': {
          description: 'Wash buffer',
          capabilities: [
            { type: 'reagent_reservoir' },
            { type: 'large_volume' }
          ]
        },
        'waste': {
          description: 'Liquid waste',
          capabilities: [{ type: 'waste' }],
          constraints: { isolated: true }
        }
      }
    },
    
    'NGS_prep': {
      roles: {
        'dna_samples': {
          description: 'DNA samples',
          capabilities: [{ type: 'hold_liquid' }],
          constraints: { temperature: { min: -20, max: 4 } }
        },
        'reagent_plate': {
          description: 'NGS reagents',
          capabilities: [
            { type: 'hold_liquid' },
            { type: '96_well_compatible' }
          ]
        },
        'mag_beads': {
          description: 'Magnetic beads plate',
          capabilities: [
            { type: 'hold_liquid' },
            { type: 'magnetic' }
          ]
        }
      }
    },
    
    'cell_culture': {
      roles: {
        'culture_plate': {
          description: 'Cell culture plate',
          capabilities: [
            { type: 'hold_liquid' },
            { type: '96_well_compatible' },
            { type: 'temperature_control' }
          ]
        },
        'media': {
          description: 'Culture media',
          capabilities: [
            { type: 'reagent_reservoir' },
            { type: 'large_volume' }
          ]
        }
      }
    },
    
    'custom': { roles: {} }
  };
  
  return templates[template] || templates.custom;
}

export default DeckPlannerNode;