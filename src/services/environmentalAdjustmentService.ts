export interface EnvironmentalFactor {
  type: 'temperature' | 'humidity' | 'pressure' | 'vibration' | 'custom';
  value: number;
  unit: string;
  impact: 'high' | 'medium' | 'low';
  threshold?: {
    min?: number;
    max?: number;
    optimal?: number;
  };
}

export interface AdjustmentResult {
  adjustedValue: number;
  confidence: number;
  factors: string[];
  explanation: string;
}

export class EnvironmentalAdjustmentService {
  private readonly impactWeights = {
    high: 0.15,    // 最大15%的调整
    medium: 0.08,  // 最大8%的调整
    low: 0.03      // 最大3%的调整
  };

  adjustForEnvironment(
    value: number,
    ranges: number[][],
    factors: Record<string, EnvironmentalFactor>
  ): AdjustmentResult {
    let adjustedValue = value;
    let totalImpact = 0;
    const appliedFactors: string[] = [];
    const explanations: string[] = [];

    // 计算每个环境因素的影响
    for (const [factorName, factor] of Object.entries(factors)) {
      const impact = this.calculateFactorImpact(value, factor);
      if (impact.adjustment !== 0) {
        totalImpact += impact.adjustment;
        appliedFactors.push(factorName);
        explanations.push(impact.explanation);
      }
    }

    // 应用总体调整
    adjustedValue = value * (1 + totalImpact);

    // 确保调整后的值在有效范围内
    const validRange = this.findValidRange(adjustedValue, ranges);
    if (validRange) {
      adjustedValue = Math.max(validRange[0], Math.min(adjustedValue, validRange[1]));
    }

    // 计算调整的置信度
    const confidence = this.calculateConfidence(
      value,
      adjustedValue,
      factors,
      appliedFactors
    );

    return {
      adjustedValue,
      confidence,
      factors: appliedFactors,
      explanation: explanations.join('; ')
    };
  }

  private calculateFactorImpact(
    value: number,
    factor: EnvironmentalFactor
  ): { adjustment: number; explanation: string } {
    const { threshold, impact, type, value: factorValue } = factor;
    let adjustment = 0;
    let explanation = '';

    if (threshold) {
      const { min, max, optimal } = threshold;
      const weight = this.impactWeights[impact];

      if (optimal !== undefined) {
        // 基于最优值计算调整
        const deviation = Math.abs(factorValue - optimal) / optimal;
        adjustment = -deviation * weight;
        explanation = `${type} deviation from optimal (${optimal}) causes ${(adjustment * 100).toFixed(1)}% adjustment`;
      } else if (min !== undefined && max !== undefined) {
        // 基于范围计算调整
        const range = max - min;
        const normalizedValue = (factorValue - min) / range;
        if (normalizedValue < 0 || normalizedValue > 1) {
          adjustment = -weight;
          explanation = `${type} outside acceptable range`;
        }
      }
    }

    return { adjustment, explanation };
  }

  private findValidRange(value: number, ranges: number[][]): number[] | null {
    for (const range of ranges) {
      if (value >= range[0] && value <= range[1]) {
        return range;
      }
    }
    return ranges[0]; // 默认使用第一个范围
  }

  private calculateConfidence(
    originalValue: number,
    adjustedValue: number,
    factors: Record<string, EnvironmentalFactor>,
    appliedFactors: string[]
  ): number {
    // 基础置信度
    let confidence = 0.9;

    // 根据调整幅度降低置信度
    const adjustmentPercent = Math.abs((adjustedValue - originalValue) / originalValue);
    confidence -= adjustmentPercent * 0.5;

    // 根据应用的因素数量调整置信度
    confidence -= appliedFactors.length * 0.05;

    // 确保置信度在有效范围内
    return Math.max(0.3, Math.min(confidence, 1));
  }
} 