/**
 * Durable Object for handling WebSocket connections and real-time workflow updates
 */

export class WorkflowSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    await this.handleSession(server, request);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(webSocket, request) {
    webSocket.accept();

    const sessionId = crypto.randomUUID();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';

    // Store session information
    this.sessions.set(sessionId, {
      webSocket,
      userId,
      connectedAt: Date.now(),
      subscriptions: new Set(),
    });

    // Send welcome message
    webSocket.send(JSON.stringify({
      type: 'connected',
      sessionId,
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    webSocket.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data);
        await this.handleMessage(sessionId, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
        webSocket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    // Handle connection close
    webSocket.addEventListener('close', (event) => {
      console.log(`WebSocket closed for session ${sessionId}:`, event.code);
      this.sessions.delete(sessionId);
    });

    // Handle errors
    webSocket.addEventListener('error', (event) => {
      console.error(`WebSocket error for session ${sessionId}:`, event);
      this.sessions.delete(sessionId);
    });

    // Set up periodic ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString(),
        }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds
  }

  async handleMessage(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const { webSocket } = session;

    switch (message.type) {
      case 'subscribe':
        await this.handleSubscribe(sessionId, message);
        break;

      case 'unsubscribe':
        await this.handleUnsubscribe(sessionId, message);
        break;

      case 'workflow_update':
        await this.handleWorkflowUpdate(sessionId, message);
        break;

      case 'device_status':
        await this.handleDeviceStatus(sessionId, message);
        break;

      case 'execution_command':
        await this.handleExecutionCommand(sessionId, message);
        break;

      case 'pong':
        // Response to ping, update last seen time
        session.lastSeen = Date.now();
        break;

      default:
        webSocket.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${message.type}`,
        }));
    }
  }

  async handleSubscribe(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const { channel } = message;
    session.subscriptions.add(channel);

    session.webSocket.send(JSON.stringify({
      type: 'subscribed',
      channel,
      timestamp: new Date().toISOString(),
    }));

    console.log(`Session ${sessionId} subscribed to ${channel}`);
  }

  async handleUnsubscribe(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const { channel } = message;
    session.subscriptions.delete(channel);

    session.webSocket.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
      timestamp: new Date().toISOString(),
    }));

    console.log(`Session ${sessionId} unsubscribed from ${channel}`);
  }

  async handleWorkflowUpdate(sessionId, message) {
    const { workflowId, status, progress, data } = message;

    // Broadcast to all sessions subscribed to this workflow
    const broadcastMessage = {
      type: 'workflow_status',
      workflowId,
      status,
      progress,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(`workflow:${workflowId}`, broadcastMessage);

    // Store workflow status in KV for persistence
    await this.env.WORKFLOW_CACHE.put(
      `workflow_status:${workflowId}`,
      JSON.stringify(broadcastMessage),
      { expirationTtl: 3600 } // 1 hour
    );
  }

  async handleDeviceStatus(sessionId, message) {
    const { deviceId, status, data } = message;

    const broadcastMessage = {
      type: 'device_status',
      deviceId,
      status,
      data,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(`device:${deviceId}`, broadcastMessage);

    // Store device status
    await this.env.WORKFLOW_CACHE.put(
      `device_status:${deviceId}`,
      JSON.stringify(broadcastMessage),
      { expirationTtl: 300 } // 5 minutes
    );
  }

  async handleExecutionCommand(sessionId, message) {
    const { command, workflowId, parameters } = message;
    const session = this.sessions.get(sessionId);

    if (!session) return;

    try {
      switch (command) {
        case 'start':
          await this.startWorkflowExecution(workflowId, parameters);
          break;
        case 'pause':
          await this.pauseWorkflowExecution(workflowId);
          break;
        case 'resume':
          await this.resumeWorkflowExecution(workflowId);
          break;
        case 'stop':
          await this.stopWorkflowExecution(workflowId);
          break;
        default:
          throw new Error(`Unknown command: ${command}`);
      }

      session.webSocket.send(JSON.stringify({
        type: 'command_executed',
        command,
        workflowId,
        status: 'success',
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      session.webSocket.send(JSON.stringify({
        type: 'command_error',
        command,
        workflowId,
        error: error.message,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  async broadcast(channel, message) {
    const promises = [];

    for (const [sessionId, session] of this.sessions) {
      if (session.subscriptions.has(channel) && 
          session.webSocket.readyState === WebSocket.OPEN) {
        promises.push(
          session.webSocket.send(JSON.stringify(message))
        );
      }
    }

    await Promise.allSettled(promises);
  }

  async startWorkflowExecution(workflowId, parameters) {
    // Simulate workflow execution start
    console.log(`Starting workflow ${workflowId} with parameters:`, parameters);
    
    await this.handleWorkflowUpdate(null, {
      workflowId,
      status: 'running',
      progress: 0,
      data: { started: true, parameters }
    });
  }

  async pauseWorkflowExecution(workflowId) {
    console.log(`Pausing workflow ${workflowId}`);
    
    await this.handleWorkflowUpdate(null, {
      workflowId,
      status: 'paused',
      data: { paused: true }
    });
  }

  async resumeWorkflowExecution(workflowId) {
    console.log(`Resuming workflow ${workflowId}`);
    
    await this.handleWorkflowUpdate(null, {
      workflowId,
      status: 'running',
      data: { resumed: true }
    });
  }

  async stopWorkflowExecution(workflowId) {
    console.log(`Stopping workflow ${workflowId}`);
    
    await this.handleWorkflowUpdate(null, {
      workflowId,
      status: 'stopped',
      progress: 0,
      data: { stopped: true }
    });
  }

  // Cleanup inactive sessions
  async cleanup() {
    const now = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes

    for (const [sessionId, session] of this.sessions) {
      if (session.lastSeen && (now - session.lastSeen) > timeout) {
        console.log(`Cleaning up inactive session ${sessionId}`);
        session.webSocket.close();
        this.sessions.delete(sessionId);
      }
    }
  }
}