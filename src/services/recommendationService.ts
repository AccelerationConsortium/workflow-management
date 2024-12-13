import { ParameterDefinition, ParameterValue } from '../types/parameters';
import { ParameterRecommendation, WorkflowRecommendation } from '../types/recommendation';

export class RecommendationService {
  private readonly commonPatterns = {
    'mixing': {
      'speed': {
        ranges: [[100, 500], [500, 1000]],
        commonValues: [300, 500, 800],
        dependencies: {
          'volume': (vol: number) => vol > 1000 ? 300 : 500
        }
      },
      'time': {
        ranges: [[1, 30], [30, 60]],
        commonValues: [15, 30, 45],
        dependencies: {
          'speed': (speed: number) => speed > 500 ? 30 : 45
        }
      }
    },
    'heating': {
      'temperature': {
        ranges: [[20, 50], [50, 100]],
        commonValues: [25, 37, 50, 75],
        dependencies: {
          'duration': (duration: number) => duration > 60 ? 50 : 75
        }
      }
    }
  };

  // 获取参数推荐
  async getParameterRecommendations(
    nodeType: string,
    currentParams: ParameterValue[],
    context?: Record<string, any>
  ): Promise<ParameterRecommendation[]> {
    const patterns = this.commonPatterns[nodeType] || {};
    const recommendations: ParameterRecommendation[] = [];

    for (const [paramId, pattern] of Object.entries(patterns)) {
      // 基于当前参数值和上下文计算推荐值
      const recommendation = this.calculateRecommendation(
        paramId,
        pattern,
        currentParams,
        context
      );
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  // 获取下一步推荐
  async getNextStepRecommendations(
    currentNodes: Node[],
    workflowContext?: Record<string, any>
  ): Promise<WorkflowRecommendation[]> {
    const recommendations: WorkflowRecommendation[] = [];
    const lastNode = currentNodes[currentNodes.length - 1];

    if (!lastNode) return recommendations;

    // 基于常见工作流模式推荐下一步
    const commonSequences = this.getCommonSequences(lastNode.type);
    
    for (const sequence of commonSequences) {
      recommendations.push({
        nextSteps: [sequence.nextStep],
        confidence: sequence.confidence,
        reason: sequence.reason,
        templateId: sequence.templateId
      });
    }

    return recommendations;
  }

  private calculateRecommendation(
    paramId: string,
    pattern: any,
    currentParams: ParameterValue[],
    context?: Record<string, any>
  ): ParameterRecommendation | null {
    // 基本推荐值
    let value = pattern.commonValues[0];
    let confidence = 0.7;
    let reason = 'Based on common usage patterns';

    // 考虑参数依赖关系
    if (pattern.dependencies) {
      for (const [depParamId, calcFunc] of Object.entries(pattern.dependencies)) {
        const depParam = currentParams.find(p => p.id === depParamId);
        if (depParam) {
          const suggestedValue = calcFunc(depParam.value);
          if (suggestedValue !== undefined) {
            value = suggestedValue;
            confidence += 0.1;
            reason = `Optimized based on ${depParamId} value`;
          }
        }
      }
    }

    // 考虑上下文信息
    if (context?.environmentalFactors) {
      // 根据环境因素调整推荐值
      const adjusted = this.adjustForEnvironment(
        value,
        pattern.ranges,
        context.environmentalFactors
      );
      if (adjusted !== value) {
        value = adjusted;
        reason += ' and environmental factors';
      }
    }

    return {
      paramId,
      value,
      confidence: Math.min(confidence, 1),
      reason,
      typicalRange: pattern.ranges[0],
      relatedParams: Object.keys(pattern.dependencies || {})
    };
  }

  private getCommonSequences(currentType: string): Array<{
    nextStep: string;
    confidence: number;
    reason: string;
    templateId?: string;
  }> {
    // 这里可以从配置或数据库加载常见序列
    // 现在用硬编码演示
    const sequences = {
      'mixing': [
        {
          nextStep: 'heating',
          confidence: 0.8,
          reason: 'Common to heat mixture after mixing',
          templateId: 'mix-heat-template'
        }
      ],
      'heating': [
        {
          nextStep: 'cooling',
          confidence: 0.9,
          reason: 'Cooling typically follows heating',
          templateId: 'heat-cool-template'
        }
      ]
    };

    return sequences[currentType] || [];
  }

  private adjustForEnvironment(
    value: number,
    ranges: number[][],
    factors: Record<string, number>
  ): number {
    // 根据环境因素调整值
    // 这里可以实现更复杂的调整逻辑
    return value;
  }
} 