# System Architecture Diagram

## High-Level Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React 18 + TypeScript]
        Canvas[ReactFlow Canvas]
        UOBuilder[Custom UO Builder]
        Monitor[Real-time Monitor]
    end
    
    subgraph "API Layer"
        FastAPI[Python FastAPI]
        FileAPI[Node.js Express]
        WebSocket[WebSocket Service]
        AI[AI Workflow Agent]
    end
    
    subgraph "Execution Layer"
        PyExec[Python Executor]
        SDLExec[SDL Catalyst Executor]
        SimExec[Simulation Executor]
        RustDM[Rust Device Manager]
    end
    
    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        FileStore[(File Storage)]
        Cache[(Redis Cache)]
    end
    
    subgraph "Hardware Layer"
        SDL[SDL Catalyst Platform]
        Medusa[Medusa Robotic Platform]
        OT2[OT2 Liquid Handler]
        Sensors[Environmental Sensors]
    end
    
    UI --> FastAPI
    Canvas --> WebSocket
    UOBuilder --> FastAPI
    Monitor --> WebSocket
    
    FastAPI --> PyExec
    FastAPI --> SDLExec
    FastAPI --> AI
    FileAPI --> FileStore
    WebSocket --> RustDM
    
    PyExec --> PostgreSQL
    SDLExec --> RustDM
    SimExec --> PostgreSQL
    RustDM --> SDL
    RustDM --> Medusa
    RustDM --> OT2
    RustDM --> Sensors
    
    FastAPI --> PostgreSQL
    FileAPI --> PostgreSQL
```

## Technology Stack Flow

```mermaid
graph LR
    subgraph "Frontend Stack"
        React[React 18]
        TS[TypeScript]
        MUI[Material-UI]
        Vite[Vite Build]
        ReactFlow[ReactFlow]
    end
    
    subgraph "Backend Stack"
        Python[Python FastAPI]
        Rust[Rust Tokio]
        Node[Node.js Express]
        Prisma[Prisma ORM]
    end
    
    subgraph "Data Stack"
        PG[PostgreSQL]
        WS[WebSocket]
        MQTT[MQTT Optional]
    end
    
    subgraph "AI Stack"
        OpenAI[OpenAI GPT]
        NLP[Natural Language Processing]
        ParamExt[Parameter Extraction]
    end
    
    React --> Python
    ReactFlow --> WS
    Python --> Rust
    Node --> Prisma
    Prisma --> PG
    Python --> OpenAI
    NLP --> ParamExt
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FastAPI
    participant RustDM as Rust Device Manager
    participant Hardware
    participant Database
    
    User->>Frontend: Design Workflow
    Frontend->>FastAPI: Send Workflow JSON
    FastAPI->>Database: Save Workflow
    FastAPI->>RustDM: Execute Operations
    RustDM->>Hardware: Control Devices
    Hardware-->>RustDM: Device Response
    RustDM-->>FastAPI: Execution Results
    FastAPI->>Database: Store Results
    FastAPI-->>Frontend: Real-time Updates
    Frontend-->>User: Display Results
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevFE[Vite Dev Server :5173]
        DevAPI[FastAPI :8000]
        DevFile[Express :3001]
        DevDB[(PostgreSQL :5432)]
    end
    
    subgraph "Production Options"
        subgraph "Cloud Deployment"
            Vercel[Vercel Frontend]
            AWS[AWS Backend]
            RDS[(AWS RDS)]
        end
        
        subgraph "Container Deployment"
            Docker[Docker Compose]
            K8s[Kubernetes]
            Helm[Helm Charts]
        end
        
        subgraph "Edge Deployment"
            CF[Cloudflare Workers]
            CDN[Global CDN]
            Edge[(Edge Database)]
        end
    end
    
    subgraph "Laboratory Network"
        LocalAPI[Local API Server]
        Hardware[Laboratory Equipment]
        VPN[Secure VPN Connection]
    end
```

## Component Interaction Map

```mermaid
graph TB
    subgraph "User Interface Components"
        WorkflowDesigner[Workflow Designer]
        NodeLibrary[Operation Node Library]
        ParameterPanel[Parameter Configuration]
        ExecutionMonitor[Execution Monitor]
        ResultViewer[Result Viewer]
    end
    
    subgraph "Business Logic"
        WorkflowEngine[Workflow Engine]
        ValidationEngine[Validation Engine]
        ExecutionEngine[Execution Engine]
        AIAgent[AI Workflow Agent]
        ProvenanceTracker[Provenance Tracker]
    end
    
    subgraph "Data Access"
        WorkflowRepository[Workflow Repository]
        ExperimentRepository[Experiment Repository]
        FileRepository[File Repository]
        DeviceRepository[Device Repository]
    end
    
    WorkflowDesigner --> WorkflowEngine
    NodeLibrary --> ValidationEngine
    ParameterPanel --> ValidationEngine
    ExecutionMonitor --> ExecutionEngine
    ResultViewer --> ProvenanceTracker
    
    WorkflowEngine --> WorkflowRepository
    ExecutionEngine --> ExperimentRepository
    AIAgent --> WorkflowRepository
    ProvenanceTracker --> ExperimentRepository
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            HTTPS[HTTPS/TLS]
            VPN[Laboratory VPN]
            Firewall[Network Firewall]
        end
        
        subgraph "Application Security"
            Auth[Authentication]
            RBAC[Role-Based Access Control]
            InputVal[Input Validation]
            CORS[CORS Policy]
        end
        
        subgraph "Data Security"
            Encryption[Data Encryption]
            Backup[Secure Backup]
            Audit[Audit Logging]
        end
        
        subgraph "Device Security"
            DeviceAuth[Device Authentication]
            SecureComm[Secure Communication]
            IsolatedNetwork[Isolated Network]
        end
    end
```

## Scalability Architecture

```mermaid
graph LR
    subgraph "Horizontal Scaling"
        LoadBalancer[Load Balancer]
        API1[API Instance 1]
        API2[API Instance 2]
        API3[API Instance N]
    end
    
    subgraph "Vertical Scaling"
        HighCPU[High-CPU Instances]
        HighMem[High-Memory Instances]
        GPUNodes[GPU Instances for AI]
    end
    
    subgraph "Data Scaling"
        ReadReplicas[(Read Replicas)]
        Sharding[(Database Sharding)]
        Caching[(Distributed Cache)]
    end
    
    LoadBalancer --> API1
    LoadBalancer --> API2
    LoadBalancer --> API3
    
    API1 --> ReadReplicas
    API2 --> Sharding
    API3 --> Caching
```

This architecture supports:
- **Scalable execution** for multiple concurrent experiments
- **Real-time monitoring** of laboratory operations
- **Fault tolerance** with graceful degradation
- **Scientific reproducibility** through complete provenance tracking
- **Multi-tenant support** for shared laboratory resources