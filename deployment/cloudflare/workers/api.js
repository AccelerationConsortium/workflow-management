/**
 * Cloudflare Worker for Workflow Management API
 * Handles backend API requests with D1 database and R2 storage
 */

import { WorkflowSession } from './durable-objects/WorkflowSession.js';

// Export Durable Object class
export { WorkflowSession };

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// API Routes
const routes = {
  '/health': handleHealth,
  '/api/workflows': handleWorkflows,
  '/api/workflows/:id': handleWorkflowById,
  '/api/files': handleFiles,
  '/api/devices': handleDevices,
  '/api/execute': handleExecution,
  '/ws': handleWebSocket,
};

export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      const url = new URL(request.url);
      const path = url.pathname;

      // Route matching
      for (const [pattern, handler] of Object.entries(routes)) {
        const match = matchRoute(pattern, path);
        if (match) {
          const response = await handler(request, env, ctx, match.params);
          return addCorsHeaders(response);
        }
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { 
        status: 500,
        headers: corsHeaders 
      });
    }
  },
};

// Health check endpoint
async function handleHealth(request, env) {
  return new Response(JSON.stringify({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Workflow management endpoints
async function handleWorkflows(request, env, ctx, params) {
  const { method } = request;

  switch (method) {
    case 'GET':
      return await getWorkflows(env);
    case 'POST':
      return await createWorkflow(request, env);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleWorkflowById(request, env, ctx, params) {
  const { method } = request;
  const { id } = params;

  switch (method) {
    case 'GET':
      return await getWorkflow(id, env);
    case 'PUT':
      return await updateWorkflow(id, request, env);
    case 'DELETE':
      return await deleteWorkflow(id, env);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

// File management with R2
async function handleFiles(request, env) {
  const { method } = request;

  switch (method) {
    case 'GET':
      return await listFiles(env);
    case 'POST':
      return await uploadFile(request, env);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

// Device management
async function handleDevices(request, env) {
  const { method } = request;

  switch (method) {
    case 'GET':
      return await getDevices(env);
    case 'POST':
      return await registerDevice(request, env);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

// Workflow execution
async function handleExecution(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const body = await request.json();
  const { workflowId, parameters } = body;

  // Execute workflow asynchronously
  ctx.waitUntil(executeWorkflow(workflowId, parameters, env));

  return new Response(JSON.stringify({ 
    status: 'accepted',
    executionId: crypto.randomUUID()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// WebSocket handling with Durable Objects
async function handleWebSocket(request, env) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  // Get or create Durable Object
  const id = env.WORKFLOW_SESSIONS.idFromName('session-' + crypto.randomUUID());
  const obj = env.WORKFLOW_SESSIONS.get(id);

  return obj.fetch(request);
}

// Database operations
async function getWorkflows(env) {
  try {
    const stmt = env.WORKFLOW_DB.prepare('SELECT * FROM workflows ORDER BY created_at DESC');
    const { results } = await stmt.all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response('Database Error', { status: 500 });
  }
}

async function createWorkflow(request, env) {
  try {
    const workflow = await request.json();
    const id = crypto.randomUUID();
    
    const stmt = env.WORKFLOW_DB.prepare(`
      INSERT INTO workflows (id, name, description, definition, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const now = new Date().toISOString();
    await stmt.bind(
      id,
      workflow.name,
      workflow.description,
      JSON.stringify(workflow.definition),
      now,
      now
    ).run();

    return new Response(JSON.stringify({ id, ...workflow }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    return new Response('Failed to create workflow', { status: 500 });
  }
}

async function getWorkflow(id, env) {
  try {
    const stmt = env.WORKFLOW_DB.prepare('SELECT * FROM workflows WHERE id = ?');
    const result = await stmt.bind(id).first();
    
    if (!result) {
      return new Response('Workflow not found', { status: 404 });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    return new Response('Database Error', { status: 500 });
  }
}

// File operations with R2
async function listFiles(env) {
  try {
    const objects = await env.WORKFLOW_FILES.list();
    const files = objects.objects.map(obj => ({
      name: obj.key,
      size: obj.size,
      lastModified: obj.uploaded
    }));

    return new Response(JSON.stringify(files), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('List files error:', error);
    return new Response('Storage Error', { status: 500 });
  }
}

async function uploadFile(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`;
    await env.WORKFLOW_FILES.put(fileName, file.stream());

    return new Response(JSON.stringify({ 
      fileName,
      size: file.size,
      url: `/files/${fileName}`
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return new Response('Upload Failed', { status: 500 });
  }
}

// Device operations
async function getDevices(env) {
  try {
    const stmt = env.WORKFLOW_DB.prepare('SELECT * FROM devices WHERE active = 1');
    const { results } = await stmt.all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get devices error:', error);
    return new Response('Database Error', { status: 500 });
  }
}

// Workflow execution (async)
async function executeWorkflow(workflowId, parameters, env) {
  try {
    // Simulate workflow execution
    console.log(`Executing workflow ${workflowId} with parameters:`, parameters);
    
    // Update execution status in database
    const executionId = crypto.randomUUID();
    const stmt = env.WORKFLOW_DB.prepare(`
      INSERT INTO executions (id, workflow_id, parameters, status, started_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    await stmt.bind(
      executionId,
      workflowId,
      JSON.stringify(parameters),
      'running',
      new Date().toISOString()
    ).run();

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Update completion status
    const updateStmt = env.WORKFLOW_DB.prepare(`
      UPDATE executions SET status = ?, completed_at = ? WHERE id = ?
    `);
    
    await updateStmt.bind(
      'completed',
      new Date().toISOString(),
      executionId
    ).run();

  } catch (error) {
    console.error('Workflow execution error:', error);
  }
}

// Utility functions
function matchRoute(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return { params };
}

function addCorsHeaders(response) {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}