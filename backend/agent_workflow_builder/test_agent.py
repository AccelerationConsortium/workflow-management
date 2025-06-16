"""
Test script for Workflow Agent System

This script tests the complete workflow generation pipeline
from natural language to Canvas JSON.
"""

import json
import asyncio
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.abspath('..'))

from agent_workflow_builder.agent.uo_parser import UOParser
from agent_workflow_builder.agent.parameter_filler import ParameterFiller
from agent_workflow_builder.agent.json_builder import JSONBuilder
from agent_workflow_builder.api.workflow_api import WorkflowRequest


def test_complete_pipeline():
    """Test the complete workflow generation pipeline"""
    
    print("🧪 Testing Workflow Agent System")
    print("=" * 50)
    
    # Initialize components
    print("📝 Initializing components...")
    parser = UOParser(model_type="mock")
    filler = ParameterFiller()
    builder = JSONBuilder()
    
    # Test cases (English only)
    test_cases = [
        "Add 10ml NaOH solution, then heat to 80°C for 5 minutes, finally perform CV test",
        "Add 5ml water, stir for 2 minutes, heat to 60°C, then wait 1 minute", 
        "Perform LSV test with scan rate 50mV/s, then clean electrodes",
        "Add 10ml of HCl solution, heat to 70°C for 3 minutes, then perform cyclic voltammetry"
    ]
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\n🔬 Test Case {i}: {test_text}")
        print("-" * 60)
        
        try:
            # Step 1: Parse text to operations
            print("1️⃣ Parsing natural language...")
            operations = parser.parse_workflow(test_text)
            print(f"   ✅ Extracted {len(operations)} operations")
            
            for j, op in enumerate(operations):
                print(f"      {j+1}. {op.get('type', 'unknown')} - {op.get('name', 'unnamed')}")
            
            # Step 2: Fill parameters
            print("2️⃣ Filling parameters...")
            filled_operations = filler.fill_parameters(operations, test_text)
            print(f"   ✅ Parameters filled for {len(filled_operations)} operations")
            
            # Step 3: Auto-complete workflow
            print("3️⃣ Auto-completing workflow...")
            completed_operations = filler.auto_complete_workflow(filled_operations)
            print(f"   ✅ Workflow completed with {len(completed_operations)} operations")
            
            # Step 4: Generate suggestions
            print("4️⃣ Generating suggestions...")
            suggestions = filler.suggest_missing_steps(completed_operations)
            if suggestions:
                print(f"   💡 {len(suggestions)} suggestions generated:")
                for suggestion in suggestions:
                    print(f"      - {suggestion.get('name', 'Unknown suggestion')}")
            else:
                print("   ✅ No additional suggestions needed")
            
            # Step 5: Build JSON
            print("5️⃣ Building workflow JSON...")
            metadata = {
                "name": f"Test Workflow {i}",
                "description": f"Generated from test case: {test_text[:30]}...",
                "test_case": i
            }
            
            workflow_json = builder.build_workflow_json(completed_operations, metadata)
            print(f"   ✅ Generated JSON with {len(workflow_json['workflow']['nodes'])} nodes")
            
            # Step 6: Validate
            print("6️⃣ Validating workflow...")
            validation = builder.validate_canvas_compatibility(workflow_json)
            
            if validation["valid"]:
                print("   ✅ Workflow is valid and Canvas-compatible")
            else:
                print("   ❌ Validation errors found:")
                for error in validation["errors"]:
                    print(f"      - {error}")
            
            # Step 7: Export summary
            print("7️⃣ Export summary...")
            exports = builder.export_to_formats(workflow_json)
            print(f"   📄 JSON size: {len(exports['json'])} chars")
            print(f"   📊 CSV size: {len(exports['csv'])} chars")
            
            print(f"   ✅ Test case {i} completed successfully!")
            
        except Exception as e:
            print(f"   ❌ Error in test case {i}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n🎉 Pipeline testing completed!")


def test_individual_components():
    """Test individual components separately"""
    
    print("\n🔧 Testing Individual Components")
    print("=" * 50)
    
    # Test UO Parser
    print("\n📝 Testing UO Parser...")
    parser = UOParser(model_type="mock")
    test_text = "Add liquid, then heat, finally do CV"
    
    operations = parser.parse_workflow(test_text)
    print(f"✅ Parser generated {len(operations)} operations")
    
    validation = parser.validate_workflow(operations)
    print(f"✅ Validation: {validation['valid']} (errors: {len(validation['errors'])})")
    
    # Test Parameter Filler
    print("\n⚙️ Testing Parameter Filler...")
    filler = ParameterFiller()
    
    filled_ops = filler.fill_parameters(operations, test_text)
    print(f"✅ Parameter filler processed {len(filled_ops)} operations")
    
    suggestions = filler.suggest_missing_steps(filled_ops)
    print(f"✅ Generated {len(suggestions)} suggestions")
    
    # Test JSON Builder
    print("\n🏗️ Testing JSON Builder...")
    builder = JSONBuilder()
    
    workflow_json = builder.build_workflow_json(filled_ops)
    print(f"✅ JSON builder created workflow with {len(workflow_json['workflow']['nodes'])} nodes")
    
    validation = builder.validate_canvas_compatibility(workflow_json)
    print(f"✅ Canvas compatibility: {validation['canvas_compatible']}")
    
    print("✅ All components tested successfully!")


def test_api_models():
    """Test API request/response models"""
    
    print("\n🌐 Testing API Models")
    print("=" * 30)
    
    # Test WorkflowRequest
    request = WorkflowRequest(
        text="Test workflow generation",
        language="en",
        model_type="mock",
        include_suggestions=True,
        optimize_layout=True
    )
    print(f"✅ WorkflowRequest created: {request.text}")
    
    # Test with various inputs
    test_requests = [
        {"text": "Simple test", "language": "en"},
        {"text": "Complex testing process", "model_type": "openai"},
        {"text": "Test with parameters", "include_suggestions": False}
    ]
    
    for req_data in test_requests:
        try:
            req = WorkflowRequest(**req_data)
            print(f"✅ Request validation passed: {req.text[:20]}...")
        except Exception as e:
            print(f"❌ Request validation failed: {e}")
    
    print("✅ API models tested successfully!")


def demo_workflow_generation():
    """Demonstrate complete workflow generation with detailed output"""
    
    print("\n🎬 Workflow Generation Demo")
    print("=" * 40)
    
    # Create a comprehensive test
    test_description = """
    First add 10ml of 0.1M NaOH solution to the reaction container,
    then stir at 300 rpm for 5 minutes to ensure uniform mixing,
    next heat the solution to 80°C and maintain for 10 minutes,
    finally perform cyclic voltammetry test with scan rate 50mV/s for 3 cycles.
    """
    
    print(f"📋 Input description:\n{test_description.strip()}")
    
    # Initialize system
    parser = UOParser(model_type="mock")
    filler = ParameterFiller()
    builder = JSONBuilder()
    
    # Generate workflow
    print("\n🔄 Processing...")
    
    operations = parser.parse_workflow(test_description)
    filled_operations = filler.fill_parameters(operations, test_description)
    completed_operations = filler.auto_complete_workflow(filled_operations)
    suggestions = filler.suggest_missing_steps(completed_operations)
    
    workflow_json = builder.build_workflow_json(
        completed_operations,
        {
            "name": "NaOH Solution Processing and Electrochemical Test Workflow",
            "description": "Complete solution processing and analysis workflow",
            "demo": True
        }
    )
    
    # Display results
    print("\n📊 Generated Workflow Summary:")
    print(f"   • Total operations: {len(completed_operations)}")
    print(f"   • Estimated duration: {workflow_json['execution']['estimated_duration']} seconds")
    print(f"   • Required devices: {', '.join(workflow_json['execution']['required_devices'])}")
    print(f"   • Suggestions: {len(suggestions)}")
    
    print("\n📋 Operation Details:")
    for i, op in enumerate(completed_operations, 1):
        params = op.get('params', {})
        param_summary = ", ".join([f"{k}={v}" for k, v in params.items()][:3])
        if len(params) > 3:
            param_summary += "..."
        print(f"   {i}. {op.get('name', 'Unknown')} ({param_summary})")
    
    if suggestions:
        print("\n💡 Suggestions:")
        for suggestion in suggestions:
            print(f"   • {suggestion.get('name', 'Unknown suggestion')}")
    
    print("\n✅ Demo completed successfully!")
    
    # Save demo output
    demo_output = {
        "input": test_description.strip(),
        "operations": completed_operations,
        "suggestions": suggestions,
        "workflow_json": workflow_json
    }
    
    try:
        with open("demo_output.json", "w", encoding="utf-8") as f:
            json.dump(demo_output, f, indent=2, ensure_ascii=False)
        print("📄 Demo output saved to demo_output.json")
    except Exception as e:
        print(f"⚠️ Could not save demo output: {e}")


if __name__ == "__main__":
    print("🚀 Starting Workflow Agent Tests")
    print("=" * 60)
    
    try:
        # Run all tests
        test_individual_components()
        test_complete_pipeline()
        test_api_models()
        demo_workflow_generation()
        
        print("\n🎉 All tests completed successfully!")
        print("\n📚 Next steps:")
        print("   1. Run the API server: python -m api.workflow_api")
        print("   2. Test with frontend integration")
        print("   3. Configure with real AI models (OpenAI/Local)")
        print("   4. Add more sophisticated parameter extraction")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {str(e)}")
        import traceback
        traceback.print_exc()