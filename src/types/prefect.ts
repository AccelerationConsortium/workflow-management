interface PrefectTask {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  upstream_tasks: string[];
  downstream_tasks: string[];
}

interface PrefectFlow {
  name: string;
  tasks: PrefectTask[];
  schedule?: any;
} 