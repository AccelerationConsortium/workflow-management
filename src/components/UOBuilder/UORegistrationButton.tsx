/**
 * UO Registration Button - Main entry point for the UO Builder
 * To be placed in the main toolbar next to "Create Workflow"
 */

import React, { useState } from 'react';
import {
  Button,
  Tooltip
} from '@mui/material';
import {
  Engineering as UOIcon
} from '@mui/icons-material';

import { UORegistrationResult } from './types';
import { UOBuilderModal } from './UOBuilderModal';
import './UOBuilder.css';

interface UORegistrationButtonProps {
  onUORegistered?: (result: UORegistrationResult) => void;
}

export const UORegistrationButton: React.FC<UORegistrationButtonProps> = ({
  onUORegistered
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle opening the builder modal
  const handleOpenBuilder = () => {
    setIsModalOpen(true);
  };

  // Handle closing the builder modal
  const handleCloseBuilder = () => {
    setIsModalOpen(false);
  };

  // Handle UO registration from the full builder
  const handleRegisterUO = async (schema: any): Promise<UORegistrationResult> => {
    try {
      // This will be handled by the UOBuilderModal
      const result: UORegistrationResult = {
        success: true,
        uoId: schema.id,
        schema: schema
      };

      // Notify parent component
      if (onUORegistered) {
        onUORegistered(result);
      }

      return result;

    } catch (error) {
      const result: UORegistrationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };

      if (onUORegistered) {
        onUORegistered(result);
      }

      return result;
    }
  };

  return (
    <>
      <Tooltip title="Create and register a new Unit Operation">
        <Button
          variant="contained"
          startIcon={<UOIcon />}
          onClick={handleOpenBuilder}
          sx={{
            backgroundColor: '#8F7FE8', // Matrix Purple from cyber pastel theme
            color: 'white',
            borderRadius: '12px',
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '16px',
            minWidth: '160px',
            height: '48px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backgroundColor: '#7A6BD0',
            }
          }}
        >
          Create & Register UO
        </Button>
      </Tooltip>

      {/* Full UO Builder Modal */}
      <UOBuilderModal
        open={isModalOpen}
        onClose={handleCloseBuilder}
        onRegister={handleRegisterUO}
      />
    </>
  );
};
