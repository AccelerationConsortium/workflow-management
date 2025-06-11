import React from 'react';
import { Field, useField } from 'formik';
import { Parameter } from '../../../types/workflow';
import './styles.css';

interface FieldProps {
  parameter: Parameter;
}

export const NumberField: React.FC<FieldProps> = ({ parameter }) => {
  const [field, meta] = useField(parameter.id);
  
  return (
    <div className="field-container">
      <label htmlFor={parameter.id}>
        {parameter.label}
        {parameter.validation?.required && <span className="required">*</span>}
      </label>
      <input
        {...field}
        type="number"
        min={parameter.validation?.min}
        max={parameter.validation?.max}
        className={`field-input ${meta.error ? 'error' : ''}`}
      />
      {meta.error && <div className="error-message">{meta.error}</div>}
    </div>
  );
};

export const SelectField: React.FC<FieldProps> = ({ parameter }) => {
  const [field, meta] = useField(parameter.id);
  
  return (
    <div className="field-container">
      <label htmlFor={parameter.id}>
        {parameter.label}
        {parameter.validation?.required && <span className="required">*</span>}
      </label>
      <select {...field} className={`field-input ${meta.error ? 'error' : ''}`}>
        <option value="">Select...</option>
        {parameter.options?.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {meta.error && <div className="error-message">{meta.error}</div>}
    </div>
  );
};

export const RangeField: React.FC<FieldProps> = ({ parameter }) => {
  const [field, meta] = useField(parameter.id);
  
  return (
    <div className="field-container">
      <label htmlFor={parameter.id}>
        {parameter.label}
        {parameter.validation?.required && <span className="required">*</span>}
      </label>
      <div className="range-field">
        <input
          {...field}
          type="range"
          min={parameter.validation?.min}
          max={parameter.validation?.max}
          className={`range-input ${meta.error ? 'error' : ''}`}
        />
        <span className="range-value">{field.value}</span>
      </div>
      {meta.error && <div className="error-message">{meta.error}</div>}
    </div>
  );
};

export const TextField: React.FC<FieldProps> = ({ parameter }) => {
  const [field, meta] = useField(parameter.id);
  
  return (
    <div className="field-container">
      <label htmlFor={parameter.id}>
        {parameter.label}
        {parameter.validation?.required && <span className="required">*</span>}
      </label>
      <input
        {...field}
        type="text"
        pattern={parameter.validation?.pattern}
        className={`field-input ${meta.error ? 'error' : ''}`}
      />
      {meta.error && <div className="error-message">{meta.error}</div>}
    </div>
  );
};

// 其他字段组件类似... 