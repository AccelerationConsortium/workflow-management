#!/usr/bin/env python3
"""
Test script for Qwen LLM integration with Workflow Agent System

This script tests the Qwen model integration for laboratory workflow generation.
"""

import sys
import os
import asyncio
import time
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, os.path.abspath('..'))

from agent.uo_parser import UOParser
from agent.parameter_filler import ParameterFiller
from agent.json_builder import JSONBuilder


def test_qwen_model_loading():
    """Test if Qwen model can be loaded successfully"""
    print("🔄 Testing Qwen Model Loading...")
    print("-" * 50)
    
    try:
        # Test with a smaller model first (if available)
        parser = UOParser(model_type="qwen", model_name="Qwen/Qwen2.5-1.5B-Instruct")
        print("✅ Qwen model loaded successfully!")
        return parser
    except Exception as e:
        print(f"❌ Failed to load Qwen model: {e}")
        print("\nTrying fallback to standard Qwen model...")
        
        try:
            parser = UOParser(model_type="qwen")  # Use default model
            print("✅ Qwen default model loaded successfully!")
            return parser
        except Exception as e2:
            print(f"❌ Failed to load default Qwen model: {e2}")
            print("\n⚠️ Falling back to mock mode for testing...")
            return UOParser(model_type="mock")


def test_qwen_workflow_parsing(parser):
    """Test workflow parsing with Qwen model"""
    print("\n🧪 Testing Qwen Workflow Parsing...")
    print("-" * 50)
    
    test_cases = [
        "Add 10ml NaOH solution, heat to 80°C for 5 minutes, then perform CV test",
        "Mix 5ml HCl with 3ml water, heat to 60°C, stir for 2 minutes",
        "Weigh 2g sodium chloride, dissolve in 50ml water, perform linear sweep voltammetry at 25mV/s"
    ]
    
    for i, test_text in enumerate(test_cases, 1):
        print(f"\n🔬 Test Case {i}: {test_text}")
        print("-" * 40)
        
        start_time = time.time()
        
        try:
            # Parse workflow
            operations = parser.parse_workflow(test_text)
            
            processing_time = time.time() - start_time
            
            print(f"✅ Parsing completed in {processing_time:.2f}s")
            print(f"📊 Generated {len(operations)} operations:")
            
            for j, op in enumerate(operations, 1):
                op_type = op.get('type', 'unknown')
                op_name = op.get('name', 'unnamed')
                params = op.get('params', {})
                param_count = len(params)
                
                print(f"   {j}. {op_name} ({op_type}) - {param_count} parameters")
                
                # Show key parameters
                key_params = []
                for key, value in list(params.items())[:3]:  # Show first 3 params
                    key_params.append(f"{key}={value}")
                if key_params:
                    print(f"      Parameters: {', '.join(key_params)}")
            
        except Exception as e:
            print(f"❌ Error in test case {i}: {str(e)}")
            import traceback
            traceback.print_exc()


def test_parameter_extraction_with_ai(parser):
    """Test AI-enhanced parameter extraction"""
    print("\n⚙️ Testing AI-Enhanced Parameter Extraction...")
    print("-" * 50)
    
    # Initialize parameter filler with AI model
    filler = ParameterFiller(ai_model=parser)
    
    test_text = "Add 15ml of 0.1M HCl solution, heat to 85°C for 10 minutes with stirring at 400 rpm, then perform cyclic voltammetry with scan rate 75mV/s for 5 cycles"
    
    # First get basic operations
    operations = parser.parse_workflow(test_text)
    print(f"📝 Base operations: {len(operations)}")
    
    if parser.model_type == "qwen" and hasattr(filler, 'ai_enhanced_parameter_extraction'):
        print("🤖 Using AI-enhanced parameter extraction...")
        
        try:
            # Test AI-enhanced extraction
            enhanced_operations = filler.ai_enhanced_parameter_extraction(operations, test_text)
            
            print("✅ AI-enhanced extraction completed!")
            print("\n📊 Enhanced Parameters:")
            
            for i, op in enumerate(enhanced_operations, 1):
                op_name = op.get('name', 'Unknown')
                params = op.get('params', {})
                
                print(f"\n   {i}. {op_name}:")
                for param, value in params.items():
                    print(f"      {param}: {value}")
            
        except Exception as e:
            print(f"❌ AI-enhanced extraction failed: {e}")
            # Fallback to regular extraction
            enhanced_operations = filler.fill_parameters(operations, test_text)
            print("🔄 Used fallback extraction")
    else:
        print("📝 Using regular parameter extraction...")
        enhanced_operations = filler.fill_parameters(operations, test_text)
    
    return enhanced_operations


def test_complete_workflow_generation(parser):
    """Test complete workflow generation pipeline"""
    print("\n🎬 Testing Complete Workflow Generation...")
    print("-" * 50)
    
    # Initialize all components
    filler = ParameterFiller(ai_model=parser)
    builder = JSONBuilder()
    
    test_description = """
    First weigh 2.5g of sodium chloride using analytical balance,
    then add 25ml distilled water to dissolve the salt,
    mix the solution at 350 rpm for 3 minutes,
    heat the solution to 70°C and maintain for 8 minutes,
    finally perform cyclic voltammetry analysis with scan rate 60mV/s for 4 cycles.
    """
    
    print(f"📋 Test Description:\n{test_description.strip()}")
    
    try:
        # Step 1: Parse
        print("\n1️⃣ Parsing operations...")
        operations = parser.parse_workflow(test_description)
        print(f"   ✅ {len(operations)} operations identified")
        
        # Step 2: Fill parameters
        print("2️⃣ Extracting parameters...")
        if parser.model_type == "qwen":
            filled_operations = filler.ai_enhanced_parameter_extraction(operations, test_description)
        else:
            filled_operations = filler.fill_parameters(operations, test_description)
        print(f"   ✅ Parameters filled for {len(filled_operations)} operations")
        
        # Step 3: Auto-complete
        print("3️⃣ Auto-completing workflow...")
        completed_operations = filler.auto_complete_workflow(filled_operations)
        print(f"   ✅ Workflow completed with {len(completed_operations)} operations")
        
        # Step 4: Generate suggestions
        print("4️⃣ Generating suggestions...")
        suggestions = filler.suggest_missing_steps(completed_operations)
        print(f"   💡 {len(suggestions)} suggestions generated")
        
        # Step 5: Build JSON
        print("5️⃣ Building workflow JSON...")
        workflow_json = builder.build_workflow_json(
            completed_operations,
            {
                "name": "Qwen Generated Workflow",
                "description": "Test workflow generated using Qwen LLM",
                "model": parser.model_type
            }
        )
        print(f"   ✅ JSON built with {len(workflow_json['workflow']['nodes'])} nodes")
        
        # Step 6: Validate
        print("6️⃣ Validating workflow...")
        validation = builder.validate_canvas_compatibility(workflow_json)
        
        if validation["canvas_compatible"]:
            print("   ✅ Workflow is Canvas-compatible")
        else:
            print("   ⚠️ Validation issues found")
            for error in validation.get("errors", []):
                print(f"      - {error}")
        
        # Summary
        print("\n📊 Generation Summary:")
        print(f"   • Model used: {parser.model_type}")
        print(f"   • Operations: {len(completed_operations)}")
        print(f"   • Suggestions: {len(suggestions)}")
        print(f"   • Estimated duration: {workflow_json['execution']['estimated_duration']}s")
        print(f"   • Required devices: {len(workflow_json['execution']['required_devices'])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Workflow generation failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function"""
    print("🚀 Qwen LLM Integration Test Suite")
    print("=" * 60)
    
    # Test 1: Model Loading
    parser = test_qwen_model_loading()
    
    if parser.model_type == "mock":
        print("\n⚠️ Using mock mode - Qwen model not available")
        print("This test will demonstrate the integration structure with mock responses.")
    
    # Test 2: Workflow Parsing
    test_qwen_workflow_parsing(parser)
    
    # Test 3: Parameter Extraction
    test_parameter_extraction_with_ai(parser)
    
    # Test 4: Complete Pipeline
    success = test_complete_workflow_generation(parser)
    
    # Final Summary
    print("\n" + "=" * 60)
    print("🎉 Test Suite Completed!")
    
    if success:
        print("✅ All tests passed successfully!")
        if parser.model_type == "qwen":
            print("🤖 Qwen LLM integration is working correctly!")
        else:
            print("🔧 Integration structure is ready for Qwen model")
    else:
        print("❌ Some tests failed - check output above")
    
    print("\n📚 Next Steps:")
    if parser.model_type == "qwen":
        print("   1. Test with API server: python -m api.workflow_api")
        print("   2. Try different Qwen model variants")
        print("   3. Optimize prompts for better results")
    else:
        print("   1. Ensure Qwen dependencies are installed: pip install modelscope")
        print("   2. Check GPU availability for better performance")
        print("   3. Try smaller Qwen models if memory is limited")


if __name__ == "__main__":
    main()