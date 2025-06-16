#!/usr/bin/env python3
"""
Start AI Agent Server

Simple script to start the AI workflow generation server
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    print("🤖 Starting AI Workflow Agent Server")
    print("=" * 50)
    
    # Check if we're in the right directory
    agent_dir = Path(__file__).parent / "backend" / "agent_workflow_builder"
    
    if not agent_dir.exists():
        print("❌ Agent directory not found!")
        print(f"Expected: {agent_dir}")
        print("Make sure you're running this from the project root directory.")
        sys.exit(1)
    
    # Change to agent directory
    os.chdir(agent_dir)
    print(f"📁 Changed to directory: {agent_dir}")
    
    # Check if required files exist
    required_files = [
        "api/workflow_api.py",
        "agent/uo_parser.py",
        "agent/parameter_filler.py",
        "agent/json_builder.py",
        "integration/workflow_integration.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        sys.exit(1)
    
    print("✅ All required files found")
    
    # Try to start the server
    try:
        print("\n🚀 Starting server on http://localhost:8001")
        print("Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Start with Python module syntax to avoid import issues
        result = subprocess.run([
            sys.executable, "-c",
            """
import sys
sys.path.insert(0, '.')
from api.workflow_api import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8001)
            """
        ], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        print("\n💡 Trying alternative startup method...")
        
        # Alternative: direct uvicorn command
        try:
            subprocess.run([
                "uvicorn", "api.workflow_api:app",
                "--host", "0.0.0.0",
                "--port", "8001",
                "--reload"
            ], check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Alternative startup failed")
            print("\n🔧 Manual startup instructions:")
            print("1. cd backend/agent_workflow_builder")
            print("2. python -c \"from api.workflow_api import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8001)\"")
            print("\n📝 Or install uvicorn and run:")
            print("pip install uvicorn")
            print("uvicorn api.workflow_api:app --host 0.0.0.0 --port 8001")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    main()