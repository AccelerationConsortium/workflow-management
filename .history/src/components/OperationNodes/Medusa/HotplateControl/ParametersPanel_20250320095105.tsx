import React from 'react';
import { HotplateControlPanel } from './index';
import { DEFAULT_VALUES } from './constants';

interface ParametersPanelProps {
  deviceId: string;
  data: any;
  onChange: (data: any) => void;
  isExpanded: boolean;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  deviceId,
  data,
  onChange,
  isExpanded
}) => {
  if (!isExpanded) return null;

  return (
    <div className="parameters-panel">
      <HotplateControlPanel
        deviceId={deviceId}
        data={data || DEFAULT_VALUES}
        onChange={onChange}
      />
    </div>
  );
}; 
