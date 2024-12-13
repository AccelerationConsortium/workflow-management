import React, { useState } from 'react';
import { DevicePrimitive, ControlDetail } from '../types/primitive';
import './PrimitiveConfigDialog.css';

interface PrimitiveConfigDialogProps {
  primitive: DevicePrimitive;
  controlDetails: ControlDetail;
  onConfirm: (config: any) => void;
  onCancel: () => void;
}

export const PrimitiveConfigDialog: React.FC<PrimitiveConfigDialogProps> = ({
  primitive,
  controlDetails,
  onConfirm,
  onCancel
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    violations: string[];
  }>({ isValid: true, violations: [] });

  const handleParameterChange = (name: string, value: any) => {
    const newParameters = { ...parameters, [name]: value };
    setParameters(newParameters);
    
    // 实时验证约束条件
    const result = primitiveService.validateConstraints(primitive, newParameters);
    setValidationResult(result);
  };

  return (
    <div className="primitive-config-dialog">
      <h3>Configure {primitive.name}</h3>
      
      <div className="control-details">
        <h4>Control Details</h4>
        <div className="detail-item">
          <span>Software:</span> {controlDetails.software.name} v{controlDetails.software.version}
        </div>
        <div className="detail-item">
          <span>Protocol:</span> {controlDetails.communication.protocol}
        </div>
        {/* ... 其他控制细节 ... */}
      </div>

      <div className="parameters">
        <h4>Parameters</h4>
        {primitive.parameters.map(param => (
          <div key={param.name} className="parameter-input">
            <label>{param.label}</label>
            <input
              type={param.type === 'number' ? 'number' : 'text'}
              value={parameters[param.name] || ''}
              onChange={e => handleParameterChange(param.name, e.target.value)}
            />
            {param.unit && <span className="unit">{param.unit}</span>}
          </div>
        ))}
      </div>

      {validationResult.violations.length > 0 && (
        <div className="validation-errors">
          {validationResult.violations.map((violation, index) => (
            <div key={index} className="error">{violation}</div>
          ))}
        </div>
      )}

      <div className="dialog-actions">
        <button
          onClick={() => onConfirm(parameters)}
          disabled={!validationResult.isValid}
        >
          Confirm
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}; 