/**
 * Provenance Service
 * 
 * Service for handling experiment run provenance data API calls
 */

// Types
export interface ExperimentRun {
  id: string;
  userId?: string;
  workflowId: string;
  configHash: string;
  inputSummary?: Record<string, any>;
  outputSummary?: Record<string, any>;
  functionName?: string;
  environment?: Record<string, any>;
  gitCommitHash?: string;
  triggerSource?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface ExperimentRunsResponse {
  runs: ExperimentRun[];
  total: number;
  limit: number;
  offset: number;
}

export interface RunsFilter {
  workflowId?: string;
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
  summaryOnly?: boolean;
}

export interface RunStatistics {
  total_runs: number;
  status_distribution: Record<string, number>;
  workflow_distribution: Record<string, number>;
  sample_size: number;
}

class ProvenanceService {
  private baseUrl = '/api/runs';

  /**
   * Get experiment runs with optional filtering
   */
  async getRuns(filter: RunsFilter = {}): Promise<ExperimentRunsResponse> {
    const params = new URLSearchParams();
    
    if (filter.workflowId) params.append('workflow_id', filter.workflowId);
    if (filter.userId) params.append('user_id', filter.userId);
    if (filter.status) params.append('status', filter.status);
    if (filter.limit) params.append('limit', filter.limit.toString());
    if (filter.offset) params.append('offset', filter.offset.toString());
    if (filter.summaryOnly) params.append('summary_only', 'true');

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch runs: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get a specific experiment run by ID
   */
  async getRun(runId: string): Promise<ExperimentRun> {
    const response = await fetch(`${this.baseUrl}/${runId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Run ${runId} not found`);
      }
      throw new Error(`Failed to fetch run: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get a summary of a specific experiment run
   */
  async getRunSummary(runId: string): Promise<Partial<ExperimentRun>> {
    const response = await fetch(`${this.baseUrl}/${runId}/summary`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Run ${runId} not found`);
      }
      throw new Error(`Failed to fetch run summary: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get logs for a specific experiment run
   */
  async getRunLogs(runId: string): Promise<{ run_id: string; logs: string[]; total_entries: number }> {
    const response = await fetch(`${this.baseUrl}/${runId}/logs`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Run ${runId} not found`);
      }
      throw new Error(`Failed to fetch run logs: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get all runs for a specific workflow
   */
  async getWorkflowRuns(workflowId: string, limit = 50, offset = 0): Promise<ExperimentRunsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const response = await fetch(`${this.baseUrl}/workflow/${workflowId}/runs?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch workflow runs: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get statistics about experiment runs
   */
  async getRunStatistics(): Promise<RunStatistics> {
    const response = await fetch(`${this.baseUrl}/stats/summary`);
    if (!response.ok) {
      throw new Error(`Failed to fetch run statistics: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Search runs by multiple criteria
   */
  async searchRuns(searchTerm: string, filter: RunsFilter = {}): Promise<ExperimentRunsResponse> {
    // Get all runs and filter client-side for now
    // In a real implementation, this would be server-side search
    const runs = await this.getRuns(filter);
    
    const filteredRuns = runs.runs.filter(run => {
      const searchLower = searchTerm.toLowerCase();
      return (
        run.id.toLowerCase().includes(searchLower) ||
        run.workflowId.toLowerCase().includes(searchLower) ||
        run.functionName?.toLowerCase().includes(searchLower) ||
        run.triggerSource?.toLowerCase().includes(searchLower)
      );
    });

    return {
      ...runs,
      runs: filteredRuns,
      total: filteredRuns.length
    };
  }

  /**
   * Get runs by date range
   */
  async getRunsByDateRange(
    startDate: Date,
    endDate: Date,
    filter: RunsFilter = {}
  ): Promise<ExperimentRunsResponse> {
    const runs = await this.getRuns(filter);
    
    const filteredRuns = runs.runs.filter(run => {
      if (!run.startTime) return false;
      const runDate = new Date(run.startTime);
      return runDate >= startDate && runDate <= endDate;
    });

    return {
      ...runs,
      runs: filteredRuns,
      total: filteredRuns.length
    };
  }

  /**
   * Get runs grouped by status
   */
  async getRunsByStatus(): Promise<Record<string, ExperimentRun[]>> {
    const runs = await this.getRuns({ limit: 1000 });
    
    const groupedRuns: Record<string, ExperimentRun[]> = {};
    
    runs.runs.forEach(run => {
      if (!groupedRuns[run.status]) {
        groupedRuns[run.status] = [];
      }
      groupedRuns[run.status].push(run);
    });

    return groupedRuns;
  }

  /**
   * Get recent runs (last 24 hours)
   */
  async getRecentRuns(limit = 20): Promise<ExperimentRunsResponse> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.getRunsByDateRange(oneDayAgo, new Date(), { limit });
  }

  /**
   * Get failed runs for debugging
   */
  async getFailedRuns(limit = 50): Promise<ExperimentRunsResponse> {
    return this.getRuns({ status: 'failed', limit });
  }

  /**
   * Get running runs for monitoring
   */
  async getRunningRuns(): Promise<ExperimentRunsResponse> {
    return this.getRuns({ status: 'running' });
  }
}

// Export singleton instance
export const provenanceService = new ProvenanceService();
export default provenanceService;