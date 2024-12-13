interface WorkflowData {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    id: string;
    name: string;
    description: string;
    nodeIds: string[];
    order: number;
    status: string;
    dependencies: string[];
    metadata: {
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  nodes: Array<{
    id: string;
    type: string;
    data: {
      label: string;
      parameters: any;
      primitives: any;
      // 其他节点特定数据
    };
    position: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    data?: any;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    version: string;
    tags: string[];
  };
}

export const WorkflowStorage = {
  saveWorkflow: async (workflow: WorkflowData) => {
    try {
      // 获取现有工作流
      const existingWorkflows = localStorage.getItem('workflows') || '[]';
      const workflows = JSON.parse(existingWorkflows);
      
      // 添加新工作流或更新现有工作流
      const workflowWithId = {
        ...workflow,
        id: workflow.id || `workflow-${Date.now()}`,
        metadata: {
          ...workflow.metadata,
          updatedAt: new Date()
        }
      };

      const existingIndex = workflows.findIndex((w: WorkflowData) => w.id === workflowWithId.id);
      if (existingIndex >= 0) {
        workflows[existingIndex] = workflowWithId;
      } else {
        workflows.push(workflowWithId);
      }

      // 保存到 localStorage
      localStorage.setItem('workflows', JSON.stringify(workflows));
      
      return workflowWithId;
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    }
  },

  // 获取所有工作流
  getAllWorkflows: () => {
    try {
      const workflows = localStorage.getItem('workflows') || '[]';
      return JSON.parse(workflows);
    } catch (error) {
      console.error('Error getting workflows:', error);
      return [];
    }
  },

  // 获取单个工作流
  getWorkflow: (id: string) => {
    try {
      const workflows = WorkflowStorage.getAllWorkflows();
      return workflows.find((w: WorkflowData) => w.id === id) || null;
    } catch (error) {
      console.error('Error getting workflow:', error);
      return null;
    }
  },

  // 删除工作流
  deleteWorkflow: (id: string) => {
    try {
      const workflows = WorkflowStorage.getAllWorkflows();
      const filteredWorkflows = workflows.filter((w: WorkflowData) => w.id !== id);
      localStorage.setItem('workflows', JSON.stringify(filteredWorkflows));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }
}; 