import React from 'react';
import {
  Box,
  FormControl,
  Typography,
  TextField,
  FormHelperText,
  ToggleButtonGroup,
  ToggleButton,
  styled
} from '@mui/material';

interface BasicConfigProps {
  parameters: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors: Record<string, string>;
}

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

export const BasicConfig: React.FC<BasicConfigProps> = ({
  parameters,
  onChange,
  errors,
}) => {
  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          IP Address
        </Typography>
        <TextField
          size="small"
          value={parameters.ipAddress || ''}
          onChange={(e) => onChange('ipAddress', e.target.value)}
          error={!!errors.ipAddress}
          helperText={errors.ipAddress || 'OT2 device IP address'}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Pipette Type
        </Typography>
        <StyledToggleButtonGroup
          value={parameters.pipetteType || 'p300_single'}
          exclusive
          onChange={(e, value) => value && onChange('pipetteType', value)}
          size="small"
        >
          <StyledToggleButton value="p20_single">P20 Single</StyledToggleButton>
          <StyledToggleButton value="p300_single">P300 Single</StyledToggleButton>
          <StyledToggleButton value="p1000_single">P1000 Single</StyledToggleButton>
        </StyledToggleButtonGroup>
        <FormHelperText>{errors.pipetteType || 'Type of pipette to use'}</FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Mount Position
        </Typography>
        <StyledToggleButtonGroup
          value={parameters.mountPosition || 'right'}
          exclusive
          onChange={(e, value) => value && onChange('mountPosition', value)}
          size="small"
        >
          <StyledToggleButton value="left">Left</StyledToggleButton>
          <StyledToggleButton value="right">Right</StyledToggleButton>
        </StyledToggleButtonGroup>
        <FormHelperText>{errors.mountPosition || 'Pipette mount position'}</FormHelperText>
      </FormControl>
    </Box>
  );
}; 
