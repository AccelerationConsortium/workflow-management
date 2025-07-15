import React, { useEffect, useRef } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

interface DOMCheckboxProps {
  paramKey: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const DOMCheckbox: React.FC<DOMCheckboxProps> = ({
  paramKey,
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Force DOM positioning and events
      const container = containerRef.current;
      container.style.position = 'relative';
      container.style.zIndex = '10001';
      container.style.pointerEvents = 'auto';
      container.style.userSelect = 'none';
      container.style.webkitUserSelect = 'none';
      container.style.display = 'block';
      container.style.width = '100%';
      container.style.height = 'auto';
      container.style.overflow = 'visible';

      // Force all child elements to be interactive
      const checkboxInput = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const label = container.querySelector('label') as HTMLLabelElement;
      
      if (checkboxInput) {
        checkboxInput.style.pointerEvents = 'auto';
        checkboxInput.style.position = 'relative';
        checkboxInput.style.zIndex = '10002';
      }
      
      if (label) {
        label.style.pointerEvents = 'auto';
        label.style.position = 'relative';
        label.style.zIndex = '10002';
      }
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`DOMCheckbox ${paramKey} onChange:`, event.target.checked);
    event.stopPropagation();
    onChange(event.target.checked);
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        zIndex: 10001,
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        display: 'block',
        width: '100%',
        height: 'auto',
        overflow: 'visible',
        margin: '4px 0',
        padding: '2px',
        border: '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
      }}
      onMouseDown={(e) => {
        console.log(`DOMCheckbox container ${paramKey} onMouseDown:`, e);
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        console.log(`DOMCheckbox container ${paramKey} onMouseUp:`, e);
        e.stopPropagation();
      }}
      onClick={(e) => {
        console.log(`DOMCheckbox container ${paramKey} onClick:`, e);
        e.stopPropagation();
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={handleChange}
            size="small"
            disabled={disabled}
            style={{
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 10002,
            }}
            onClick={(e) => {
              console.log(`DOMCheckbox ${paramKey} onClick:`, e);
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              console.log(`DOMCheckbox ${paramKey} onMouseDown:`, e);
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              console.log(`DOMCheckbox ${paramKey} onMouseUp:`, e);
              e.stopPropagation();
            }}
          />
        }
        label={label}
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          zIndex: 10002,
          margin: 0,
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        onMouseDown={(e) => {
          console.log(`DOMCheckbox label ${paramKey} onMouseDown:`, e);
          e.stopPropagation();
        }}
      />
    </div>
  );
};