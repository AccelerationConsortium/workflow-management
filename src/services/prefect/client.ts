import { PrefectConfig } from '../../components/PrefectConfig/types';

class PrefectClient {
  private static instance: PrefectClient;
  private config: PrefectConfig | null = null;
  private headers: Record<string, string> = {};

  private constructor() {}

  public static getInstance(): PrefectClient {
    if (!PrefectClient.instance) {
      PrefectClient.instance = new PrefectClient();
    }
    return PrefectClient.instance;
  }

  public async connect(config: PrefectConfig): Promise<void> {
    try {
      // Test connection
      const response = await fetch(`${config.serverUrl}/api/health`, {
        headers: {
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Prefect server');
      }

      this.config = config;
      this.headers = {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      };
    } catch (error) {
      console.error('Prefect connection error:', error);
      throw error;
    }
  }

  public disconnect(): void {
    this.config = null;
    this.headers = {};
  }

  public isConnected(): boolean {
    return this.config !== null;
  }

  public getConfig(): PrefectConfig | null {
    return this.config;
  }

  // API methods will be added here
  public async deployFlow(flowCode: string, name: string): Promise<void> {
    if (!this.config) {
      throw new Error('Not connected to Prefect server');
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/api/deployments`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          name,
          flow_code: flowCode,
          workspace: this.config.workspace
        })
      });

      if (!response.ok) {
        throw new Error('Failed to deploy flow');
      }
    } catch (error) {
      console.error('Flow deployment error:', error);
      throw error;
    }
  }
}

export const prefectClient = PrefectClient.getInstance(); 
