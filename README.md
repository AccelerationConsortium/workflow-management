Key requirements summarized from the documentation:

1. core functionality:
- Visual workflow manager, based on the React Flow implementation.
- Users can drag and drop components from predefined Unit Operations libraries to the canvas.
- Support for workflow branching
- Each operation node can have interactive features (e.g. file upload buttons).
- Workflow needs to be saved and reproducible

2. unit operations features:
- Supports multiple lab operations (e.g., 96-well plate transfer, file upload, etc.).
- Nodes can have single/multiple inputs and outputs.
- Nodes can have single/multiple inputs and outputs.
- Scalability (support for connecting different instruments)

System architecture design:



``mermaid
graph TD
    subgraph Frontend
        RC[React Client]
        RF[React Flow Canvas]
        OR[Operation Repository]
        WM[Workflow Manager]
        RF --> RC
        OR --> RC
        WM --> RC
    WM --> RC

    subgraph Backend
        API[REST API]
        VAL [Validation Service]
        WF[Workflow Engine]
        DB[(Database)]
        FS[File Storage]
        
        API --> VAL
        API --> WF
        WF --> DB
        API --> FS
    end

    RC <--> API

``

Main module responsibilities:

1. Frontend.
- React Flow Canvas: Workflow editor core
- Operation Repository: Manages predefined operation components.
- Workflow Manager: Handles saving/loading/validating workflows.

2. Backend.
- REST API: Provides a unified interface
- Validation Service: Handles node-to-node connection validation.
- Workflow Engine: Workflow execution engine
- Database: Stores workflow definition and execution records
- File Storage: Handles file uploads

Suggested steps for implementation:
1. Build the basic React Flow canvas. 2.
2. implement simple drag and drop functionality and 3-4 basic operation components
3. Add node-to-node connection validation.
4. implement workflow save/load
5. Develop interactive functions such as file upload

src/
  src/ components/
    src/ components/
    OperationNodes/
    Sidebar/
  hooks/
  services/
  types/
  App.tsx
  index.tsx

待完善的功能：
工作流加载功能（目前保存已实现，但加载还未完成）
更完善的数据验证系统
节点参数配置界面
工作流执行状态可视化
执行历史记录
更多类型的节点模板
后端集成（目前主要是前端功能）

搜索接口
外部系统集成
prefect工作流映射
数据库集成

Canvas System Architecture (Logical Structure)
Core Components
1. User Interface (UI):
   * Canvas:
      * Allows users to drag and drop Unit Operations (UOs) to design workflows.
   * Search Interface:
      * Users can search for desired operations or equipment with constraints (e.g., "plate-to-plate transfer using Tecan").
   * Connection to External Systems:
      * Interfaces with:
         * Experiment Monitor System: Displays real-time sensor data.
         * Inventory System: Estimates material requirements.
         * ELN System: Allows report generation.
2. Backend Components:
   * Database:
      * Stores UO metadata (parameters, constraints, devices).
      * Stores workflows designed on the canvas.
      * Links each UO to corresponding Python code for Prefect execution.
   * Prefect Workflow Mapper:
      * Converts canvas workflows into Prefect-compatible workflows.
   * Integration Manager:
      * Handles data exchange with external systems (e.g., Inventory, Monitor).
External Integrations (reserved api)
1. Prefect Cloud:
   * Executes workflows created from the canvas.
   * Reports workflow execution status back to the system.
2. Experiment Monitor System:
   * Provides real-time sensor data to the canvas interface for display.
3. Inventory System:
   * Calculates and provides material requirements based on the designed workflows.
4. ELN System:
   * Supports exporting workflows and execution data as reports (e.g., in PDF format).
Data Flow Overview
1. Workflow Design:
   * User designs workflows by dragging UOs onto the canvas and configuring them.
   * UO metadata is retrieved from the database.
2. Execution:
   * Canvas workflows are mapped to Prefect workflows and sent to Prefect Cloud for execution.
   * Prefect Cloud returns execution data (status, logs).
3. Monitoring:
   * Real-time data (e.g., sensor readings) is fetched from the Experiment Monitor System and displayed on the canvas.
4. Material Estimation:
   * Workflow details are sent to the Inventory System to calculate material needs.
5. Report Generation:
   * Workflow and execution data are exported to the ELN System for documentation.
  

在 App.tsx 中实现 onUpdate 回调来处理节点数据的更新
相应地更新数据库

后端需要实现的API端点：
GET /api/unit-operations/templates - 获取所有UO模板
GET /api/unit-operations/:id - 获取单个UO详情
PATCH /api/unit-operations/:id - 更新UO参数
POST /api/unit-operations/instances - 从模板创建新的UO实例

LLM:
提供了一个基本的演示框架，可以：
解析简单的实验描述并推荐节点
跟踪节点资源使用情况
提供一个预配置的演示工作流

搜索功能：
搜索结果的排序逻辑
实现搜索服务
添加相应的验证函数
更新搜索服务以利用新字段
扩展 UI 组件以显示新信息
 添加更多的约束类型
实现更复杂的验证逻辑
添加批处理配置支持
扩展控制细节的显示

workflow：
A. Workflow 创建与管理
用户可以选择多个 UO 节点，将它们组合成一个 Workflow Step
可以设置 Step 之间的依赖关系
为每个 Step 设置名称、描述和目标
可以保存和加载 Workflow 模板
B. UI 交互
Canvas 上添加 "Create Workflow" 按钮
支持多选节点（Ctrl/Cmd + 点击或框选）
右键菜单添加 "Add to Workflow Step" 选项
Workflow 管理面板：
显示所有 Steps
每个 Step 显示包含的 UO 节点
可以编辑 Step 的属性
可以调整 Step 顺序
可以设置 Step 间依赖
C. 执行控制
可以执行整个 Workflow 或单个 Step
执行时按照依赖关系和顺序执行
提供暂停、继续、终止功能
显示执行进度和状态
D. 可视化
在 Canvas 上用不同颜色或边框标识属于不同 Step 的节点
显示 Step 之间的依赖关系
提供 Workflow 的流程图视图
执行状态的实时反馈

多选功能的具体实现
WorkflowStep 的创建和管理组件
节点分组的可视化
工作流验证逻辑

添加创建模式的视觉提示
优化右键菜单的位置和样式
添加快捷键支持（如 Esc 退出创建模式）
添加工作流创建的状态提示

需要继续完善：
添加工作流的加载功能
添加工作流的版本控制
添加工作流的导出/导入功能
添加工作流的验证和测试功能

DB：
CREATE TABLE workflows (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE workflow_steps (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES workflows(id),
  name VARCHAR,
  description TEXT,
  node_ids JSONB,
  order_index INTEGER,
  status VARCHAR,
  dependencies JSONB,
  metadata JSONB
);

CREATE TABLE workflow_nodes (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES workflows(id),
  type VARCHAR,
  data JSONB,
  position JSONB
);

CREATE TABLE workflow_edges (
  id VARCHAR PRIMARY KEY,
  workflow_id VARCHAR REFERENCES workflows(id),
  source VARCHAR,
  target VARCHAR,
  type VARCHAR,
  data JSONB
);