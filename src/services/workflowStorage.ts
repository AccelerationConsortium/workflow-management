export interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

export class WorkflowStorage {
  private static STORAGE_KEY = 'lab_workflows';

  static saveWorkflow(workflow: Omit<WorkflowData, 'id' | 'createdAt' | 'updatedAt'>): WorkflowData {
    const workflows = this.getAllWorkflows();
    const newWorkflow: WorkflowData = {
      ...workflow,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    workflows.push(newWorkflow);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
    return newWorkflow;
  }

  static updateWorkflow(id: string, workflow: Partial<WorkflowData>): WorkflowData {
    const workflows = this.getAllWorkflows();
    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workflow not found');

    const updatedWorkflow = {
      ...workflows[index],
      ...workflow,
      updatedAt: new Date().toISOString(),
    };
    
    workflows[index] = updatedWorkflow;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workflows));
    return updatedWorkflow;
  }

  static getWorkflow(id: string): WorkflowData | null {
    const workflows = this.getAllWorkflows();
    return workflows.find(w => w.id === id) || null;
  }

  static getAllWorkflows(): WorkflowData[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static deleteWorkflow(id: string): void {
    const workflows = this.getAllWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
} 