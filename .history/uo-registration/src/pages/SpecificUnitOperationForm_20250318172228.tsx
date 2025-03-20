import React from 'react';
import { Container, Typography } from '@mui/material';
import SpecificUnitOperationForm from '../components/forms/SpecificUnitOperationForm';
import { UnitOperationFormData } from '../types/UnitOperation';

const SpecificUnitOperationFormPage: React.FC = () => {
  const handleSubmit = (data: UnitOperationFormData) => {
    console.log('Form submitted:', data);
    // TODO: Implement form submission logic
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Create Specific Unit Operation
      </Typography>
      <SpecificUnitOperationForm onSubmit={handleSubmit} />
    </Container>
  );
};

export default SpecificUnitOperationFormPage; 
