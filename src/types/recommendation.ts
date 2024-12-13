export interface ParameterRecommendation {
  paramId: string;
  value: number;
  confidence: number;
  reason: string;
  typicalRange: [number, number];
  relatedParams?: string[];  // 相关联的参数
}

export interface WorkflowRecommendation {
  nextSteps: string[];  // UO类型ID
  confidence: number;
  reason: string;
  templateId?: string;  // 如果是来自模板的推荐
} 