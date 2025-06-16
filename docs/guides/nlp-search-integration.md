# NLP-Enhanced Command+P Search Integration

## 🎯 Overview

This integration combines the existing Command+P advanced search functionality with AI-powered natural language workflow generation, providing a seamless experience for users to either search for specific operations or describe entire workflows in English.

## 🚀 Features

### Enhanced Search Panel
- **Dual Mode Operation**: Automatically detects search filters vs natural language
- **Smart UI Adaptation**: Interface changes based on input type
- **Backward Compatibility**: All existing search functionality preserved
- **Keyboard Navigation**: Arrow keys, Enter, Escape, Tab support

### AI Workflow Generation
- **Natural Language Processing**: Convert English descriptions to workflows
- **Canvas Integration**: Generate ReactFlow-compatible JSON
- **Parameter Extraction**: Intelligent parsing of volumes, temperatures, durations
- **Smart Suggestions**: AI recommends missing workflow steps
- **UO Compatibility**: Works with existing CustomUOService

## 📁 File Structure

```
src/
├── components/
│   ├── EnhancedSearchPanel.tsx        # Main enhanced search component
│   ├── EnhancedSearchPanel.css        # Styling for NLP features
│   ├── NLPSearchDemo.tsx              # Demo/test component
│   └── Sidebar.tsx                    # Updated to use enhanced panel
├── services/
│   └── nlpWorkflowService.ts          # AI agent integration service
└── ...

backend/agent_workflow_builder/
├── agent/                             # AI processing modules
├── integration/                       # System integration layer
├── api/                              # FastAPI endpoints
└── ...
```

## 🔧 How It Works

### 1. Input Detection

The system automatically detects input type using smart heuristics:

```typescript
const detectNaturalLanguage = (input: string): boolean => {
  const nlpIndicators = [
    'add', 'mix', 'heat', 'stir', 'wait', 'perform', 'measure',
    'then', 'after', 'before', 'next', 'finally',
    'ml', 'μl', '°c', 'rpm', 'minutes', 'seconds', 'mV/s'
  ];
  
  const hasMultipleWords = input.trim().split(' ').length >= 3;
  const hasNlpIndicators = nlpIndicators.some(indicator => 
    input.toLowerCase().includes(indicator)
  );
  const hasNoFilterSyntax = !input.includes('@');
  
  return hasMultipleWords && hasNlpIndicators && hasNoFilterSyntax;
};
```

### 2. Mode Switching

**Search Mode (Traditional)**:
- Input: `@device:Tecan @format:96-well`
- Shows filtered operation results
- Supports existing filter syntax

**NLP Mode (New)**:
- Input: `Add 10ml water, heat to 60°C for 5 minutes`
- Shows AI workflow generation interface
- Provides generation button and tips

### 3. Workflow Generation

```typescript
const handleGenerateWorkflow = async () => {
  const result = await nlpWorkflowService.generateWorkflow({
    text: searchTerm,
    language: 'en',
    model_type: 'mock',
    include_suggestions: true,
    optimize_layout: true
  });
  
  if (result.success && result.workflow_json) {
    // Validate workflow structure
    const validation = nlpWorkflowService.validateWorkflowStructure(result.workflow_json);
    
    if (validation.valid) {
      // Load into Canvas
      onWorkflowGenerated(result.workflow_json);
    }
  }
};
```

## 🎨 UI Components

### Enhanced Search Panel

The `EnhancedSearchPanel` component provides:

1. **Dynamic Placeholder Text**:
   - Search mode: "Search operations... (@device:Tecan @format:96-well)"
   - NLP mode: "Describe your workflow in English..."

2. **Mode Indicators**:
   - NLP mode shows blue gradient header with robot icon
   - Generate button appears in NLP mode
   - Loading spinner during generation

3. **Smart Help**:
   - Search mode: Shows filter syntax help
   - NLP mode: Shows tips and examples

4. **Interactive Examples**:
   - Click-to-fill example inputs
   - Hover effects and animations

### CSS Styling

```css
/* NLP Mode Indicator */
.nlp-mode-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
}

/* Enhanced Input */
.search-input.nlp-mode {
  border-color: #667eea;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
}

/* Generation Status */
.generating-status {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(102, 126, 234, 0.1);
  padding: 12px 16px;
  border-radius: 6px;
}
```

## 🔗 Integration Points

### Sidebar Integration

```typescript
// Updated Sidebar.tsx
import { EnhancedSearchPanel } from './EnhancedSearchPanel';

const handleWorkflowGenerated = (workflowJson: any) => {
  // Integration with Canvas/ReactFlow context
  // const { setNodes, setEdges } = useReactFlow();
  // setNodes(workflowJson.workflow.nodes);
  // setEdges(workflowJson.workflow.edges);
  
  console.log('AI-generated workflow received:', workflowJson);
};

<EnhancedSearchPanel
  isOpen={isSearchPanelOpen}
  onClose={() => setIsSearchPanelOpen(false)}
  onSelect={handleNodeSelect}
  onWorkflowGenerated={handleWorkflowGenerated}
/>
```

### Canvas Integration

The generated workflow JSON is compatible with existing Canvas structure:

```json
{
  "metadata": {
    "id": "workflow-uuid",
    "name": "AI Generated Workflow",
    "description": "Laboratory workflow generated from natural language"
  },
  "workflow": {
    "nodes": [...],  // ReactFlow nodes
    "edges": [...],  // ReactFlow edges
    "viewport": {"x": 0, "y": 0, "zoom": 1}
  },
  "execution": {
    "status": "draft",
    "total_steps": 3,
    "estimated_duration": 480,
    "required_devices": ["pump", "heater", "potentiostat"]
  }
}
```

## 🧪 Testing

### Start AI Agent Server

```bash
cd backend/agent_workflow_builder
python -m api.workflow_api
```

### Test Examples

**Search Mode Examples**:
- `@device:Tecan @format:96-well`
- `@category:electrochemical @volume:1-100`
- `pipette @device:Hamilton`

**NLP Mode Examples**:
- `Add 15ml NaOH solution, heat to 80°C for 10 minutes, then perform CV test`
- `Mix 5ml water with sample, stir for 2 minutes at 300rpm`
- `Perform LSV test with 50mV/s scan rate, then clean electrodes`

### Demo Page

Open `test-nlp-search.html` for a complete integration test page with:
- Feature overview
- Testing instructions
- Example inputs
- Integration status

## ⚙️ Configuration

### AI Agent Configuration

```typescript
// Configure API endpoint
nlpWorkflowService.setApiBaseUrl('http://localhost:8001');

// Check service health
const isAvailable = await nlpWorkflowService.checkServiceHealth();
```

### Model Configuration

The AI agent supports multiple model types:
- `mock`: For development/testing (no external dependencies)
- `openai`: Requires OPENAI_API_KEY environment variable
- `local`: Requires local LLM model installation

## 🔄 Workflow

1. **User Input**: Press `Cmd/Ctrl + P`
2. **Panel Opens**: Enhanced search panel appears
3. **Input Detection**: System detects search vs NLP mode
4. **Mode Switch**: UI adapts to input type
5. **Generation/Search**: Execute appropriate action
6. **Result Display**: Show results or generated workflow
7. **Integration**: Load into Canvas or select operation

## 🎉 Benefits

- **Seamless Experience**: No mode switching required
- **Backward Compatible**: All existing functionality preserved
- **AI-Powered**: Natural language workflow generation
- **Smart Detection**: Automatic input type recognition
- **Production Ready**: Integrated with existing systems

## 🚧 Future Enhancements

- **Multi-language Support**: Extend beyond English
- **Voice Input**: Speech-to-workflow generation
- **Workflow Templates**: Save and reuse common patterns
- **Advanced Validation**: More sophisticated workflow checking
- **Batch Generation**: Generate multiple workflow variants