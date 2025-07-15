-- Create experiment_runs table for provenance tracking
CREATE TABLE IF NOT EXISTS experiment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    workflow_id VARCHAR(255) NOT NULL,
    config_hash VARCHAR(255) NOT NULL,
    input_summary JSONB,
    output_summary JSONB,
    function_name VARCHAR(255),
    environment JSONB,
    git_commit_hash VARCHAR(255),
    trigger_source VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_experiment_runs_workflow_id ON experiment_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_experiment_runs_user_id ON experiment_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_runs_status ON experiment_runs(status);
CREATE INDEX IF NOT EXISTS idx_experiment_runs_start_time ON experiment_runs(start_time);
CREATE INDEX IF NOT EXISTS idx_experiment_runs_created_at ON experiment_runs(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_experiment_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_experiment_runs_updated_at
    BEFORE UPDATE ON experiment_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_experiment_runs_updated_at();