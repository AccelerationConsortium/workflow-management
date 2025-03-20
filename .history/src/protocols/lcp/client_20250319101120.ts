export class LCPClient {
  private baseUrl: string;
  
  constructor(config: { baseUrl: string }) {
    this.baseUrl = config.baseUrl;
  }
  
  async connectDevice(deviceId: string) {
    // 调用 LCP 的 API
    return await fetch(`${this.baseUrl}/api/lcp/devices/${deviceId}/connect`);
  }
  
  async sendCommand(deviceId: string, command: string, params: any) {
    // 发送命令到 LCP
    return await fetch(`${this.baseUrl}/api/lcp/control`, {
      method: 'POST',
      body: JSON.stringify({ deviceId, command, params })
    });
  }
}

// workflow-management/src/config/lcp.ts
export const lcpConfig = {
    baseUrl: process.env.LCP_SERVER_URL || 'http://localhost:3000',
    // 其他 LCP 相关配置
  };
