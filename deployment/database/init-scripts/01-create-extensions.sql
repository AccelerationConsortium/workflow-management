-- Initialize database with required extensions and configurations
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create application schema
CREATE SCHEMA IF NOT EXISTS workflow;

-- Create application user with limited privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'workflow_app') THEN
        CREATE ROLE workflow_app LOGIN PASSWORD 'workflow_app_password';
    END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA workflow TO workflow_app;
GRANT CREATE ON SCHEMA workflow TO workflow_app;
GRANT USAGE ON SCHEMA public TO workflow_app;
GRANT CREATE ON SCHEMA public TO workflow_app;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA workflow GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO workflow_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA workflow GRANT USAGE, SELECT ON SEQUENCES TO workflow_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO workflow_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO workflow_app;

-- Configure PostgreSQL settings for performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = 'on';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Create indexes for common queries
-- (These will be created by Prisma migrations, but useful for raw SQL setups)