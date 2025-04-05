import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const RobotIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M22 14h-1c0-3.87-3.13-7-7-7h-1V5.73c.61-.35 1-1 1-1.73 0-1.1-.9-2-2-2s-2 .9-2 2c0 .73.39 1.38 1 1.73V7h-1c-3.87 0-7 3.13-7 7H2c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h1v1c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1M7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18m9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m2.5-6H5v-2.5c0-2.48 2.02-4.5 4.5-4.5h5c2.48 0 4.5 2.02 4.5 4.5V12z" />
    </SvgIcon>
  );
}; 
