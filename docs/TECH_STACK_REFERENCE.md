# Technology Stack Quick Reference

## 🎯 Core Technologies at a Glance

| Layer | Technology | Purpose | Version |
|-------|------------|---------|---------|
| **Frontend** | React | UI Framework | 18.3.1 |
| | TypeScript | Type Safety | 5.7.2 |
| | ReactFlow | Workflow Canvas | 11.11.4 |
| | Material-UI | UI Components | 7.0.2 |
| | Vite | Build Tool | 5.4.19 |
| **Backend** | Python FastAPI | REST API | Latest |
| | Rust | Device Control | 1.70+ |
| | Node.js | File Services | 18+ |
| | PostgreSQL | Database | 14+ |
| | Prisma | ORM | 5.10.0 |
| **AI/ML** | OpenAI GPT | NLP | Latest |
| | Custom Models | Local AI | - |
| **DevOps** | Docker | Containerization | Latest |
| | Terraform | Infrastructure | Latest |
| | Vercel | Frontend Hosting | - |

## 📊 Architecture Patterns

- **Microservices**: Separate services for different concerns
- **Event-Driven**: Real-time device communication
- **Multi-Language**: Python for science, Rust for performance, JS for UI
- **API-First**: RESTful APIs with WebSocket real-time updates
- **Scientific Workflow**: SDL (Self-Driving Laboratory) integration

## 🔧 Development Stack

```bash
# Frontend Development
npm run dev          # Vite dev server (React + TypeScript)

# Backend Development  
python backend/main.py    # FastAPI server
cd server && npm run dev  # File management service
cd backend/device_executor && cargo run  # Rust device manager

# Database
npx prisma migrate dev    # Database migrations
npx prisma studio        # Database browser
```

## 🌐 Deployment Options

1. **Development**: Local development with hot reload
2. **Vercel**: Frontend hosting + serverless functions
3. **Docker**: Full-stack containerization
4. **Cloudflare**: Edge computing with Workers
5. **Cloud**: AWS/GCP/Azure via Terraform
6. **Self-Hosted**: On-premises laboratory deployment

## 📦 Key Dependencies

### Frontend Core
```json
{
  "react": "^18.3.1",
  "typescript": "^5.7.2", 
  "reactflow": "^11.11.4",
  "@mui/material": "^7.0.2",
  "vite": "^5.4.19"
}
```

### Backend Core
```toml
# Rust (Cargo.toml)
[dependencies]
tokio = { version = "1.28", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
axum = { version = "0.6", features = ["ws"] }
```

```json
// Node.js (package.json)
{
  "@prisma/client": "^5.10.0",
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

## 🔬 Scientific Features

- **SDL Catalyst**: Electrochemical measurement platform
- **Medusa**: Robotic laboratory automation
- **OT2**: Liquid handling robot integration
- **Provenance Tracking**: Complete experiment lineage
- **AI Workflow Generation**: Natural language to executable workflows
- **Real-time Monitoring**: Live device status and data streaming

## 🚀 Unique Characteristics

1. **Multi-Language Architecture**: Leverages best of each language
2. **Scientific Reproducibility**: Built-in provenance and version tracking
3. **AI-Enhanced**: Natural language workflow generation
4. **Real-time Control**: Direct hardware device communication
5. **Visual Programming**: Node-based workflow design
6. **Laboratory Integration**: Purpose-built for research automation

This stack is specifically designed for scientific laboratory automation, combining modern web technologies with scientific computing and real-time hardware control capabilities.