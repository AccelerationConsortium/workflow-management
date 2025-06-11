-- 1. 实验室信息表
CREATE TABLE laboratories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  institution VARCHAR,
  location VARCHAR,
  department VARCHAR,
  contact_info JSONB,
  capabilities JSONB,  -- 实验室能力和专长
  certification JSONB, -- 实验室资质认证
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 设备信息表 (扩展原有的devices表)
CREATE TABLE devices (
  id VARCHAR PRIMARY KEY,
  laboratory_id VARCHAR REFERENCES laboratories(id),
  manufacturer VARCHAR,
  model VARCHAR,
  serial_number VARCHAR,
  firmware VARCHAR,
  device_type VARCHAR,  -- 设备类型分类
  status VARCHAR,      -- 在线/离线/维护
  constraints JSONB,   -- 设备约束
  capabilities JSONB,  -- 设备能力
  calibration_date TIMESTAMP,
  maintenance_schedule JSONB,
  documentation_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 原语表 (扩展原有的primitives表)
CREATE TABLE primitives (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  python_code TEXT,
  parameters JSONB,
  device_types VARCHAR[],  -- 支持的设备类型
  manufacturers VARCHAR[], -- 支持的制造商
  control_details JSONB,   -- 控制细节
  constraints JSONB,       -- 约束条件
  validation_rules JSONB,  -- 验证规则
  examples TEXT[],         -- 使用示例
  tags VARCHAR[],          -- 用于搜索和分类
  version VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 单元操作模板表
CREATE TABLE unit_operation_templates (
  id VARCHAR PRIMARY KEY,
  type VARCHAR NOT NULL,
  label VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  description TEXT,
  parameters JSONB,        -- 参数定义
  inputs JSONB,           -- 输入定义
  outputs JSONB,          -- 输出定义
  primitive_ids VARCHAR[], -- 关联的原语
  validation_rules JSONB,  -- 验证规则
  requirements JSONB,      -- 设备和环境要求
  performance_metrics JSONB, -- 性能指标
  metadata JSONB,          -- 作者、版本等
  documentation_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 实验室UO实例表
CREATE TABLE laboratory_unit_operations (
  id VARCHAR PRIMARY KEY,
  template_id VARCHAR REFERENCES unit_operation_templates(id),
  laboratory_id VARCHAR REFERENCES laboratories(id),
  device_id VARCHAR REFERENCES devices(id),
  customization JSONB,    -- 实验室特定的修改
  performance_data JSONB, -- 实际性能数据
  usage_statistics JSONB, -- 使用统计
  validation_history JSONB, -- 验证历史
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 工作流模板表 (扩展原有的workflows表)
CREATE TABLE workflow_templates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  steps JSONB,           -- 工作流步骤
  nodes JSONB,           -- UO节点
  edges JSONB,           -- 连接关系
  validation_rules JSONB, -- 验证规则
  metadata JSONB,        -- 版本、作者等
  tags VARCHAR[],        -- 用于搜索和分类
  success_rate FLOAT,    -- 成功率统计
  avg_duration INTEGER,  -- 平均执行时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 实验室工作流实例表
CREATE TABLE laboratory_workflows (
  id VARCHAR PRIMARY KEY,
  template_id VARCHAR REFERENCES workflow_templates(id),
  laboratory_id VARCHAR REFERENCES laboratories(id),
  customization JSONB,    -- 实验室特定的修改
  execution_history JSONB, -- 执行历史
  performance_data JSONB,  -- 性能数据
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. LLM训练数据表
CREATE TABLE llm_training_data (
  id VARCHAR PRIMARY KEY,
  data_type VARCHAR,     -- workflow/uo/primitive
  source_id VARCHAR,     -- 关联的原始数据ID
  input_context JSONB,   -- 输入上下文
  output_result JSONB,   -- 输出结果
  feedback_score FLOAT,  -- 反馈评分
  tags VARCHAR[],        -- 用于分类
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. LLM推荐历史表
CREATE TABLE llm_recommendations (
  id VARCHAR PRIMARY KEY,
  request_type VARCHAR,   -- 推荐类型
  input_params JSONB,    -- 输入参数
  recommendations JSONB,  -- 推荐结果
  user_feedback JSONB,    -- 用户反馈
  success_rate FLOAT,    -- 推荐成功率
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 实验数据表
CREATE TABLE experiment_data (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES laboratory_workflows(id),
  step_id VARCHAR,
  data_type VARCHAR,
  raw_data JSONB,        -- 原始数据
  processed_data JSONB,   -- 处理后的数据
  metadata JSONB,         -- 实验条件等
  tags VARCHAR[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 实验依赖追踪表
CREATE TABLE experiment_dependencies (
  id VARCHAR PRIMARY KEY,
  parent_experiment_id VARCHAR REFERENCES experiment_data(id),
  child_experiment_id VARCHAR REFERENCES experiment_data(id),
  dependency_type VARCHAR, -- 参数传递/模型依赖等
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. 设备与实验室能力匹配表
CREATE TABLE laboratory_device_mappings (
  id VARCHAR PRIMARY KEY,
  laboratory_id VARCHAR REFERENCES laboratories(id),
  device_id VARCHAR REFERENCES devices(id),
  supported_capabilities JSONB, -- 支持的能力列表
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. 实验分析表
CREATE TABLE experiment_analysis (
  id VARCHAR PRIMARY KEY,
  experiment_data_id VARCHAR REFERENCES experiment_data(id),
  analysis_result JSONB, -- 分析结果
  performance_metrics JSONB, -- 性能指标
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


特点：
层次化结构：
模板层：存储标准UO和工作流模板
实例层：存储实验室特定的实现
执行层：存储实际执行数据
LLM支持：
训练数据收集
推荐历史跟踪
用户反馈收集
可追溯性：
完整的版本控制
修改历史记录
执行记录追踪
性能优化：
使用JSONB存储复杂数据
适当的索引支持
关联关系明确
扩展性：
支持自定义字段
预留扩展空间
灵活的标签系统

修改后的数据库结构与当前系统的匹配度：
匹配的部分：
unit_operation_templates 表完全匹配我们当前的 OperationNode 接口
workflow_templates 表与我们的 WorkflowData 接口对应
primitives 表与 DevicePrimitive 和 ControlDetail 接口对应
devices 表与 Device 和 DeviceConstraints 接口匹配

-- 需要添加参数验证表
CREATE TABLE parameter_validations (
  id VARCHAR PRIMARY KEY,
  operation_template_id VARCHAR REFERENCES unit_operation_templates(id),
  parameter_id VARCHAR,
  validation_type VARCHAR,  -- range/dependency/type/required/custom
  validation_rules JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 需要添加工作流执行状态表
CREATE TABLE workflow_executions (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES laboratory_workflows(id),
  status VARCHAR,  -- running/paused/completed/failed
  current_step VARCHAR,
  progress FLOAT,
  error_logs JSONB,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  performance_metrics JSONB
);

-- 需要添加参数联动规则表
CREATE TABLE parameter_linkages (
  id VARCHAR PRIMARY KEY,
  operation_template_id VARCHAR REFERENCES unit_operation_templates(id),
  source_parameter VARCHAR,
  target_parameter VARCHAR,
  linkage_rule JSONB,  -- 包含计算规则和条件
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

建议优化的部分：
在 laboratory_workflows 表中添加版本控制字段：
ALTER TABLE laboratory_workflows 
ADD COLUMN version VARCHAR,
ADD COLUMN parent_version VARCHAR,
ADD COLUMN version_description TEXT;

在 experiment_data 表中添加可视化配置：
ALTER TABLE experiment_data
ADD COLUMN visualization_config JSONB,
ADD COLUMN chart_templates JSONB;

. 与当前系统的集成建议：
// src/services/databaseService.ts
interface DatabaseService {
  // UO模板操作
  getUOTemplate(id: string): Promise<UnitOperationTemplate>;
  createUOTemplate(template: UnitOperationTemplate): Promise<string>;
  updateUOTemplate(id: string, updates: Partial<UnitOperationTemplate>): Promise<void>;

  // 工作流操作
  getWorkflowTemplate(id: string): Promise<WorkflowTemplate>;
  saveWorkflow(workflow: WorkflowData): Promise<string>;
  
  // 实验室实例操作
  getLaboratoryUO(id: string): Promise<LaboratoryUnitOperation>;
  saveLaboratoryWorkflow(workflow: LaboratoryWorkflow): Promise<string>;
  
  // 实验数据操作
  saveExperimentData(data: ExperimentData): Promise<string>;
  getExperimentHistory(workflowId: string): Promise<ExperimentData[]>;
}

需要新增的前端组件：
// 实验室选择器
const LaboratorySelector: React.FC = () => {
  // 实现实验室选择功能
};

// 设备匹配器
const DeviceMatcher: React.FC = () => {
  // 实现设备与UO的匹配功能
};

// 实验数据可视化
const ExperimentDataViewer: React.FC = () => {
  // 实现实验数据的展示和分析
};

支持实验室级别的定制
完整的数据追踪
为LLM集成做好准备
支持实验数据的收集和分析
下一步：
实现数据库迁移脚本
添加必要的索引
实现数据库服务层
更新前端组件以支持新功能