import axios, { AxiosInstance } from 'axios';

export interface OptimizationParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  step?: number;
  currentValue: number;
  unit?: string;
  description?: string;
}

export interface OptimizationObjective {
  id: string;
  name: string;
  direction: 'maximize' | 'minimize';
  weight?: number;
  description?: string;
}

export interface OptimizationConstraint {
  id: string;
  expression: string;
  description?: string;
}

export interface OptimizationConfig {
  workflowId: string;
  nodeId: string;
  parameters: OptimizationParameter[];
  objectives: OptimizationObjective[];
  constraints?: OptimizationConstraint[];
  maxIterations?: number;
  explorationFactor?: number; // 探索因子，值越大越倾向于探索新区域
}

export interface OptimizationSuggestion {
  id: string;
  parameters: Record<string, number>;
  expectedObjectives: Record<string, number>;
  confidence: number;
  iteration: number;
  createdAt: string;
}

export interface OptimizationResult {
  id: string;
  parameters: Record<string, number>;
  objectives: Record<string, number>;
  iteration: number;
  createdAt: string;
}

export interface OptimizationSession {
  id: string;
  workflowId: string;
  nodeId: string;
  status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
  currentIteration: number;
  maxIterations: number;
  createdAt: string;
  updatedAt: string;
  bestResult?: OptimizationResult;
}

export class OptimizerService {
  private axios: AxiosInstance;
  
  constructor(baseUrl: string, apiKey?: string) {
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      }
    });
  }

  /**
   * 创建优化会话
   */
  public async createOptimizationSession(config: OptimizationConfig): Promise<OptimizationSession> {
    try {
      const response = await this.axios.post('/api/optimization/sessions', config);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to create optimization session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取优化会话
   */
  public async getOptimizationSession(sessionId: string): Promise<OptimizationSession> {
    try {
      const response = await this.axios.get(`/api/optimization/sessions/${sessionId}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get optimization session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取参数建议
   */
  public async getNextSuggestion(sessionId: string): Promise<OptimizationSuggestion> {
    try {
      const response = await this.axios.get(`/api/optimization/sessions/${sessionId}/suggestions/next`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get next suggestion: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 提交优化结果
   */
  public async submitResult(
    sessionId: string, 
    suggestionId: string, 
    objectives: Record<string, number>
  ): Promise<OptimizationResult> {
    try {
      const response = await this.axios.post(`/api/optimization/sessions/${sessionId}/results`, {
        suggestionId,
        objectives
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to submit result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 暂停优化会话
   */
  public async pauseOptimizationSession(sessionId: string): Promise<OptimizationSession> {
    try {
      const response = await this.axios.post(`/api/optimization/sessions/${sessionId}/pause`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to pause optimization session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 恢复优化会话
   */
  public async resumeOptimizationSession(sessionId: string): Promise<OptimizationSession> {
    try {
      const response = await this.axios.post(`/api/optimization/sessions/${sessionId}/resume`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to resume optimization session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取优化历史
   */
  public async getOptimizationHistory(sessionId: string): Promise<OptimizationResult[]> {
    try {
      const response = await this.axios.get(`/api/optimization/sessions/${sessionId}/history`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get optimization history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取优化建议历史
   */
  public async getSuggestionHistory(sessionId: string): Promise<OptimizationSuggestion[]> {
    try {
      const response = await this.axios.get(`/api/optimization/sessions/${sessionId}/suggestions`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(`Failed to get suggestion history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
