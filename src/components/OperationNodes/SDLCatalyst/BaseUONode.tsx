import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Collapse,
  ButtonGroup,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ScienceIcon from '@mui/icons-material/Science';
import { styled } from '@mui/material/styles';

interface Parameter {
  type: string;
  label: string;
  unit?: string;
  description?: string;
  min?: number;
  max?: number;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface BaseUONodeProps extends NodeProps {
  data: {
    label: string;
    parameters: Record<string, Parameter>;
    onParameterChange?: (params: Record<string, any>) => void;
    onExport?: () => void;
  };
}

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 250,
  maxWidth: 350,
  backgroundColor: theme.palette.background.paper,
}));

const StyledCardContent = styled(CardContent)({
  padding: '8px 16px',
  '&:last-child': {
    paddingBottom: '8px',
  },
});

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  marginTop: theme.spacing(2),
  '& .MuiButton-root': {
    minWidth: '40px',
    width: '40px',
    padding: theme.spacing(1),
    flex: 1,
  },
  '& .MuiButton-startIcon': {
    margin: 0,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  }
}));

const StyledExportButton = styled(Button)(({ theme }) => ({
  '& .MuiButton-startIcon': {
    margin: 0,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  minHeight: '40px',
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  '& .MuiToggleButtonGroup-grouped': {
    flex: 1,
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
      marginLeft: theme.spacing(1),
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.875rem',
  padding: theme.spacing(0.5, 1),
}));

export const BaseUONode: React.FC<BaseUONodeProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleParameterChange = (name: string, value: any) => {
    const param = data.parameters[name];
    let error = '';

    // Validate number type parameters
    if (param.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        error = 'Must be a number';
      } else if (param.min !== undefined && numValue < param.min) {
        error = `Must be >= ${param.min}`;
      } else if (param.max !== undefined && numValue > param.max) {
        error = `Must be <= ${param.max}`;
      }
    }

    setParameters(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: error }));

    if (!error && data.onParameterChange) {
      data.onParameterChange({ ...parameters, [name]: value });
    }
  };

  const handleExport = () => {
    if (data.onExport) {
      data.onExport();
    }
    console.log('Exported parameters:', parameters);
  };

  const handleRun = () => {
    console.log('Running experiment with parameters:', parameters);
  };

  const handleViewResult = () => {
    console.log('Viewing results');
  };

  const handleSimulate = () => {
    console.log('Running simulation with parameters:', parameters);
  };

  return (
    <StyledCard variant="outlined">
      <Handle type="target" position={Position.Top} />
      
      <StyledCardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {data.label}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Box mt={2}>
            {Object.entries(data.parameters).map(([name, param]) => (
              param.type === 'string' && param.options ? (
                <FormControl
                  key={name}
                  fullWidth
                  error={!!errors[name]}
                  required={param.required}
                >
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {param.label}
                  </Typography>
                  <StyledToggleButtonGroup
                    value={parameters[name] || param.defaultValue || ''}
                    exclusive
                    onChange={(e, value) => value && handleParameterChange(name, value)}
                    size="small"
                    fullWidth
                  >
                    {param.options.map((option) => (
                      <StyledToggleButton key={option.value} value={option.value}>
                        {option.label}
                      </StyledToggleButton>
                    ))}
                  </StyledToggleButtonGroup>
                  <FormHelperText>{errors[name] || param.description}</FormHelperText>
                </FormControl>
              ) : (
                <TextField
                  key={name}
                  fullWidth
                  label={param.label}
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={parameters[name] || param.defaultValue || ''}
                  onChange={(e) => handleParameterChange(name, e.target.value)}
                  error={!!errors[name]}
                  helperText={errors[name] || param.description}
                  margin="dense"
                  size="small"
                  required={param.required}
                  InputProps={{
                    endAdornment: param.unit && (
                      <Typography color="textSecondary" variant="caption">
                        {param.unit}
                      </Typography>
                    ),
                  }}
                />
              )
            ))}
          </Box>

          <Box mt={2} display="flex" flexDirection="column" gap={1}>
            <StyledButtonGroup variant="outlined" fullWidth>
              <Tooltip title="Run Experiment">
                <Button
                  startIcon={<PlayArrowIcon />}
                  onClick={handleRun}
                  disabled={Object.keys(errors).some(key => !!errors[key])}
                />
              </Tooltip>
              <Tooltip title="View Results">
                <Button
                  startIcon={<AssessmentIcon />}
                  onClick={handleViewResult}
                />
              </Tooltip>
              <Tooltip title="Run Simulation">
                <Button
                  startIcon={<ScienceIcon />}
                  onClick={handleSimulate}
                />
              </Tooltip>
            </StyledButtonGroup>

            <Tooltip title="Export Configuration">
              <StyledExportButton
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleExport}
                disabled={Object.keys(errors).some(key => !!errors[key])}
                fullWidth
              />
            </Tooltip>
          </Box>
        </Collapse>
      </StyledCardContent>

      <Handle type="source" position={Position.Bottom} />
    </StyledCard>
  );
}; 
