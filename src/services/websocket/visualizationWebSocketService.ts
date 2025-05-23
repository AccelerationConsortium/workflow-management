import { EventEmitter } from 'events';
import { getEnvVariable } from '../../utils/env';

export interface VisualizationData {
  nodeId: string;
  timestamp: string;
  data: Record<string, any>;
  type: string;
}

export class VisualizationWebSocketService extends EventEmitter {
  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 seconds
  private url: string;
  private isConnecting = false;

  constructor(url: string) {
    super();
    this.url = url;
  }

  /**
   * 连接到可视化数据WebSocket服务
   */
  public connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('Visualization WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as VisualizationData;
          this.emit('data', data);
        } catch (error) {
          console.error('Failed to parse visualization data:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('Visualization WebSocket error:', error);
        this.emit('error', error);
      };

      this.socket.onclose = (event) => {
        console.log(`Visualization WebSocket closed: ${event.code} ${event.reason}`);
        this.isConnecting = false;
        this.socket = null;
        this.emit('disconnected');

        // 尝试重新连接
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, this.reconnectDelay);
        } else {
          console.error('Max reconnect attempts reached');
          this.emit('reconnect_failed');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.emit('error', error);
    }
  }

  /**
   * 订阅特定节点的可视化数据
   * @param nodeId 节点ID
   */
  public subscribeToNode(nodeId: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'subscribe',
      nodeId
    }));
  }

  /**
   * 取消订阅特定节点的可视化数据
   * @param nodeId 节点ID
   */
  public unsubscribeFromNode(nodeId: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'unsubscribe',
      nodeId
    }));
  }

  /**
   * 断开WebSocket连接
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// 创建单例实例
const visualizationWebSocketService = new VisualizationWebSocketService(
  getEnvVariable('REACT_APP_VISUALIZATION_WS_URL', 'ws://localhost:8000/ws/visualization')
);

export default visualizationWebSocketService;
