import React from 'react';
import { BaseNode } from './BaseNode';
import { ValidationError } from '../types/validation';
import './ValidatedNode.css';

export const ValidatedNode: React.FC<{
  data: any;
  errors: ValidationError[];
}> = ({ data, errors }) => {
  const nodeErrors = errors.filter(error => error.nodeId === data.id);
  const hasErrors = nodeErrors.length > 0;

  return (
    <div className={`node ${hasErrors ? 'node-error' : ''}`}>
      <BaseNode data={data} />
      
      {hasErrors && (
        <div className="error-indicators">
          {nodeErrors.map((error, index) => (
            <div key={index} className="error-tooltip">
              {error.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 