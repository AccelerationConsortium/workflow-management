import { BranchCondition } from '../types/workflow';

export class ConditionEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConditionEvaluationError';
  }
}

export const evaluateCondition = (
  condition: BranchCondition,
  sourceValue: any,
  targetValue: any
): boolean => {
  try {
    switch (condition.operator) {
      case '>':
        return sourceValue > condition.value;
      case '<':
        return sourceValue < condition.value;
      case '==':
        return sourceValue == condition.value;
      case '>=':
        return sourceValue >= condition.value;
      case '<=':
        return sourceValue <= condition.value;
      case '!=':
        return sourceValue != condition.value;
      case 'contains':
        return String(sourceValue).includes(String(condition.value));
      case 'matches':
        return new RegExp(String(condition.value)).test(String(sourceValue));
      default:
        throw new ConditionEvaluationError(`未知的操作符: ${condition.operator}`);
    }
  } catch (error) {
    throw new ConditionEvaluationError(`条件评估失败: ${error.message}`);
  }
};

export const evaluateNodeConditions = (
  nodeData: any,
  conditions: BranchCondition[]
): boolean[] => {
  return conditions.map(condition => {
    const sourceValue = nodeData[condition.sourcePort];
    const targetValue = nodeData[condition.targetPort];
    return evaluateCondition(condition, sourceValue, targetValue);
  });
}; 