import { ParameterValue } from '../types/parameters';

export interface ParameterImpact {
  paramId: string;
  currentValue: number;
  suggestedValue: number;
  reason: string;
  confidence: number;
}

export class ParameterLinkageService {
  private readonly parameterRelations = {
    'mixing': {
      'speed': {
        affects: ['time', 'temperature'],
        rules: {
          'time': (speed: number) => ({
            value: speed > 500 ? 30 : 45,
            reason: 'Higher speed requires less mixing time',
            confidence: 0.85
          }),
          'temperature': (speed: number) => ({
            value: speed > 700 ? 35 : 30,
            reason: 'Higher speed may increase temperature',
            confidence: 0.75
          })
        }
      }
    }
  };

  previewImpact(
    nodeType: string,
    changedParamId: string,
    newValue: number,
    currentParams: Map<string, number>
  ): ParameterImpact[] {
    const impacts: ParameterImpact[] = [];
    const relations = this.parameterRelations[nodeType]?.[changedParamId];

    if (relations?.affects) {
      for (const affectedParam of relations.affects) {
        const rule = relations.rules[affectedParam];
        if (rule) {
          const { value, reason, confidence } = rule(newValue);
          impacts.push({
            paramId: affectedParam,
            currentValue: currentParams.get(affectedParam) || 0,
            suggestedValue: value,
            reason,
            confidence
          });
        }
      }
    }

    return impacts;
  }
} 