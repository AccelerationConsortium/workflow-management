import React from 'react';
import { Formik, Form } from 'formik';
import { Parameter } from '../../types/workflow';
import { NumberField, SelectField, TextField, RangeField } from './FormFields';
import './styles.css';
import * as Yup from 'yup';

interface NodeConfigFormProps {
  nodeId: string;
  parameters: Parameter[];
  initialValues: Record<string, any>;
  onSubmit: (values: any) => void;
}

const generateValidationSchema = (parameters: NodeParameter[]) => {
  const schema = {};
  
  parameters.forEach(param => {
    let fieldSchema = Yup.mixed();
    
    switch (param.type) {
      case 'number':
        fieldSchema = Yup.number();
        if (param.validation?.min !== undefined) {
          fieldSchema = fieldSchema.min(param.validation.min);
        }
        if (param.validation?.max !== undefined) {
          fieldSchema = fieldSchema.max(param.validation.max);
        }
        break;
      case 'text':
        fieldSchema = Yup.string();
        if (param.validation?.pattern) {
          fieldSchema = fieldSchema.matches(new RegExp(param.validation.pattern));
        }
        break;
      // ... 其他类型的验证
    }
    
    if (param.validation?.required) {
      fieldSchema = fieldSchema.required('This field is required');
    }
    
    schema[param.id] = fieldSchema;
  });
  
  return Yup.object().shape(schema);
};

export const NodeConfigForm: React.FC<NodeConfigFormProps> = ({
  nodeId,
  parameters,
  initialValues,
  onSubmit
}) => {
  const validationSchema = generateValidationSchema(parameters);

  const renderField = (param: NodeParameter) => {
    switch (param.type) {
      case 'number':
        return <NumberField key={param.id} parameter={param} />;
      case 'select':
        return <SelectField key={param.id} parameter={param} />;
      case 'range':
        return <RangeField key={param.id} parameter={param} />;
      default:
        return <TextField key={param.id} parameter={param} />;
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form className="node-config-form">
        <div className="form-fields">
          {parameters.map(param => renderField(param))}
        </div>
        <div className="form-actions">
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </div>
      </Form>
    </Formik>
  );
}; 