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
