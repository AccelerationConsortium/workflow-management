import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
} from '@mui/material';
import { BasicInfoForm } from './BasicInfoForm';
import { SpecificationsForm } from './SpecificationsForm';
import { ParametersForm } from './ParametersForm';

const steps = [
  { label: 'Basic Information', component: BasicInfoForm },
  { label: 'Specifications', component: SpecificationsForm },
  { label: 'Parameters', component: ParametersForm },
];

export const NodeCreationForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const methods = useForm({
    defaultValues: {
      name: '',
      label: '',
      description: '',
      category: '',
      subCategory: '',
      specs: {
        model: '',
        manufacturer: '',
        type: '',
        range: '',
        precision: '',
        ports: '',
        otherSpecs: {},
      },
      parameters: [],
    },
  });

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = methods.handleSubmit((data) => {
    console.log('Form submitted:', data);
    // TODO: Handle form submission
  });

  const CurrentStepComponent = steps[activeStep].component;

  return (
    <FormProvider {...methods}>
      <Box sx={{ width: '100%', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Create New Node
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 2, mb: 2 }}>
            <CurrentStepComponent />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Create Node
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </FormProvider>
  );
}; 
