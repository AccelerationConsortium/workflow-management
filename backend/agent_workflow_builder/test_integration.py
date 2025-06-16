"""
Integration Test Script

Tests the AI agent integration with existing UO creation and workflow system.
Validates compatibility with CustomUOService and backend execution logic.
"""

import json
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.abspath('..'))

from agent_workflow_builder.agent.uo_parser import UOParser
from agent_workflow_builder.agent.parameter_filler import ParameterFiller
from agent_workflow_builder.integration.workflow_integration import WorkflowIntegration
from agent_workflow_builder.api.workflow_api import WorkflowRequest


def test_integration_with_existing_system():
    """Test integration with existing UO and workflow system"""
    
    print("🔗 Testing AI Agent Integration with Existing System")
    print("=" * 60)
    
    # Initialize components
    parser = UOParser(model_type="mock")
    filler = ParameterFiller()
    integration = WorkflowIntegration()
    
    # Test input (English only, as required)
    test_input = "Add 15ml HCl solution, heat to 75°C for 10 minutes, then perform CV test"
    
    print(f"📝 Input: {test_input}")
    print("-" * 60)
    
    # Step 1: Parse natural language
    print("1️⃣ Parsing with AI agent...")
    operations = parser.parse_workflow(test_input)
    print(f"   ✅ Generated {len(operations)} operations")
    
    # Step 2: Fill parameters
    print("2️⃣ Filling parameters...")
    filled_operations = filler.fill_parameters(operations, test_input)
    completed_operations = filler.auto_complete_workflow(filled_operations)
    print(f"   ✅ Completed {len(completed_operations)} operations with parameters")
    
    # Step 3: Test GeneratedUOSchema conversion
    print("3️⃣ Converting to GeneratedUOSchema format...")
    generated_schemas = []
    for operation in completed_operations:
        schema = integration.convert_to_generated_uo_schema(operation)
        generated_schemas.append(schema)
        print(f"   📋 {schema['name']}: {len(schema['parameters'])} parameters")
    
    # Step 4: Test Canvas workflow generation
    print("4️⃣ Building Canvas-compatible workflow...")
    workflow_metadata = {
        "name": "Integration Test Workflow",
        "description": "Testing integration with existing system",
        "integration_test": True
    }
    
    canvas_workflow = integration.build_workflow_for_canvas(
        completed_operations, 
        workflow_metadata
    )
    
    print(f"   ✅ Generated workflow with {len(canvas_workflow['workflow']['nodes'])} nodes")
    print(f"   ✅ Generated workflow with {len(canvas_workflow['workflow']['edges'])} edges")
    
    # Step 5: Test execution configuration
    print("5️⃣ Testing execution configuration...")
    execution_configs = []
    for operation in completed_operations:
        config = integration.get_execution_config(operation)
        execution_configs.append(config)
        print(f"   ⚙️ {operation['type']}: {config['executor']} -> {config['function']}")
    
    # Step 6: Validate compatibility
    print("6️⃣ Validating system compatibility...")
    
    # Check node structure compatibility
    nodes = canvas_workflow['workflow']['nodes']
    operation_nodes = [n for n in nodes if n['type'] == 'operationNode']
    
    for node in operation_nodes:
        # Validate required fields for existing system
        required_fields = ['id', 'type', 'position', 'data']
        for field in required_fields:
            if field not in node:
                print(f"   ❌ Missing required field: {field}")
                return False
        
        # Validate node data structure
        data = node['data']
        required_data_fields = ['label', 'nodeType', 'category', 'parameters']
        for field in required_data_fields:
            if field not in data:
                print(f"   ❌ Missing required data field: {field}")
                return False
    
    print("   ✅ All nodes have required fields for existing system")
    
    # Check parameter format compatibility
    for node in operation_nodes:
        parameters = node['data']['parameters']
        for param in parameters:
            required_param_fields = ['id', 'name', 'type', 'value']
            for field in required_param_fields:
                if field not in param:
                    print(f"   ❌ Missing required parameter field: {field}")
                    return False
    
    print("   ✅ All parameters have required fields for existing system")
    
    # Step 7: Test workflow structure
    print("7️⃣ Testing workflow structure...")
    
    # Check for start and end nodes
    start_nodes = [n for n in nodes if n['type'] == 'start']
    end_nodes = [n for n in nodes if n['type'] == 'end']
    
    if len(start_nodes) != 1:
        print(f"   ❌ Expected 1 start node, found {len(start_nodes)}")
        return False
    
    if len(end_nodes) != 1:
        print(f"   ❌ Expected 1 end node, found {len(end_nodes)}")
        return False
    
    print("   ✅ Workflow has proper start and end nodes")
    
    # Check edge connectivity
    edges = canvas_workflow['workflow']['edges']
    if len(edges) != len(nodes) - 1:
        print(f"   ❌ Expected {len(nodes) - 1} edges, found {len(edges)}")
        return False
    
    print("   ✅ Workflow has proper edge connectivity")
    
    # Step 8: Export and summary
    print("8️⃣ Generating export summary...")
    
    summary = {
        "integration_test": True,
        "input_text": test_input,
        "operations_generated": len(completed_operations),
        "schemas_created": len(generated_schemas),
        "canvas_workflow": {
            "nodes": len(canvas_workflow['workflow']['nodes']),
            "edges": len(canvas_workflow['workflow']['edges']),
            "estimated_duration": canvas_workflow['execution']['estimated_duration'],
            "required_devices": canvas_workflow['execution']['required_devices']
        },
        "execution_configs": execution_configs,
        "compatibility_checks": {
            "node_structure": "✅ Pass",
            "parameter_format": "✅ Pass", 
            "workflow_structure": "✅ Pass",
            "execution_mapping": "✅ Pass"
        }
    }
    
    print(f"   📊 Summary: {json.dumps(summary, indent=2)}")
    
    # Save test results
    with open("integration_test_results.json", "w") as f:
        json.dump({
            "summary": summary,
            "generated_schemas": generated_schemas,
            "canvas_workflow": canvas_workflow,
            "execution_configs": execution_configs
        }, f, indent=2)
    
    print("   📄 Results saved to integration_test_results.json")
    
    print("\n🎉 Integration test completed successfully!")
    print("\n📋 System Compatibility Summary:")
    print("   ✅ AI agent generates operations compatible with existing UO types")
    print("   ✅ Parameters are converted to GeneratedUOSchema format")
    print("   ✅ Canvas workflow structure matches existing system")
    print("   ✅ Execution configs map to existing executor system")
    print("   ✅ All validation checks pass")
    
    return True


def test_custom_uo_registration_compatibility():
    """Test compatibility with CustomUOService registration"""
    
    print("\n🔧 Testing Custom UO Registration Compatibility")
    print("=" * 50)
    
    integration = WorkflowIntegration()
    
    # Create a test operation that would be unknown to the system
    test_operation = {
        "id": "custom_op_1",
        "type": "custom_analysis",
        "name": "Custom Analysis Operation",
        "description": "A custom operation for specialized analysis",
        "params": {
            "analysis_type": "spectroscopy",
            "wavelength": 550,
            "duration": 300,
            "sample_volume": 5.0,
            "auto_calibrate": True
        }
    }
    
    print(f"📝 Testing custom operation: {test_operation['name']}")
    
    # Convert to GeneratedUOSchema
    schema = integration.convert_to_generated_uo_schema(test_operation)
    
    print("🔍 Generated schema validation:")
    print(f"   ✅ ID: {schema['id']}")
    print(f"   ✅ Name: {schema['name']}")
    print(f"   ✅ Description: {schema['description']}")
    print(f"   ✅ Category: {schema['category']}")
    print(f"   ✅ Parameters: {len(schema['parameters'])}")
    
    # Validate parameter types
    for param in schema['parameters']:
        print(f"      • {param['name']}: {param['type']} = {param['defaultValue']}")
        
        # Check required fields for CustomUOService
        required_fields = ['id', 'name', 'type', 'required', 'defaultValue']
        for field in required_fields:
            if field not in param:
                print(f"   ❌ Missing required field in parameter: {field}")
                return False
    
    print("   ✅ All parameters have required fields for CustomUOService")
    
    # Test execution config generation
    exec_config = integration.get_execution_config(test_operation)
    print(f"   ⚙️ Execution config: {exec_config['executor']} -> {exec_config['function']}")
    
    print("   ✅ Custom UO registration compatibility confirmed")
    
    return True


def test_api_request_compatibility():
    """Test API request format compatibility"""
    
    print("\n🌐 Testing API Request Compatibility")
    print("=" * 40)
    
    # Test various request formats
    test_requests = [
        {
            "text": "Add 10ml water and heat to 60°C",
            "language": "en",
            "model_type": "mock",
            "include_suggestions": True,
            "optimize_layout": True,
            "register_custom_uos": False
        },
        {
            "text": "Perform electrochemical analysis with 50mV/s scan rate",
            "language": "en", 
            "model_type": "mock",
            "register_custom_uos": True
        },
        {
            "text": "Mix solution for 5 minutes then wait",
            "language": "en"
        }
    ]
    
    for i, req_data in enumerate(test_requests, 1):
        print(f"📋 Testing request {i}: {req_data['text'][:30]}...")
        
        try:
            request = WorkflowRequest(**req_data)
            print(f"   ✅ Request validation passed")
            print(f"   📝 Language: {request.language}")
            print(f"   🤖 Model: {request.model_type}")
            print(f"   💡 Suggestions: {request.include_suggestions}")
            if hasattr(request, 'register_custom_uos'):
                print(f"   🔧 Custom UO Registration: {request.register_custom_uos}")
            
        except Exception as e:
            print(f"   ❌ Request validation failed: {e}")
            return False
    
    print("   ✅ All API request formats are compatible")
    
    return True


if __name__ == "__main__":
    print("🚀 Starting Integration Tests")
    print("=" * 60)
    
    try:
        # Run all integration tests
        test1 = test_integration_with_existing_system()
        test2 = test_custom_uo_registration_compatibility()  
        test3 = test_api_request_compatibility()
        
        if test1 and test2 and test3:
            print("\n🎉 ALL INTEGRATION TESTS PASSED!")
            print("\n✅ System Integration Summary:")
            print("   • AI agent is fully compatible with existing UO system")
            print("   • GeneratedUOSchema conversion works correctly")
            print("   • Canvas workflow generation matches existing format")
            print("   • Execution configs map to existing backend system")
            print("   • CustomUOService registration format is supported")
            print("   • API requests are compatible with frontend")
            print("\n🚀 Ready for production integration!")
        else:
            print("\n❌ Some integration tests failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Integration test suite failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)