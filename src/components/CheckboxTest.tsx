import React, { useState } from 'react';
import { Checkbox, FormControlLabel, Box, Typography, Paper, Button, Divider } from '@mui/material';
import { PortalCheckbox } from './OperationNodes/SDL7/PortalCheckbox';
import { DOMCheckbox } from './OperationNodes/SDL7/DOMCheckbox';
import { SimpleCheckbox } from './OperationNodes/SDL7/SimpleCheckbox';

export const CheckboxTest: React.FC = () => {
  const [performWeighing, setPerformWeighing] = useState(true);
  const [stallAfterInjection, setStallAfterInjection] = useState(false);
  const [testMode, setTestMode] = useState<'standard' | 'portal' | 'dom' | 'simple'>('standard');

  const renderCheckbox = (
    paramKey: string,
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void
  ) => {
    switch (testMode) {
      case 'portal':
        return (
          <PortalCheckbox
            paramKey={paramKey}
            label={label}
            checked={checked}
            onChange={onChange}
          />
        );
      case 'dom':
        return (
          <DOMCheckbox
            paramKey={paramKey}
            label={label}
            checked={checked}
            onChange={onChange}
          />
        );
      case 'simple':
        return (
          <SimpleCheckbox
            paramKey={paramKey}
            label={label}
            checked={checked}
            onChange={onChange}
          />
        );
      default:
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => {
                  console.log(`${label} checkbox changed:`, e.target.checked);
                  onChange(e.target.checked);
                }}
              />
            }
            label={label}
          />
        );
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Checkbox Implementation Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Test Mode:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant={testMode === 'standard' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setTestMode('standard')}
          >
            Standard MUI
          </Button>
          <Button
            variant={testMode === 'portal' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setTestMode('portal')}
          >
            Portal
          </Button>
          <Button
            variant={testMode === 'dom' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setTestMode('dom')}
          >
            DOM Forced
          </Button>
          <Button
            variant={testMode === 'simple' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setTestMode('simple')}
          >
            Simple DIV
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Weighing Options
          </Typography>
          {renderCheckbox('perform_weighing', 'Perform Weighing', performWeighing, setPerformWeighing)}
          <Typography variant="body2" color="textSecondary">
            Current value: {performWeighing.toString()}
          </Typography>
        </div>

        <div>
          <Typography variant="subtitle2" gutterBottom>
            HPLC Configuration
          </Typography>
          {renderCheckbox('stall', 'Stall After Injection', stallAfterInjection, setStallAfterInjection)}
          <Typography variant="body2" color="textSecondary">
            Current value: {stallAfterInjection.toString()}
          </Typography>
        </div>

        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption" gutterBottom>
            Test Results (Mode: {testMode}):
          </Typography>
          <Typography variant="body2">
            Perform Weighing: {performWeighing ? 'TRUE' : 'FALSE'}
          </Typography>
          <Typography variant="body2">
            Stall After Injection: {stallAfterInjection ? 'TRUE' : 'FALSE'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};