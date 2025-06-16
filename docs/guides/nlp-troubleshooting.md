# NLP Enhanced Search Troubleshooting Guide

## 🚨 Connection Refused Error Fix

### Problem
When clicking "Generate Workflow", you see:
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
NLP Workflow generation error: TypeError: Failed to fetch
```

### Root Cause
The AI agent server at `http://localhost:8001` is not running.

## 🛠️ Solutions

### Solution 1: Automatic Mock Fallback (Recommended for Testing)

**✅ This is now implemented automatically!**

The system will automatically use a local mock server when the AI agent server is unavailable. You'll see:
- "📝 Mock Mode" indicator in the NLP panel
- "Using local mock server to generate workflow..." during generation
- Fully functional workflow generation without external dependencies

**No action needed** - the system works out of the box!

### Solution 2: Start the AI Agent Server

#### Option A: Using the Start Script
```bash
# From project root directory
python start-ai-agent.py
```

#### Option B: Manual Startup
```bash
cd backend/agent_workflow_builder

# Method 1: Direct Python execution
python -c "from api.workflow_api import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8001)"

# Method 2: If uvicorn is installed globally
uvicorn api.workflow_api:app --host 0.0.0.0 --port 8001 --reload
```

#### Option C: Install Dependencies and Run
```bash
# Install FastAPI and Uvicorn if not installed
pip install fastapi uvicorn

# Start the server
cd backend/agent_workflow_builder
uvicorn api.workflow_api:app --host 0.0.0.0 --port 8001
```

## 🔧 Import Error Fixes

If you see import errors when starting the server:

### Fix 1: Python Path Issues
```bash
cd backend/agent_workflow_builder
export PYTHONPATH=$PWD:$PYTHONPATH
python -m api.workflow_api
```

### Fix 2: Direct Execution
```bash
cd backend/agent_workflow_builder
python -c "
import sys
sys.path.insert(0, '.')
from api.workflow_api import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8001)
"
```

## 🎯 Quick Test

### Test Mock Mode (No Server Required)
1. Open the React application
2. Press `Cmd/Ctrl + P`
3. Type: `Add 10ml water, heat to 60°C for 5 minutes`
4. Click "Generate Workflow"
5. You should see "📝 Mock Mode" and successful generation

### Test Real Server Mode
1. Start the AI agent server (see solutions above)
2. Open the React application
3. Press `Cmd/Ctrl + P`
4. Type: `Add 10ml water, heat to 60°C for 5 minutes`
5. Click "Generate Workflow"
6. You should see "🤖 AI Workflow Mode" (without Mock Mode indicator)

## 🔍 Debugging

### Check Server Status
```bash
# Test if server is running
curl http://localhost:8001/health

# Should return:
# {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

### Check Browser Console
Open browser developer tools and look for:
- ✅ `Successfully connected to AI agent server` (real server)
- ⚠️ `AI agent server not available, will use mock fallback` (mock mode)
- ❌ Network errors or fetch failures

### Check Available Endpoints
```bash
# List all available endpoints
curl http://localhost:8001/

# Test workflow generation directly
curl -X POST http://localhost:8001/generate-workflow \
  -H "Content-Type: application/json" \
  -d '{"text": "Add 10ml water and heat to 60°C", "language": "en"}'
```

## 📋 Feature Comparison

| Feature | Mock Mode | Real Server Mode |
|---------|-----------|------------------|
| **Natural Language Processing** | ✅ Basic keyword detection | ✅ Advanced AI parsing |
| **Parameter Extraction** | ✅ Regex-based | ✅ Intelligent extraction |
| **Workflow Generation** | ✅ Template-based | ✅ AI-powered |
| **Canvas Integration** | ✅ Full compatibility | ✅ Full compatibility |
| **Speed** | ⚡ Instant | 🕐 1-3 seconds |
| **Dependencies** | ❌ None required | 📦 FastAPI, AI models |
| **Accuracy** | 📊 Good for common patterns | 🎯 Excellent for complex descriptions |

## 🎨 Visual Indicators

### Mock Mode
- Header shows: `🤖 AI Workflow Mode 📝 Mock Mode`
- Status: "Using local mock server to generate workflow..."
- Works offline and without external dependencies

### Real Server Mode  
- Header shows: `🤖 AI Workflow Mode`
- Status: "Analyzing your description and generating workflow..."
- Requires AI agent server running

## 🚀 Recommended Workflow

### For Development/Testing
1. Use **Mock Mode** (automatic fallback)
2. No setup required
3. Test all UI features and integration
4. Perfect for frontend development

### For Production/Advanced Features
1. Start the AI agent server
2. Configure with OpenAI API key for best results
3. Use for complex workflow generation
4. Better parameter extraction and suggestions

## 📞 Support

### Common Issues
1. **"Mock Mode" always showing**: Server isn't running - this is expected and fine for testing
2. **Generation fails in Mock Mode**: Check browser console for JavaScript errors
3. **Server won't start**: Check Python dependencies and port availability
4. **Import errors**: Use the direct execution methods above

### Quick Fixes
```bash
# Kill any process using port 8001
lsof -ti:8001 | xargs kill -9

# Restart with clean environment
cd backend/agent_workflow_builder
python -c "from api.workflow_api import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8001)"
```

---

## ✅ Summary

The NLP enhanced search now includes **automatic fallback to mock mode**, so it works perfectly even when the AI agent server is not available. This ensures a smooth user experience for testing and development while providing the option to use the full AI capabilities when the server is running.