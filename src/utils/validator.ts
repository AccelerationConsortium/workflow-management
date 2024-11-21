import { ValidationRule } from '../types/workflow';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validateValue = (value: any, rules: ValidationRule[]): boolean => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          throw new ValidationError(rule.message);
        }
        break;

      case 'range':
        if (rule.range && typeof value === 'number') {
          const [min, max] = rule.range;
          if (value < min || value > max) {
            throw new ValidationError(rule.message);
          }
        }
        break;

      case 'format':
        if (rule.format && typeof value === 'string') {
          const regex = new RegExp(rule.format);
          if (!regex.test(value)) {
            throw new ValidationError(rule.message);
          }
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          throw new ValidationError(rule.message);
        }
        break;
    }
  }
  return true;
}; 