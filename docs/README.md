# Workflow Management System Documentation

## 📖 Documentation Index

This directory contains comprehensive documentation for the Workflow Management System, a scientific laboratory automation platform designed for Self-Driving Laboratory (SDL) environments.

### 📋 Quick Start Guides

- **[Tech Stack Reference](TECH_STACK_REFERENCE.md)** - Quick overview of all technologies used
- **[Repository Overview](REPOSITORY_OVERVIEW.md)** - Comprehensive technical documentation
- **[Architecture Diagrams](ARCHITECTURE_DIAGRAM.md)** - Visual system architecture

### 🏗️ Architecture Documentation

- **[Frontend Tech Stack](FRONTEND_TECH_STACK.md)** - React + TypeScript frontend details
- **[Provenance Tracking](PROVENANCE_TRACKING.md)** - Scientific reproducibility system
- **[AI Workflow Builder](../backend/agent_workflow_builder/README.md)** - Natural language processing

### 🔧 Feature Documentation

- **[SDL7 Features Summary](SDL7_FEATURES_SUMMARY.md)** - Self-Driving Laboratory integration
- **[Enhanced Custom UO Builder](ENHANCED_CUSTOM_UO_BUILDER.md)** - Custom unit operation creation
- **[EIS Analysis Integration](EIS_ANALYSIS_INTEGRATION_GUIDE.md)** - Electrochemical analysis
- **[Robotic Control](ROBOTIC_CONTROL_FIX.md)** - Laboratory robot integration

### 🚀 Deployment Documentation

- **[Cloudflare Deployment](../deployment/cloudflare/README.md)** - Edge computing deployment
- **[Docker Deployment](../deployment/docker/)** - Container orchestration
- **[Terraform Infrastructure](../deployment/terraform/)** - Cloud infrastructure

### 🔬 Scientific Features

- **[OTFLEX Integration](OTFLEX_INTEGRATION_GUIDE.md)** - OpenTrons integration
- **[UR3 Robot Control](UR3.md)** - Universal robot integration
- **[LLM Integration](LLM_INTEGRATION_COMPLETE.md)** - Large language model features

## 🎯 What This System Does

The Workflow Management System is a comprehensive platform that enables:

1. **Visual Workflow Design**: Drag-and-drop interface for creating laboratory workflows
2. **Multi-Language Execution**: Python for science, Rust for hardware, JavaScript for UI
3. **AI-Powered Generation**: Convert natural language descriptions to executable workflows
4. **Real-time Control**: Direct communication with laboratory equipment
5. **Scientific Reproducibility**: Complete provenance tracking and experiment lineage
6. **Multi-Platform Deployment**: From local development to cloud-scale production

## 🏗️ System Architecture Summary

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│   FastAPI +      │◄──►│   Laboratory    │
│ (TypeScript)    │    │   Rust Services  │    │   Hardware      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────▼───────────────────────┘
                        PostgreSQL Database
                     (Provenance & Configuration)
```

## 🔧 Key Technology Choices

- **React + ReactFlow**: For intuitive visual workflow design
- **TypeScript**: For type safety across the entire frontend
- **Python FastAPI**: For scientific computing and REST APIs
- **Rust**: For real-time hardware control and performance
- **PostgreSQL + Prisma**: For reliable data persistence
- **WebSocket**: For real-time monitoring and communication

## 🌟 Unique Features

1. **Multi-Language Architecture**: Each language used for its strengths
2. **Scientific Focus**: Built specifically for research laboratory automation
3. **AI Integration**: Natural language to workflow conversion
4. **Real-time Capabilities**: Live device monitoring and control
5. **Reproducibility**: Complete experiment tracking and provenance
6. **Extensibility**: Custom unit operations and device integrations

## 📚 Getting Started

1. **For Developers**: Start with [Tech Stack Reference](TECH_STACK_REFERENCE.md)
2. **For Architects**: Review [Architecture Diagrams](ARCHITECTURE_DIAGRAM.md)
3. **For Scientists**: Explore [SDL7 Features](SDL7_FEATURES_SUMMARY.md)
4. **For DevOps**: Check [Deployment Guides](../deployment/)

## 🤝 Contributing

When contributing to this project:

1. **Read the architecture docs** to understand system design
2. **Follow the tech stack conventions** outlined in the documentation
3. **Update relevant documentation** when adding new features
4. **Test across all components** (frontend, backend, device control)

## 📞 Support

For questions about:
- **Architecture**: See [Repository Overview](REPOSITORY_OVERVIEW.md)
- **Technology**: Check [Tech Stack Reference](TECH_STACK_REFERENCE.md)
- **Features**: Browse the feature-specific documentation
- **Deployment**: Review the deployment guides in `../deployment/`

This documentation is designed to provide both high-level understanding and detailed technical information for developers, researchers, and system administrators working with the Workflow Management System.