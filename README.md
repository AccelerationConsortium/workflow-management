# Workflow Management System

A comprehensive scientific laboratory workflow management platform designed for automated electrochemical and catalyst research. This system provides visual workflow design, device control, and experiment execution capabilities for Self-Driving Laboratory (SDL) environments.

> **📚 For detailed technical documentation, see [Repository Overview](docs/REPOSITORY_OVERVIEW.md) and [Architecture Diagrams](docs/ARCHITECTURE_DIAGRAM.md)**

## Features

### Visual Workflow Designer
- **Drag-and-drop interface** for creating laboratory workflows
- **Node-based editor** with ReactFlow for connecting operations
- **Pre-built operation nodes** for common lab equipment and procedures
- **Custom Unit Operation (UO) builder** for creating reusable components
- **Conditional logic and branching** for complex experimental flows

### Laboratory Equipment Integration
- **SDL Catalyst operations** for electrochemical experiments (CV, LSV, OCV, PEIS)
- **Medusa platform controls** (pumps, valves, hotplates, balances, sensors)
- **OT2 robotic arm integration** for liquid handling
- **Generic device abstraction layer** for extensibility

### Workflow Execution
- **Multi-language execution** (Python for science, Rust for hardware control)
- **Real-time monitoring** via WebSocket connections
- **Remote execution capability** for distributed laboratory systems
- **Simulation mode** for testing workflows before execution

### Parameter Management
- **Dynamic parameter configuration** with validation
- **Optimization suggestions** and parameter linkage
- **Environmental adjustment services**
- **File upload/download** for experimental data

## Technology Stack

### Frontend
- **React 18** with TypeScript for modern web development
- **ReactFlow** for visual workflow editor and canvas
- **Material-UI (MUI)** for consistent UI components
- **Vite** for fast development and optimized builds

### Backend
- **Python FastAPI** for REST API and workflow execution
- **Rust** for high-performance device control and hardware abstraction
- **Node.js/Express** for file management and upload services
- **PostgreSQL** with Prisma ORM for data persistence
- **WebSocket** for real-time execution monitoring

### AI/ML Integration
- **OpenAI GPT** integration for natural language to workflow conversion
- **Custom NLP models** for parameter extraction and workflow optimization
- **Intelligent suggestions** for workflow improvements and missing steps

### Infrastructure
- **Multi-platform deployment** (Vercel, Docker, Cloudflare, AWS/GCP/Azure)
- **Real-time communication** via WebSocket and optional MQTT
- **Scientific data formats** (CSV, Excel, HDF5, JSON)
- **Complete provenance tracking** for scientific reproducibility

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Rust 1.70+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SissiFeng/workflow-management.git
   cd workflow-management
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Build Rust components**
   ```bash
   cd device_executor
   cargo build --release
   ```

5. **Setup database**
   ```bash
   cd server
   npx prisma migrate dev
   ```

### Development

1. **Start the frontend development server**
   ```bash
   npm run dev
   ```

2. **Start the backend services**
   ```bash
   cd backend
   python main.py
   ```

3. **Start the file server**
   ```bash
   cd server
   npm run dev
   ```

### Build for Production

```bash
npm run build
```

## Project Structure

```
workflow-management/
├── src/                          # Frontend React application
│   ├── components/               # UI components
│   │   ├── OperationNodes/      # Workflow node components
│   │   ├── Canvas/              # Workflow canvas
│   │   └── UOBuilder/           # Custom UO builder
│   ├── services/                # Frontend services
│   └── types/                   # TypeScript type definitions
├── backend/                     # Python backend services
│   ├── api/                     # FastAPI endpoints
│   ├── executors/              # Workflow execution engines
│   ├── sdl_catalyst/           # SDL Catalyst primitives
│   └── device_executor/        # Rust device controllers
├── server/                      # Node.js file server
├── config/                      # Configuration files
├── documentation/               # Project documentation
├── deployment/                  # Deployment configurations
└── tests/                       # Test files
```

## Key Components

### Workflow Nodes
- **SDL Catalyst Nodes**: CV, LSV, OCV, PEIS for electrochemical measurements
- **Medusa Control Nodes**: Device-specific controls for laboratory equipment
- **File Nodes**: Data upload/download and file management
- **Conditional Nodes**: Logic and branching for complex workflows

### Device Integration
- **CVA (Cyclic Voltammetry Analyzer)**: Automated electrochemical measurements
- **Pump Control**: Precise fluid handling and dispensing
- **Valve Control**: Multi-port switching for fluid routing
- **Balance Control**: Automated weighing and material handling
- **Sensor Monitoring**: Real-time data acquisition

### Custom UO Builder
- **Visual component library** for creating custom operations
- **Parameter type system** (number, string, boolean, file, select)
- **Drag-and-drop interface** for UO construction
- **Auto-registration** in the workflow sidebar

## API Documentation

The system provides RESTful APIs for:
- Workflow management and execution
- Device control and monitoring
- File upload/download operations
- Custom UO registration

API documentation is available at `/api/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript/ESLint conventions for frontend code
- Use Python type hints and follow PEP 8 for backend code
- Write tests for new features
- Update documentation for API changes

## Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest

# Device executor tests
cd backend/device_executor
cargo test
```

## Deployment

The system supports deployment to:
- **Vercel** for frontend hosting
- **Docker containers** for backend services
- **Cloud platforms** (AWS, GCP, Azure) via Terraform configurations

See the `deployment/` directory for specific deployment guides.

## Documentation

### Technical Documentation
- **[Repository Overview](docs/REPOSITORY_OVERVIEW.md)**: Comprehensive technical overview covering stack, architecture, and features
- **[Architecture Diagrams](docs/ARCHITECTURE_DIAGRAM.md)**: Visual system architecture with Mermaid diagrams
- **[Frontend Tech Stack](docs/FRONTEND_TECH_STACK.md)**: Detailed frontend technology breakdown
- **[Provenance Tracking](docs/PROVENANCE_TRACKING.md)**: Scientific reproducibility and experiment tracking

### Feature Documentation
- **[AI Workflow Builder](backend/agent_workflow_builder/README.md)**: Natural language to workflow conversion
- **[SDL7 Features](docs/SDL7_FEATURES_SUMMARY.md)**: Self-Driving Laboratory integration
- **[Custom UO Builder](docs/ENHANCED_CUSTOM_UO_BUILDER.md)**: Creating custom unit operations
- **[Device Integration](docs/guides/)**: Laboratory equipment integration guides

### Deployment Guides
- **[Cloudflare Deployment](deployment/cloudflare/README.md)**: Edge computing deployment
- **[Docker Deployment](deployment/docker/)**: Containerized deployment
- **[Terraform Infrastructure](deployment/terraform/)**: Cloud infrastructure as code

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Check the documentation directory
- Review existing discussions and PRs

## Acknowledgments

- Built for Self-Driving Laboratory (SDL) research environments
- Supports electrochemical and catalyst research workflows
- Designed for automated laboratory operations and data collection