# Repository Overview: Workflow Management System

## 🔬 Project Description

The **Workflow Management System** is a comprehensive scientific laboratory automation platform designed specifically for **Self-Driving Laboratory (SDL)** environments. It provides a visual, node-based interface for designing, executing, and monitoring complex electrochemical and catalyst research workflows with automated device control and data collection capabilities.

## 🏗️ Technology Stack (Stackflow)

### Frontend Architecture
```
React 18 + TypeScript
├── ReactFlow (v11.11.4)     # Visual workflow editor
├── Material-UI (v7.0.2)     # UI component library
├── Vite (v5.4.19)           # Modern build tooling
├── Emotion                  # CSS-in-JS styling
└── Additional Libraries:
    ├── React Router (v7.4.1)    # Client-side routing
    ├── Formik + Yup             # Form handling & validation
    ├── Chart.js + React-ChartJS-2  # Data visualization
    ├── React Dropzone           # File upload interface
    ├── PapaParse + XLSX         # Data parsing (CSV/Excel)
    └── Axios                    # HTTP client
```

### Backend Architecture
```
Multi-Language Backend
├── Python FastAPI          # Primary API server
│   ├── Workflow execution engine
│   ├── SDL Catalyst primitives
│   ├── AI workflow generation
│   └── Experiment run tracking
├── Rust (Tokio ecosystem)   # Device executors
│   ├── Hardware control layer
│   ├── Real-time device communication
│   ├── Event-driven architecture
│   └── Performance-critical operations
└── Node.js/Express         # File management services
    ├── Prisma ORM (PostgreSQL)
    ├── File upload/download
    └── WebSocket real-time updates
```

### Database & Infrastructure
```
PostgreSQL Database
├── Prisma ORM              # Type-safe database access
├── Experiment run tracking # Provenance & reproducibility
├── File metadata storage   # Uploaded datasets
└── Workflow configurations # Saved workflows

Real-time Communication
├── WebSocket connections   # Live execution monitoring
├── MQTT (optional)         # Device telemetry
└── Event Bus architecture  # Device state management
```

### AI/ML Integration
```
Natural Language Processing
├── OpenAI GPT integration  # Text-to-workflow conversion
├── Local model support     # Alternative AI backends
├── Intelligent parameter extraction
└── Workflow optimization suggestions
```

## 🏛️ System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend APIs   │    │   Laboratory    │
│ (React/Vite)    │◄──►│  (FastAPI +      │◄──►│   Hardware      │
│                 │    │   Node.js)       │    │   (Devices)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │   PostgreSQL    │             │
         │              │   Database      │             │
         │              └─────────────────┘             │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Rust Device Manager   │
                    │  (Hardware Abstraction) │
                    └─────────────────────────┘
```

### Component Architecture
```
Frontend Components
├── Canvas/                 # ReactFlow workflow editor
├── OperationNodes/         # Laboratory operation nodes
│   ├── SDL Catalyst nodes  # Electrochemical operations
│   ├── Medusa platform     # Robotic control
│   ├── File operations     # Data handling
│   └── Custom UO builder   # User-defined operations
├── UOBuilder/             # Visual UO construction tool
├── ExecutionTraceViewer/  # Real-time monitoring
└── ProvenanceHistoryPanel/ # Experiment tracking

Backend Services
├── api/                   # REST API endpoints
│   ├── workflow_api.py    # Workflow CRUD operations
│   ├── experiment_runs_api.py # Execution tracking
│   └── websocket_service.py   # Real-time updates
├── executors/             # Execution engines
│   ├── python_executor.py     # Python-based operations
│   ├── sdl_catalyst_executor.py # Electrochemical control
│   └── simulation_executor.py  # Testing/simulation
├── agent_workflow_builder/ # AI workflow generation
│   ├── Natural language processing
│   ├── Parameter extraction
│   └── JSON workflow generation
└── device_executor/ (Rust) # Hardware abstraction layer
    ├── Device manager
    ├── Protocol implementations
    └── Real-time communication
```

## 🔧 Key Features & Capabilities

### 1. Visual Workflow Design
- **Drag-and-drop interface** using ReactFlow
- **Node-based programming** for scientific workflows
- **Real-time parameter validation** and type checking
- **Custom Unit Operation (UO) builder** for reusable components
- **Conditional logic and branching** for complex experimental flows

### 2. Laboratory Equipment Integration
- **SDL Catalyst Platform**: CV, LSV, OCV, PEIS electrochemical measurements
- **Medusa Robotic Platform**: Pumps, valves, hotplates, balances, sensors
- **OT2 Liquid Handling**: Automated pipetting and sample preparation
- **Generic Device Framework**: Extensible hardware abstraction layer

### 3. AI-Powered Workflow Generation
- **Natural Language Processing**: Convert text descriptions to workflows
- **Intelligent Parameter Extraction**: Automatically detect volumes, temperatures, durations
- **Smart Suggestions**: AI-recommended workflow optimizations
- **Multiple AI Backends**: OpenAI, local models, and mock mode support

### 4. Scientific Data Management
- **Provenance Tracking**: Complete experiment lineage and reproducibility
- **File Management**: Upload/download experimental data (CSV, Excel, images)
- **Real-time Monitoring**: Live execution status and device telemetry
- **Result Visualization**: Integrated plotting and data analysis tools

### 5. Execution Engines
- **Multi-language Support**: Python for science, Rust for hardware control
- **Remote Execution**: Distributed laboratory system support
- **Simulation Mode**: Test workflows before hardware execution
- **Error Handling**: Robust failure recovery and logging

## 🌐 Deployment Architecture

### Multi-Platform Deployment Support
```
Production Deployment Options
├── Vercel                  # Frontend hosting (recommended)
├── Docker Containers       # Full-stack containerization
├── Cloudflare Workers     # Edge computing deployment
├── AWS/GCP/Azure          # Cloud platform via Terraform
└── Self-Hosted            # On-premises laboratory deployment

Infrastructure Components
├── Frontend: Static SPA hosting
├── Backend APIs: Containerized microservices
├── Database: Managed PostgreSQL
├── File Storage: Object storage (S3, R2, etc.)
└── Real-time: WebSocket support
```

### Development Environment
```bash
# Frontend Development
npm run dev              # Vite dev server (port 5173)

# Backend Services
python backend/main.py   # FastAPI server (port 8000)
cd server && npm run dev # File server (port 3001)

# Device Control (Rust)
cd backend/device_executor && cargo run
```

## 🔗 Integration Points

### 1. API Endpoints
```
REST API Structure
├── /api/workflows         # Workflow CRUD operations
├── /api/experiments       # Execution management
├── /api/devices          # Hardware control
├── /api/files            # File upload/download
├── /api/provenance       # Experiment tracking
└── /ws                   # WebSocket connections
```

### 2. Device Communication Protocols
- **HTTP/REST**: Standard device APIs
- **MQTT**: IoT device telemetry
- **Serial/USB**: Direct hardware communication
- **WebSocket**: Real-time status updates

### 3. Data Formats
- **Workflow JSON**: ReactFlow-compatible workflow definitions
- **Parameter Schemas**: Zod/Yup validation schemas
- **Device Protocols**: Standardized command/response formats
- **Scientific Data**: CSV, Excel, HDF5, JSON formats

## 🧬 Scientific Workflow Capabilities

### Supported Laboratory Operations
```
Electrochemical Measurements
├── Cyclic Voltammetry (CV)
├── Linear Sweep Voltammetry (LSV)
├── Open Circuit Voltage (OCV)
├── Potentiostatic EIS (PEIS)
└── Custom electrochemical protocols

Liquid Handling
├── Automated pipetting
├── Sample dilution and mixing
├── Multi-well plate operations
└── Waste management

Environmental Control
├── Temperature regulation
├── Atmospheric control
├── Stirring and mixing
└── Timing and synchronization
```

### Workflow Execution Model
1. **Design Phase**: Visual workflow construction
2. **Validation Phase**: Parameter and logic validation
3. **Simulation Phase**: Dry-run execution (optional)
4. **Execution Phase**: Hardware control and data collection
5. **Analysis Phase**: Result processing and visualization
6. **Provenance Phase**: Complete experiment documentation

## 📊 Data Flow Architecture

```
Data Flow Pipeline
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Workflow  │───►│ Parameter   │───►│  Device     │───►│  Results    │
│   Design    │    │ Validation  │    │ Execution   │    │ Collection  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Canvas    │    │ Type System │    │ Rust Device │    │ PostgreSQL  │
│   Storage   │    │ Validation  │    │  Manager    │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 Unique Features

### 1. Self-Driving Laboratory (SDL) Integration
- **Autonomous Experimentation**: Fully automated experiment execution
- **Adaptive Workflows**: Real-time parameter adjustment based on results
- **Closed-loop Control**: Feedback-driven experimental optimization

### 2. Multi-Language Execution
- **Python**: Scientific computing and data analysis
- **Rust**: Real-time hardware control and performance-critical operations
- **JavaScript/TypeScript**: User interface and workflow orchestration

### 3. AI-Enhanced Workflow Generation
- **Natural Language Interface**: "Heat to 80°C then do CV scan"
- **Context-Aware Suggestions**: Smart parameter recommendations
- **Workflow Optimization**: AI-driven efficiency improvements

### 4. Scientific Reproducibility
- **Complete Provenance Tracking**: Every parameter, file, and execution step
- **Version Control Integration**: Git commit tracking for code changes
- **Environment Capture**: Python/Conda environment documentation
- **Configuration Hashing**: Deterministic workflow identification

## 📁 Repository Structure Summary

```
workflow-management/
├── src/                    # React frontend application
├── backend/                # Python FastAPI + Rust device control
├── server/                 # Node.js file management service
├── docs/                   # Comprehensive documentation
├── deployment/             # Multi-platform deployment configs
├── examples/               # Sample workflows and demonstrations
├── tests/                  # Test suites for all components
└── tools/                  # Development and utility scripts
```

This repository represents a state-of-the-art scientific workflow management platform that bridges the gap between laboratory automation hardware and user-friendly visual programming interfaces, enabling researchers to design, execute, and analyze complex experimental workflows with unprecedented ease and reproducibility.