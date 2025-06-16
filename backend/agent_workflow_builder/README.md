# AI Workflow Agent System

🤖 **AI-powered workflow generation system that converts English natural language descriptions into Canvas-compatible laboratory workflow JSON, fully integrated with existing UO creation and execution systems.**

## 🚀 Features

- **Natural Language Processing**: Convert English descriptions into structured workflows
- **Existing System Integration**: Compatible with CustomUOService and existing UO registration
- **Intelligent Parameter Extraction**: Automatically extract volumes, temperatures, durations from text
- **Smart Suggestions**: AI suggests missing steps and optimizations
- **Canvas Integration**: Generates ReactFlow-compatible JSON using existing node/edge structure
- **Backend Execution**: Maps to existing executor system (python_executor, sdl_catalyst_executor)
- **Multiple AI Models**: Supports OpenAI, local models, and mock mode for development
- **REST API**: Complete FastAPI server with comprehensive endpoints

## 📁 Project Structure

```
backend/agent_workflow_builder/
├── agent/                    # Core AI processing modules
│   ├── uo_parser.py         # Natural language → Unit Operations
│   ├── parameter_filler.py  # Intelligent parameter extraction
│   └── json_builder.py      # Canvas JSON generation
├── integration/             # System integration layer
│   └── workflow_integration.py # Integration with existing UO/Canvas system
├── api/                     # REST API server
│   └── workflow_api.py      # FastAPI endpoints with integration
├── registry/                # Templates and configurations
│   └── uo_templates.json    # Unit operation templates
├── prompts/                 # AI prompts
│   └── workflow_prompt.txt  # System prompt for AI models
├── test_agent.py           # Comprehensive test suite
├── test_integration.py     # Integration compatibility tests
└── README.md               # This documentation
```

## 🧪 Supported Unit Operations

- **Liquid Handling**: add_liquid, transfer, wash
- **Temperature Control**: heat with precise temperature/duration
- **Electrochemical**: cv (Cyclic Voltammetry), lsv (Linear Sweep), ocv (Open Circuit)
- **Mixing**: stir with speed/duration control
- **Timing**: wait with custom messages
- **More**: Extensible template system for new operations

## 🎯 Usage Examples

### Natural Language Input →  Structured Workflow

**Input (English only):**
```
Add 15ml HCl solution, heat to 75°C for 10 minutes, then perform CV test
```

**Generated Workflow:**
- ✅ Add 15ml HCl solution (python_executor)
- ✅ Heat to 75°C for 10 minutes (python_executor)
- ✅ Perform cyclic voltammetry test (sdl_catalyst_executor)
- 💡 **AI Suggestions**: Stir for mixing, Electrode equilibration

**Generated Output**: 
- Canvas-compatible JSON with proper node/edge structure
- GeneratedUOSchema format for CustomUOService integration
- Execution configs mapping to existing backend executors

## 🛠️ Quick Start

### 1. Run Tests
```bash
cd backend/agent_workflow_builder

# Run core functionality tests
python test_agent.py

# Run integration compatibility tests
python test_integration.py
```

### 2. Start API Server
```bash
cd backend
python -m agent_workflow_builder.api.workflow_api
```

### 3. Test API
```bash
# Health check
curl http://localhost:8001/health

# Generate workflow with integration
curl -X POST http://localhost:8001/generate-workflow \\
  -H "Content-Type: application/json" \\
  -d '{"text": "heat to 80°C then do CV test", "language": "en", "register_custom_uos": true}'
```

### 4. Access API Documentation
Open browser: `http://localhost:8001/docs`

## 🔧 Configuration

### AI Model Types

1. **Mock Mode** (Default - No setup required)
   - Perfect for development and testing
   - Uses keyword-based parsing
   - Always available

2. **OpenAI Mode**
   ```bash
   export OPENAI_API_KEY="your-api-key"
   ```

3. **Local Model Mode**
   ```bash
   pip install transformers torch
   ```

### Environment Variables
```bash
export OPENAI_API_KEY="sk-..."          # For OpenAI mode
export MODEL_TYPE="mock"                # mock/openai/local
export API_PORT="8001"                  # API server port
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/generate-workflow` | POST | Convert text → workflow JSON |
| `/validate-workflow` | POST | Validate workflow structure |
| `/templates` | GET | Get available UO templates |
| `/export-workflow` | POST | Export to different formats |
| `/config` | GET | Get current configuration |
| `/docs` | GET | Interactive API documentation |

## 🧬 Example API Request/Response

**Request:**
```json
{
  "text": "Add 10ml water, heat to 60°C, then do CV",
  "language": "en",
  "model_type": "mock",
  "include_suggestions": true,
  "optimize_layout": true,
  "register_custom_uos": false
}
```

**Response:**
```json
{
  "success": true,
  "workflow_json": {
    "metadata": {
      "id": "workflow-uuid",
      "name": "AI Generated Workflow",
      "description": "Laboratory workflow generated from natural language"
    },
    "workflow": {
      "nodes": [...],
      "edges": [...],
      "viewport": {"x": 0, "y": 0, "zoom": 1}
    },
    "execution": {
      "status": "draft",
      "total_steps": 3,
      "estimated_duration": 480,
      "required_devices": ["pump", "heater", "potentiostat"]
    }
  },
  "suggestions": [
    {
      "type": "stir",
      "name": "Suggestion: Stir for mixing",
      "description": "Suggest stirring after liquid addition"
    }
  ],
  "metadata": {
    "custom_uo_schemas": [...],
    "execution_configs": [...]
  },
  "processing_time": 0.15
}
```

## 🔄 System Integration

### Frontend Integration
The generated JSON is directly compatible with existing Canvas system:

```typescript
import { useReactFlow } from 'reactflow';
import { customUOService } from '../services/customUOService';

const loadAIWorkflow = (workflowResponse: any) => {
  const { setNodes, setEdges } = useReactFlow();
  
  // Load workflow into Canvas
  setNodes(workflowResponse.workflow_json.workflow.nodes);
  setEdges(workflowResponse.workflow_json.workflow.edges);
  
  // Register any custom UOs
  if (workflowResponse.metadata?.custom_uo_schemas) {
    workflowResponse.metadata.custom_uo_schemas.forEach(schema => {
      customUOService.registerUO(schema);
    });
  }
};
```

### Backend Integration
Execution configs map directly to existing executors:

```python
# The AI agent generates execution configs like:
{
  "executor": "sdl_catalyst_executor",
  "function": "cv", 
  "parameters": {"scan_rate": 50, "cycles": 3},
  "operation_id": "step_1"
}

# Which can be executed by existing backend:
from backend.executors.sdl_catalyst_executor import SDLCatalystExecutor
executor = SDLCatalystExecutor()
result = executor.execute("cv", parameters)
```

## 🎨 Customization

### Adding New Unit Operations

1. **Update Template Registry** (`registry/uo_templates.json`):
```json
{
  "templates": {
    "your_new_operation": {
      "name": "Your Operation",
      "category": "your_category",
      "params": {
        "param1": {"type": "number", "unit": "ml", "default": 10}
      }
    }
  }
}
```

2. **Add Parser Keywords** (`agent/uo_parser.py`):
```python
if any(keyword in user_input.lower() for keyword in ["your", "keywords"]):
    operations.append({
        "type": "your_new_operation",
        "name": "Your Operation Name"
    })
```

3. **Update Parameter Rules** (`agent/parameter_filler.py`):
```python
# Add extraction patterns for your parameters
```

## 🚨 Troubleshooting

**Import Errors:**
- Ensure you're running from the correct directory
- Check that all `__init__.py` files exist

**Integration Issues:**
- Run integration tests: `python test_integration.py`
- Verify existing UO templates are loaded
- Check CustomUOService compatibility

**API Connection Issues:**
- Verify server is running on correct port
- Check firewall settings
- Use full URLs in requests

**Parsing Issues:**
- Use English input only (Chinese support removed)
- Start with mock mode for testing
- Check template definitions

## 🔄 Next Steps

1. **Production Deployment**: Deploy API server alongside existing backend
2. **Frontend Integration**: Add AI workflow generation button to Canvas UI
3. **Real AI Models**: Configure OpenAI API key for production use
4. **Custom UO Enhancement**: Expand custom UO registration capabilities
5. **Advanced Parsing**: Add support for more complex experimental procedures
6. **Workflow Optimization**: Add AI-powered workflow optimization suggestions

---

## ✅ System Status

🎉 **All components successfully tested and integrated:**

- ✅ UO Parser (English Natural Language → Operations)
- ✅ Parameter Filler (Intelligent parameter extraction)  
- ✅ Integration Layer (CustomUOService compatibility)
- ✅ Canvas Workflow Builder (Existing system format)
- ✅ Backend Execution Mapping (python_executor, sdl_catalyst_executor)
- ✅ FastAPI Server (RESTful endpoints with integration)
- ✅ Comprehensive test suite + Integration tests
- ✅ Mock mode for development
- ✅ API documentation
- ✅ GeneratedUOSchema support

**Fully integrated and ready for production!** 🚀

### Integration Test Results:
```
✅ AI agent generates operations compatible with existing UO types
✅ Parameters are converted to GeneratedUOSchema format  
✅ Canvas workflow structure matches existing system
✅ Execution configs map to existing executor system
✅ CustomUOService registration format is supported
✅ API requests are compatible with frontend
```