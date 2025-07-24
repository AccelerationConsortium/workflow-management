import { ExecutionStep, ExecutionStatus } from '../components/ExecutionTraceViewer';

export class ExecutionTraceService {
  private static instance: ExecutionTraceService;
  private executionSteps: Map<string, ExecutionStep[]> = new Map();
  private listeners: Map<string, ((steps: ExecutionStep[]) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): ExecutionTraceService {
    if (!ExecutionTraceService.instance) {
      ExecutionTraceService.instance = new ExecutionTraceService();
    }
    return ExecutionTraceService.instance;
  }

  // Subscribe to execution updates for a workflow
  subscribe(workflowId: string, callback: (steps: ExecutionStep[]) => void): () => void {
    if (!this.listeners.has(workflowId)) {
      this.listeners.set(workflowId, []);
    }
    this.listeners.get(workflowId)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(workflowId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Notify all listeners for a workflow
  private notify(workflowId: string) {
    const steps = this.executionSteps.get(workflowId) || [];
    const listeners = this.listeners.get(workflowId) || [];
    listeners.forEach(callback => callback(steps));
  }

  // Initialize execution trace for a workflow
  initializeWorkflow(workflowId: string, nodes: any[]): void {
    const steps: ExecutionStep[] = nodes.map((node, index) => ({
      id: `step-${node.id}`,
      nodeId: node.id,
      nodeName: node.data?.label || node.type,
      operation: node.type,
      status: 'pending' as ExecutionStatus,
      children: this.createPrimitiveSteps(node),
    }));

    this.executionSteps.set(workflowId, steps);
    this.notify(workflowId);
  }

  // Create primitive operation steps from node data
  private createPrimitiveSteps(node: any): ExecutionStep[] | undefined {
    if (!node.data?.primitiveOperations) return undefined;

    return node.data.primitiveOperations.map((primitive: any, index: number) => ({
      id: `${node.id}-primitive-${index}`,
      nodeId: node.id,
      nodeName: node.data?.label || node.type,
      operation: primitive.operation,
      primitive: primitive.operation,
      status: 'pending' as ExecutionStatus,
    }));
  }

  // Update step status
  updateStepStatus(
    workflowId: string,
    stepId: string,
    status: ExecutionStatus,
    data?: Partial<ExecutionStep>
  ): void {
    const steps = this.executionSteps.get(workflowId);
    if (!steps) return;

    const updateStep = (stepList: ExecutionStep[]) => {
      for (const step of stepList) {
        if (step.id === stepId) {
          step.status = status;
          if (data) {
            Object.assign(step, data);
          }
          if (status === 'running' && !step.startTime) {
            step.startTime = new Date();
          }
          if (['success', 'failure', 'skipped'].includes(status) && step.startTime) {
            step.endTime = new Date();
            step.duration = step.endTime.getTime() - step.startTime.getTime();
          }
          return true;
        }
        if (step.children && updateStep(step.children)) {
          return true;
        }
      }
      return false;
    };

    updateStep(steps);
    this.notify(workflowId);
  }

  // Simulate workflow execution
  async simulateExecution(workflowId: string): Promise<void> {
    const steps = this.executionSteps.get(workflowId);
    if (!steps) return;

    for (const step of steps) {
      // Start the step
      this.updateStepStatus(workflowId, step.id, 'running');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Process primitives if any
      if (step.children) {
        for (const primitive of step.children) {
          this.updateStepStatus(workflowId, primitive.id, 'running');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simulate success/failure
          const success = Math.random() > 0.1; // 90% success rate
          this.updateStepStatus(workflowId, primitive.id, success ? 'success' : 'failure', {
            message: success ? 'Operation completed successfully' : 'Operation failed',
            error: success ? undefined : 'Simulated error occurred',
            data: success ? {
              files: [`/data/output_${primitive.id}.csv`],
              charts: [`/charts/result_${primitive.id}.png`],
            } : undefined,
          });
        }
      }

      // Complete the main step
      const allPrimitivesSuccess = !step.children || step.children.every(p => p.status === 'success');
      this.updateStepStatus(workflowId, step.id, allPrimitivesSuccess ? 'success' : 'failure', {
        message: allPrimitivesSuccess ? 'All operations completed' : 'Some operations failed',
      });
    }
  }

  // Get execution steps for a workflow
  getExecutionSteps(workflowId: string): ExecutionStep[] {
    return this.executionSteps.get(workflowId) || [];
  }

  // Clear execution trace for a workflow
  clearWorkflow(workflowId: string): void {
    this.executionSteps.delete(workflowId);
    this.listeners.delete(workflowId);
  }
}

export const executionTraceService = ExecutionTraceService.getInstance();