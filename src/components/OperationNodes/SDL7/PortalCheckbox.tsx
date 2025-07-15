import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Checkbox, FormControlLabel } from '@mui/material';

interface PortalCheckboxProps {
  paramKey: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const PortalCheckbox: React.FC<PortalCheckboxProps> = ({
  paramKey,
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Create portal container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.zIndex = '10000';
    container.style.pointerEvents = 'auto';
    container.style.background = 'white';
    container.style.padding = '4px';
    container.style.borderRadius = '4px';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    document.body.appendChild(container);
    setPortalContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  useEffect(() => {
    // Update position based on placeholder
    if (placeholderRef.current && portalContainer) {
      const rect = placeholderRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
      portalContainer.style.top = `${rect.top}px`;
      portalContainer.style.left = `${rect.left}px`;
    }
  }, [portalContainer, checked]); // Update on state changes

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`PortalCheckbox ${paramKey} onChange:`, event.target.checked);
    onChange(event.target.checked);
  };

  return (
    <>
      {/* Placeholder in the original position */}
      <div
        ref={placeholderRef}
        style={{
          height: '42px', // Approximate height of FormControlLabel
          width: '100%',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          fontSize: '14px',
          color: '#666',
        }}
      >
        Portal Checkbox: {label}
      </div>

      {/* Portal checkbox */}
      {portalContainer &&
        createPortal(
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={handleChange}
                size="small"
                disabled={disabled}
                onClick={(e) => {
                  console.log(`PortalCheckbox ${paramKey} onClick:`, e);
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  console.log(`PortalCheckbox ${paramKey} onMouseDown:`, e);
                  e.stopPropagation();
                }}
                style={{
                  pointerEvents: 'auto',
                }}
              />
            }
            label={label}
            style={{
              pointerEvents: 'auto',
              margin: 0,
            }}
            onMouseDown={(e) => {
              console.log(`PortalCheckbox label ${paramKey} onMouseDown:`, e);
              e.stopPropagation();
            }}
          />,
          portalContainer
        )}
    </>
  );
};