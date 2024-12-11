-- 创建unit_operations表
CREATE TABLE unit_operations (
    id SERIAL PRIMARY KEY,
    uo_name VARCHAR(255) NOT NULL,
    description TEXT,
    inputs JSONB NOT NULL DEFAULT '{}',
    parameters JSONB NOT NULL DEFAULT '{}',
    outputs JSONB NOT NULL DEFAULT '{}',
    constraints JSONB NOT NULL DEFAULT '{}',
    hardware TEXT,
    software JSONB NOT NULL DEFAULT '{}',
    control_details TEXT,
    environment JSONB NOT NULL DEFAULT '{}',
    analysis TEXT,
    customization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建unit_operation_templates表
CREATE TABLE unit_operation_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建unit_operation_instances表
CREATE TABLE unit_operation_instances (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES unit_operation_templates(id),
    instance_config JSONB NOT NULL,
    workflow_id INTEGER,  -- ���联到工作流
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_unit_operations_updated_at
    BEFORE UPDATE ON unit_operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unit_operation_instances_updated_at
    BEFORE UPDATE ON unit_operation_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 