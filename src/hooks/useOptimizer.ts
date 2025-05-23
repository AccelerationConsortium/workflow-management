import { useState, useEffect, useCallback } from 'react';
import {
  OptimizerService,
  OptimizationConfig,
  OptimizationSession,
  OptimizationSuggestion,
  OptimizationResult
} from '../services/optimizer/optimizerService';

// 导入环境变量工具函数
import { getEnvVariable } from '../utils/env';

const optimizerService = new OptimizerService(
  getEnvVariable('REACT_APP_OPTIMIZER_API_URL', 'http://localhost:8001'),
  getEnvVariable('REACT_APP_OPTIMIZER_API_KEY', '')
);

export interface UseOptimizerOptions {
  workflowId: string;
  nodeId: string;
  autoStart?: boolean;
}

export interface UseOptimizerResult {
  session: OptimizationSession | null;
  suggestion: OptimizationSuggestion | null;
  history: OptimizationResult[];
  isLoading: boolean;
  error: Error | null;
  createSession: (config: Omit<OptimizationConfig, 'workflowId' | 'nodeId'>) => Promise<void>;
  getNextSuggestion: () => Promise<OptimizationSuggestion | null>;
  submitResult: (objectives: Record<string, number>) => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

/**
 * 使用优化器的React钩子
 */
export const useOptimizer = (options: UseOptimizerOptions): UseOptimizerResult => {
  const [session, setSession] = useState<OptimizationSession | null>(null);
  const [suggestion, setSuggestion] = useState<OptimizationSuggestion | null>(null);
  const [history, setHistory] = useState<OptimizationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 创建优化会话
   */
  const createSession = async (config: Omit<OptimizationConfig, 'workflowId' | 'nodeId'>): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const newSession = await optimizerService.createOptimizationSession({
        ...config,
        workflowId: options.workflowId,
        nodeId: options.nodeId
      });

      setSession(newSession);

      // 如果设置了自动启动，则获取第一个建议
      if (options.autoStart) {
        await getNextSuggestion();
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 获取下一个参数建议
   */
  const getNextSuggestion = async (): Promise<OptimizationSuggestion | null> => {
    if (!session) {
      setError(new Error('No active optimization session'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newSuggestion = await optimizerService.getNextSuggestion(session.id);
      setSuggestion(newSuggestion);
      return newSuggestion;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 提交优化结果
   */
  const submitResult = async (objectives: Record<string, number>): Promise<void> => {
    if (!session || !suggestion) {
      setError(new Error('No active optimization session or suggestion'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await optimizerService.submitResult(session.id, suggestion.id, objectives);

      // 更新历史
      setHistory(prevHistory => [...prevHistory, result]);

      // 更新会话
      const updatedSession = await optimizerService.getOptimizationSession(session.id);
      setSession(updatedSession);

      // 清除当前建议
      setSuggestion(null);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 暂停优化会话
   */
  const pauseSession = async (): Promise<void> => {
    if (!session) {
      setError(new Error('No active optimization session'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedSession = await optimizerService.pauseOptimizationSession(session.id);
      setSession(updatedSession);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 恢复优化会话
   */
  const resumeSession = async (): Promise<void> => {
    if (!session) {
      setError(new Error('No active optimization session'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedSession = await optimizerService.resumeOptimizationSession(session.id);
      setSession(updatedSession);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 刷新优化历史
   */
  const refreshHistory = async (): Promise<void> => {
    if (!session) {
      setError(new Error('No active optimization session'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const history = await optimizerService.getOptimizationHistory(session.id);
      setHistory(history);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载历史数据
  useEffect(() => {
    if (session) {
      refreshHistory();
    }
  }, [session?.id]);

  return {
    session,
    suggestion,
    history,
    isLoading,
    error,
    createSession,
    getNextSuggestion,
    submitResult,
    pauseSession,
    resumeSession,
    refreshHistory
  };
};
