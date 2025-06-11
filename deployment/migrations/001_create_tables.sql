-- 创建 unit_operations 表
CREATE TABLE IF NOT EXISTS unit_operations (
    id SERIAL PRIMARY KEY,
    uo_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    hardware VARCHAR(100),
    software JSONB,
    control_details TEXT,
    environment JSONB,
    analysis TEXT,
    customization TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建 uo_inputs 表
CREATE TABLE IF NOT EXISTS uo_inputs (
    id SERIAL PRIMARY KEY,
    uo_id INTEGER REFERENCES unit_operations(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    unit VARCHAR(20),
    initial_value JSONB
);

-- 创建 uo_parameters 表
CREATE TABLE IF NOT EXISTS uo_parameters (
    id SERIAL PRIMARY KEY,
    uo_id INTEGER REFERENCES unit_operations(id),
    name VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    unit VARCHAR(20)
);

-- 创建 uo_outputs 表
CREATE TABLE IF NOT EXISTS uo_outputs (
    id SERIAL PRIMARY KEY,
    uo_id INTEGER REFERENCES unit_operations(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    unit VARCHAR(20)
);

-- 创建 uo_constraints 表
CREATE TABLE IF NOT EXISTS uo_constraints (
    id SERIAL PRIMARY KEY,
    uo_id INTEGER REFERENCES unit_operations(id),
    category VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL
); 