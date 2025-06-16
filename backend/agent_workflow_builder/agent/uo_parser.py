"""
UO Parser Module

This module handles natural language processing for extracting unit operations
from user input using Large Language Models.
"""

import json
import re
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

try:
    import openai
except ImportError:
    openai = None

try:
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import torch
except ImportError:
    AutoTokenizer = None
    AutoModelForCausalLM = None
    torch = None

try:
    from modelscope import AutoModelForCausalLM as ModelScopeAutoModelForCausalLM
    from modelscope import AutoTokenizer as ModelScopeAutoTokenizer
    MODELSCOPE_AVAILABLE = True
except ImportError:
    ModelScopeAutoModelForCausalLM = None
    ModelScopeAutoTokenizer = None
    MODELSCOPE_AVAILABLE = False


class UOParser:
    """
    Natural Language Parser for Unit Operations
    
    Converts natural language descriptions of laboratory procedures
    into structured unit operation sequences.
    """
    
    def __init__(self, 
                 model_type: str = "openai",
                 model_name: str = "gpt-3.5-turbo",
                 api_key: Optional[str] = None):
        """
        Initialize the UO Parser
        
        Args:
            model_type: Type of model to use ("openai", "local", "qwen", "mock")
            model_name: Name of the specific model
            api_key: API key for external services
        """
        self.model_type = model_type
        self.model_name = model_name
        
        # Load UO templates and prompts
        self.templates = self._load_templates()
        self.system_prompt = self._load_system_prompt()
        
        # Initialize model based on type
        if model_type == "openai":
            self._init_openai(api_key)
        elif model_type == "local":
            self._init_local_model()
        elif model_type == "qwen":
            self._init_qwen_model()
        elif model_type == "mock":
            print("Using mock parser for development/testing")
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    
    def _load_templates(self) -> Dict[str, Any]:
        """Load UO templates from registry"""
        try:
            template_path = Path(__file__).parent.parent / "registry" / "uo_templates.json"
            with open(template_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("Warning: UO templates not found, using empty registry")
            return {"templates": {}, "categories": {}}
    
    def _load_system_prompt(self) -> str:
        """Load system prompt template"""
        try:
            prompt_path = Path(__file__).parent.parent / "prompts" / "workflow_prompt.txt"
            with open(prompt_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print("Warning: System prompt not found, using default")
            return self._get_default_prompt()
    
    def _get_default_prompt(self) -> str:
        """Default system prompt if file not found"""
        return """You are a laboratory assistant AI. Convert English language 
        descriptions of experiments into structured JSON workflows with unit operations.
        
        Available operations: add_liquid, heat, cv, lsv, ocv, stir, wait, transfer, wash.
        
        Always respond with valid JSON array format with proper node structure for ReactFlow canvas."""
    
    def _init_openai(self, api_key: Optional[str]):
        """Initialize OpenAI client"""
        if not openai:
            raise ImportError("OpenAI package not installed. Run: pip install openai")
        
        if api_key:
            openai.api_key = api_key
        elif os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
        else:
            print("Warning: No OpenAI API key provided. Set OPENAI_API_KEY environment variable.")
    
    def _init_local_model(self):
        """Initialize local transformer model"""
        if not AutoTokenizer or not AutoModelForCausalLM:
            raise ImportError("Transformers package not installed. Run: pip install transformers torch")
        
        print(f"Loading local model: {self.model_name}")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token
    
    def _init_qwen_model(self):
        """Initialize Qwen model from ModelScope"""
        if not MODELSCOPE_AVAILABLE:
            print("ModelScope not available, trying to import at runtime...")
            try:
                global ModelScopeAutoTokenizer, ModelScopeAutoModelForCausalLM
                from modelscope import AutoModelForCausalLM as ModelScopeAutoModelForCausalLM
                from modelscope import AutoTokenizer as ModelScopeAutoTokenizer
            except ImportError:
                raise ImportError("ModelScope package not installed. Run: pip install modelscope")
        
        # Default to Qwen2.5-7B-Instruct if no specific model provided
        if self.model_name == "gpt-3.5-turbo":  # Default was for OpenAI
            self.model_name = "Qwen/Qwen2.5-7B-Instruct"
        
        print(f"Loading Qwen model: {self.model_name}")
        
        try:
            # Load Qwen model from ModelScope
            self.qwen_tokenizer = ModelScopeAutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            self.qwen_model = ModelScopeAutoModelForCausalLM.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            
            # Set pad token if not exists
            if self.qwen_tokenizer.pad_token is None:
                self.qwen_tokenizer.pad_token = self.qwen_tokenizer.eos_token
                
            print("✅ Qwen model loaded successfully")
            
        except Exception as e:
            print(f"❌ Failed to load Qwen model: {e}")
            print("Falling back to local transformers...")
            # Fallback to regular transformers for Qwen
            self.qwen_tokenizer = AutoTokenizer.from_pretrained(
                self.model_name, 
                trust_remote_code=True
            )
            self.qwen_model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
    
    def parse_workflow(self, user_input: str) -> List[Dict[str, Any]]:
        """
        Parse natural language input into structured workflow
        
        Args:
            user_input: Natural language description of experiment
            
        Returns:
            List of structured unit operations
        """
        if self.model_type == "openai":
            return self._parse_with_openai(user_input)
        elif self.model_type == "local":
            return self._parse_with_local_model(user_input)
        elif self.model_type == "qwen":
            return self._parse_with_qwen(user_input)
        elif self.model_type == "mock":
            return self._parse_with_mock(user_input)
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def _parse_with_openai(self, user_input: str) -> List[Dict[str, Any]]:
        """Parse using OpenAI API"""
        try:
            response = openai.ChatCompletion.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            result_text = response.choices[0].message.content.strip()
            return self._extract_json_from_response(result_text)
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._fallback_parse(user_input)
    
    def _parse_with_local_model(self, user_input: str) -> List[Dict[str, Any]]:
        """Parse using local transformer model"""
        try:
            # Construct prompt
            prompt = f"{self.system_prompt}\n\nUser Input: {user_input}\n\nJSON Output:"
            
            # Tokenize and generate
            inputs = self.tokenizer.encode(prompt, return_tensors="pt", truncation=True, max_length=1024)
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=1000,
                    temperature=0.3,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode response
            result_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            result_text = result_text[len(prompt):].strip()
            
            return self._extract_json_from_response(result_text)
            
        except Exception as e:
            print(f"Local model error: {e}")
            return self._fallback_parse(user_input)
    
    def _parse_with_qwen(self, user_input: str) -> List[Dict[str, Any]]:
        """Parse using Qwen model"""
        try:
            # Create specialized prompt for laboratory workflow generation
            system_message = """You are an expert laboratory assistant AI specialized in converting natural language descriptions into structured laboratory workflows.

Your task is to convert the user's description into a JSON array of laboratory operations using these available operation types:

1. **PumpControl** - For liquid handling (add, transfer liquids)
   - Parameters: flowRate (ml/min), duration (seconds), direction ("forward"/"reverse")

2. **HotplateControl** - For heating/temperature control  
   - Parameters: temperature (°C), stirringSpeed (rpm), rampRate (°C/min)

3. **sdl_catalyst_cva** - For Cyclic Voltammetry analysis
   - Parameters: startVoltage (V), endVoltage (V), scanRate (mV/s), cycles (number)

4. **sdl_catalyst_lsv** - For Linear Sweep Voltammetry
   - Parameters: startVoltage (V), endVoltage (V), scanRate (mV/s)

5. **sdl_catalyst_ocv** - For Open Circuit Voltage measurement
   - Parameters: duration (seconds), samplingRate (Hz)

6. **homogenizer** - For mixing/stirring
   - Parameters: speed (rpm), time (minutes), temperature (°C)

7. **BalanceControl** - For weighing operations
   - Parameters: targetWeight (g), tolerance (g), tare (boolean)

8. **massSpectrometer** - For analysis/characterization
   - Parameters: massRange (Da), resolution (number), ionizationMode (string)

9. **dataLogger** - For data logging/monitoring
   - Parameters: samplingRate (Hz), channelCount (number), storageCapacity (MB)

Return ONLY a valid JSON array where each operation has this structure:
{
  "id": "step_X",
  "type": "OperationType", 
  "name": "Operation Name",
  "params": {
    "parameter1": value1,
    "parameter2": value2
  },
  "description": "Clear description of what this step does"
}

Extract specific numeric values from the input (temperatures, volumes, times, etc.) and use them in the parameters. If values are not specified, use reasonable defaults for laboratory operations."""

            # Format the conversation for Qwen
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Convert this laboratory procedure to JSON: {user_input}"}
            ]
            
            # Apply chat template
            text = self.qwen_tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            
            # Tokenize
            model_inputs = self.qwen_tokenizer([text], return_tensors="pt")
            
            # Generate response
            with torch.no_grad():
                generated_ids = self.qwen_model.generate(
                    model_inputs.input_ids,
                    max_new_tokens=1500,
                    temperature=0.3,
                    do_sample=True,
                    pad_token_id=self.qwen_tokenizer.eos_token_id,
                    eos_token_id=self.qwen_tokenizer.eos_token_id
                )
            
            # Decode response
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            
            response = self.qwen_tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            print(f"🤖 Qwen Response: {response[:200]}...")
            
            return self._extract_json_from_response(response)
            
        except Exception as e:
            print(f"Qwen model error: {e}")
            import traceback
            traceback.print_exc()
            return self._fallback_parse(user_input)
    
    def _parse_with_mock(self, user_input: str) -> List[Dict[str, Any]]:
        """Mock parser for development/testing (English only)"""
        # Simple keyword-based parsing using actual system UO types
        operations = []
        step_id = 1
        
        # Map keywords to actual system UO types
        # Check for liquid handling operations
        if any(keyword in user_input.lower() for keyword in ["add", "liquid", "solution", "pipette", "dispense"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "PumpControl",  # Real system UO type
                "name": "Add Liquid",
                "params": {
                    "flowRate": self._extract_number(user_input, ["ml/min"], 1.0),
                    "duration": self._extract_number(user_input, ["min", "minutes", "sec", "seconds"], 60),
                    "direction": "forward"
                },
                "description": "Add liquid using pump control"
            })
            step_id += 1
        
        # Check for heating operations
        if any(keyword in user_input.lower() for keyword in ["heat", "temperature", "warm", "°c", "hotplate"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "HotplateControl",  # Real system UO type
                "name": "Heat Sample",
                "params": {
                    "temperature": self._extract_number(user_input, ["°c", "celsius", "degrees"], 80),
                    "stirringSpeed": self._extract_number(user_input, ["rpm"], 300),
                    "rampRate": 5
                },
                "description": "Heat sample using hotplate control"
            })
            step_id += 1
        
        # Check for electrochemical operations (CV)
        if any(keyword in user_input.lower() for keyword in ["cv", "cyclic", "voltammetry"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "sdl_catalyst_cva",  # Real SDL Catalyst UO type
                "name": "Cyclic Voltammetry", 
                "params": {
                    "startVoltage": -1.0,
                    "endVoltage": 1.0,
                    "scanRate": self._extract_number(user_input, ["mv/s", "v/s"], 50),
                    "cycles": self._extract_number(user_input, ["cycle", "cycles"], 3)
                },
                "description": "Perform cyclic voltammetry analysis"
            })
            step_id += 1
        
        # Check for LSV operations
        if any(keyword in user_input.lower() for keyword in ["lsv", "linear", "sweep"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "sdl_catalyst_lsv",  # Real SDL Catalyst UO type
                "name": "Linear Sweep Voltammetry",
                "params": {
                    "startVoltage": -1.0,
                    "endVoltage": 1.0,
                    "scanRate": self._extract_number(user_input, ["mv/s", "v/s"], 50)
                },
                "description": "Perform linear sweep voltammetry"
            })
            step_id += 1
        
        # Check for OCV operations
        if any(keyword in user_input.lower() for keyword in ["ocv", "open", "circuit", "voltage"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "sdl_catalyst_ocv",  # Real SDL Catalyst UO type
                "name": "Open Circuit Voltage",
                "params": {
                    "duration": self._extract_number(user_input, ["min", "minutes", "sec", "seconds"], 60),
                    "samplingRate": 1.0
                },
                "description": "Measure open circuit voltage"
            })
            step_id += 1
            
        # Check for stirring/mixing operations
        if any(keyword in user_input.lower() for keyword in ["stir", "mix", "agitate", "homogenize"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "homogenizer",  # Real system UO type
                "name": "Mix Solution", 
                "params": {
                    "speed": self._extract_number(user_input, ["rpm"], 300),
                    "time": self._extract_number(user_input, ["min", "minutes"], 2),
                    "temperature": 25
                },
                "description": "Mix solution using homogenizer"
            })
            step_id += 1
        
        # Check for weighing operations
        if any(keyword in user_input.lower() for keyword in ["weigh", "weight", "mass", "balance"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "BalanceControl",  # Real system UO type
                "name": "Weigh Sample",
                "params": {
                    "targetWeight": self._extract_number(user_input, ["g", "mg"], 1.0),
                    "tolerance": 0.001,
                    "tare": True
                },
                "description": "Weigh sample using balance control"
            })
            step_id += 1
        
        # Check for analysis operations
        if any(keyword in user_input.lower() for keyword in ["analyze", "analysis", "characterize", "measure"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "massSpectrometer",  # Real system UO type
                "name": "Analyze Sample",
                "params": {
                    "massRange": 2000,
                    "resolution": 10000,
                    "ionizationMode": "ESI"
                },
                "description": "Analyze sample using mass spectrometer"
            })
            step_id += 1
        
        # Check for data logging
        if any(keyword in user_input.lower() for keyword in ["log", "record", "monitor", "data"]):
            operations.append({
                "id": f"step_{step_id}",
                "type": "dataLogger",  # Real system UO type
                "name": "Log Data",
                "params": {
                    "samplingRate": 1.0,
                    "channelCount": 4,
                    "storageCapacity": 1
                },
                "description": "Log experimental data"
            })
            step_id += 1
        
        # If no operations found, create a basic pump control operation
        if not operations:
            operations.append({
                "id": "step_1",
                "type": "dataLogger",  # Use a generic but real UO type
                "name": "Process Input",
                "params": {
                    "samplingRate": 1.0,
                    "channelCount": 1,
                    "storageCapacity": 1
                },
                "description": f"Processing user input: {user_input}"
            })
        
        return operations
    
    def _extract_json_from_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Extract JSON array from model response"""
        try:
            # Try to find JSON array in response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            
            # Try to parse entire response as JSON
            return json.loads(response_text)
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response text: {response_text}")
            return self._fallback_parse(response_text)
    
    def _extract_number(self, text: str, units: List[str], default: float) -> float:
        """Extract numeric value with units from text"""
        for unit in units:
            pattern = rf'(\d+(?:\.\d+)?)\s*{re.escape(unit)}'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        # Try to find any number
        number_match = re.search(r'(\d+(?:\.\d+)?)', text)
        if number_match:
            return float(number_match.group(1))
        
        return default
    
    def _extract_chemical(self, text: str) -> str:
        """Extract chemical name from text"""
        # Common chemicals
        chemicals = ["NaOH", "HCl", "H2SO4", "NaCl", "KOH", "H2O", "water", "solution"]
        
        for chemical in chemicals:
            if chemical.lower() in text.lower():
                return chemical
        
        return "H2O"  # Default to water
    
    def _fallback_parse(self, user_input: str) -> List[Dict[str, Any]]:
        """Fallback parsing when AI models fail"""
        return [{
            "id": "step_1",
            "type": "wait",
            "name": "Parse Failed",
            "params": {
                "duration": 60,
                "message": f"Could not parse: {user_input}"
            },
            "description": f"Parsing failed for input: {user_input}"
        }]
    
    def get_supported_operations(self) -> Dict[str, Any]:
        """Get list of supported unit operations"""
        return self.templates.get("templates", {})
    
    def validate_workflow(self, workflow: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate generated workflow against templates
        
        Returns:
            Dict with validation results
        """
        valid = True
        errors = []
        warnings = []
        
        supported_types = set(self.templates.get("templates", {}).keys())
        
        for i, step in enumerate(workflow):
            step_id = step.get("id", f"step_{i+1}")
            step_type = step.get("type")
            
            # Check if type is supported
            if step_type not in supported_types:
                errors.append(f"Step {step_id}: Unsupported operation type '{step_type}'")
                valid = False
            
            # Check required fields
            if not step.get("name"):
                warnings.append(f"Step {step_id}: Missing name field")
            
            if not step.get("params"):
                warnings.append(f"Step {step_id}: Missing params field")
        
        return {
            "valid": valid,
            "errors": errors,
            "warnings": warnings,
            "total_steps": len(workflow)
        }