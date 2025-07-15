import React from 'react';
import { Typography } from '@mui/material';

interface SimpleCheckboxProps {
  paramKey: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SimpleCheckbox: React.FC<SimpleCheckboxProps> = ({
  paramKey,
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log(`SimpleCheckbox ${paramKey} clicked:`, { checked, event: e });
    e.stopPropagation();
    e.preventDefault();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
        zIndex: 10001,
        pointerEvents: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        margin: '4px 0',
      }}
      onClick={handleClick}
      onMouseDown={(e) => {
        console.log(`SimpleCheckbox ${paramKey} onMouseDown:`, e);
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        console.log(`SimpleCheckbox ${paramKey} onMouseUp:`, e);
        e.stopPropagation();
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          border: '2px solid #1976d2',
          borderRadius: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checked ? '#1976d2' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {checked && (
          <span
            style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✓
          </span>
        )}
      </div>
      <Typography
        variant="body2"
        style={{
          color: disabled ? '#999' : '#333',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {label}
      </Typography>
    </div>
  );
};