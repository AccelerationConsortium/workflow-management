-- Cloudflare D1 Database Schema for Workflow Management System

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    definition TEXT NOT NULL, -- JSON string
    version INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT,
    tags TEXT -- JSON array as string
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS executions (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    parameters TEXT, -- JSON string
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    started_at TEXT,
    completed_at TEXT,
    error_message TEXT,
    progress INTEGER DEFAULT 0, -- 0-100
    result TEXT, -- JSON string
    FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'pump', 'valve', 'sensor', 'balance', etc.
    model TEXT,
    manufacturer TEXT,
    connection_config TEXT, -- JSON string
    status TEXT DEFAULT 'offline', -- online, offline, error, maintenance
    last_seen TEXT,
    capabilities TEXT, -- JSON array as string
    active BOOLEAN DEFAULT true,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_hash TEXT,
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT,
    description TEXT,
    tags TEXT, -- JSON array as string
    workflow_id TEXT, -- Associated workflow if any
    FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

-- Unit Operations (UO) table
CREATE TABLE IF NOT EXISTS unit_operations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    parameters_schema TEXT NOT NULL, -- JSON schema
    implementation TEXT, -- Code or configuration
    version TEXT DEFAULT '1.0.0',
    active BOOLEAN DEFAULT true,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT
);

-- Execution steps table (for detailed execution tracking)
CREATE TABLE IF NOT EXISTS execution_steps (
    id TEXT PRIMARY KEY,
    execution_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    step_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TEXT,
    completed_at TEXT,
    error_message TEXT,
    input_data TEXT, -- JSON string
    output_data TEXT, -- JSON string
    device_id TEXT,
    step_order INTEGER NOT NULL,
    FOREIGN KEY (execution_id) REFERENCES executions(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- User sessions table (for WebSocket connections)
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_active TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    metadata TEXT -- JSON string
);

-- Workflow templates table
CREATE TABLE IF NOT EXISTS workflow_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    template_data TEXT NOT NULL, -- JSON string
    parameters TEXT, -- JSON schema for template parameters
    version TEXT DEFAULT '1.0.0',
    active BOOLEAN DEFAULT true,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT,
    usage_count INTEGER DEFAULT 0
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL, -- debug, info, warn, error
    message TEXT NOT NULL,
    component TEXT, -- which part of system
    execution_id TEXT,
    device_id TEXT,
    user_id TEXT,
    metadata TEXT, -- JSON string
    created_at TEXT NOT NULL,
    FOREIGN KEY (execution_id) REFERENCES executions(id),
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(active);
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON executions(started_at);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
CREATE INDEX IF NOT EXISTS idx_files_workflow_id ON files(workflow_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_execution_steps_execution_id ON execution_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_steps_status ON execution_steps(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_execution_id ON system_logs(execution_id);

-- Insert sample data
INSERT OR IGNORE INTO devices (id, name, type, model, status, created_at, updated_at) VALUES
('dev_001', 'Main Pump', 'pump', 'PumpMaster 3000', 'online', datetime('now'), datetime('now')),
('dev_002', 'Valve Controller', 'valve', 'ValveControl Pro', 'online', datetime('now'), datetime('now')),
('dev_003', 'Temperature Sensor', 'sensor', 'TempSense X1', 'online', datetime('now'), datetime('now')),
('dev_004', 'Analytical Balance', 'balance', 'BalancePro 500', 'offline', datetime('now'), datetime('now'));

INSERT OR IGNORE INTO unit_operations (id, name, type, category, description, parameters_schema, created_at, updated_at) VALUES
('uo_001', 'Cyclic Voltammetry', 'measurement', 'electrochemical', 'Perform cyclic voltammetry measurement', '{"type":"object","properties":{"startVoltage":{"type":"number"},"endVoltage":{"type":"number"},"scanRate":{"type":"number"}}}', datetime('now'), datetime('now')),
('uo_002', 'Sample Transfer', 'operation', 'liquid_handling', 'Transfer liquid sample between containers', '{"type":"object","properties":{"volume":{"type":"number"},"source":{"type":"string"},"destination":{"type":"string"}}}', datetime('now'), datetime('now')),
('uo_003', 'Temperature Control', 'control', 'environmental', 'Control temperature of reaction vessel', '{"type":"object","properties":{"targetTemp":{"type":"number"},"duration":{"type":"number"},"rampRate":{"type":"number"}}}', datetime('now'), datetime('now'));