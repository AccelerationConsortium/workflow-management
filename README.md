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