// 条件节点的数据类型定义
export interface ConditionalNodeData {
  id: string;
  label: string;
  type: 'conditional';
  conditionType: 'boolean' | 'switch';  // if/else 或 switch-case
  conditionSource: 'parameter' | 'result';  // 条件值来源
  parameterName?: string;  // 如果条件来源是参数
  resultPath?: string;     // 如果条件来源是结果
  expression: string;      // 条件表达式 (例如 "pH > 7")
  cases: ConditionCase[];  // switch-case 的情况
}

// switch-case 的情况定义
export interface ConditionCase {
  id: string;
  label: string;
  value: string | number | boolean;  // 匹配的值
}

// 条件边的数据类型
export interface ConditionalEdgeData {
  condition: {
    type: 'true' | 'false' | 'case';
    caseId?: string;     // 对于 switch-case
    description?: string; // 可选描述
  }
}
