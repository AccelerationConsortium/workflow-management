"""
Parameter Filler Module

This module handles intelligent parameter extraction and filling
for unit operations based on natural language descriptions and templates.
"""

import json
import re
from typing import Dict, Any, List, Optional, Union
from pathlib import Path
from dataclasses import dataclass


@dataclass
class ParameterRule:
    """Rule for extracting and validating parameters"""
    name: str
    param_type: str
    unit: Optional[str] = None
    default: Any = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    regex_patterns: Optional[List[str]] = None
    keywords: Optional[List[str]] = None


class ParameterFiller:
    """
    Intelligent Parameter Extraction and Filling
    
    Extracts parameters from natural language and fills UO templates
    with appropriate values, applying validation and smart defaults.
    """
    
    def __init__(self, ai_model=None):
        """
        Initialize the parameter filler with templates and rules
        
        Args:
            ai_model: Optional AI model instance for intelligent parameter extraction
        """
        self.templates = self._load_templates()
        self.extraction_rules = self._create_extraction_rules()
        self.ai_model = ai_model  # Can be UOParser instance for AI-enhanced extraction
        
        # Common unit conversions (English only)
        self.unit_conversions = {
            "time": {
                "min": 60, "minute": 60, "minutes": 60,
                "hour": 3600, "hours": 3600, "h": 3600,
                "s": 1, "sec": 1, "second": 1, "seconds": 1
            },
            "volume": {
                "ml": 1, "mL": 1,
                "l": 1000, "L": 1000, "litre": 1000, "liter": 1000,
                "μl": 0.001, "μL": 0.001, "ul": 0.001, "uL": 0.001
            },
            "temperature": {
                "°C": 1, "celsius": 1, "c": 1,
                "K": -273.15, "kelvin": -273.15  # Convert from Kelvin to Celsius
            },
            "voltage": {
                "V": 1, "volt": 1, "volts": 1,
                "mV": 0.001, "millivolt": 0.001, "millivolts": 0.001
            },
            "speed": {
                "rpm": 1, "revolutions per minute": 1,
                "ml/min": 1, "ml per minute": 1
            }
        }
    
    def _load_templates(self) -> Dict[str, Any]:
        """Load UO templates from registry"""
        try:
            template_path = Path(__file__).parent.parent / "registry" / "uo_templates.json"
            with open(template_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"templates": {}, "categories": {}}
    
    def _create_extraction_rules(self) -> Dict[str, List[ParameterRule]]:
        """Create parameter extraction rules from templates"""
        rules = {}
        
        for uo_type, template in self.templates.get("templates", {}).items():
            uo_rules = []
            
            for param_name, param_info in template.get("params", {}).items():
                rule = ParameterRule(
                    name=param_name,
                    param_type=param_info.get("type"),
                    unit=param_info.get("unit"),
                    default=param_info.get("default"),
                    min_value=param_info.get("min"),
                    max_value=param_info.get("max")
                )
                
                # Add specific extraction patterns (English only)
                if param_name == "temperature":
                    rule.regex_patterns = [
                        r'(\d+(?:\.\d+)?)\s*(?:°C|celsius|degrees?)',
                        r'heat(?:\s+to|\s+at)?\s*(\d+(?:\.\d+)?)',
                        r'temperature\s*(\d+(?:\.\d+)?)'
                    ]
                    rule.keywords = ["temperature", "heat", "warm", "celsius"]
                
                elif param_name == "volume":
                    rule.regex_patterns = [
                        r'(\d+(?:\.\d+)?)\s*(?:ml|mL|L|liter|litre|μl|ul)',
                        r'volume\s*(\d+(?:\.\d+)?)',
                        r'add\s*(\d+(?:\.\d+)?)'
                    ]
                    rule.keywords = ["volume", "ml", "liter", "add"]
                
                elif param_name == "duration":
                    rule.regex_patterns = [
                        r'(\d+(?:\.\d+)?)\s*(?:min|minutes?|sec|seconds?|hours?|h)',
                        r'for\s*(\d+(?:\.\d+)?)',
                        r'maintain\s*(\d+(?:\.\d+)?)'
                    ]
                    rule.keywords = ["time", "duration", "for", "minutes"]
                
                elif param_name == "scan_rate":
                    rule.regex_patterns = [
                        r'(\d+(?:\.\d+)?)\s*(?:mV/s|mv/s|millivolts?/s)',
                        r'scan\s+rate\s*(\d+(?:\.\d+)?)',
                        r'rate\s*(\d+(?:\.\d+)?)'
                    ]
                    rule.keywords = ["scan rate", "rate", "scan"]
                
                elif param_name == "chemical":
                    rule.regex_patterns = [
                        r'(?:add|use)\s*([A-Za-z0-9]+)',
                        r'([A-Za-z0-9]+)\s*(?:solution|reagent)'
                    ]
                    rule.keywords = ["chemical", "reagent", "solution"]
                
                uo_rules.append(rule)
            
            rules[uo_type] = uo_rules
        
        return rules
    
    def fill_parameters(self, 
                       workflow: List[Dict[str, Any]], 
                       original_text: str) -> List[Dict[str, Any]]:
        """
        Fill parameters for entire workflow based on original text
        
        Args:
            workflow: List of UO steps to fill parameters for
            original_text: Original natural language input
            
        Returns:
            Workflow with filled parameters
        """
        filled_workflow = []
        
        for step in workflow:
            filled_step = self.fill_step_parameters(step, original_text)
            filled_workflow.append(filled_step)
        
        return filled_workflow
    
    def fill_step_parameters(self, 
                            step: Dict[str, Any], 
                            text: str) -> Dict[str, Any]:
        """
        Fill parameters for a single workflow step
        
        Args:
            step: Single UO step
            text: Text to extract parameters from
            
        Returns:
            Step with filled parameters
        """
        step_type = step.get("type")
        if step_type not in self.extraction_rules:
            return step
        
        filled_step = step.copy()
        filled_params = filled_step.get("params", {}).copy()
        
        rules = self.extraction_rules[step_type]
        
        for rule in rules:
            # Try to extract parameter value
            extracted_value = self._extract_parameter(text, rule)
            
            if extracted_value is not None:
                # Validate and convert value
                validated_value = self._validate_parameter(extracted_value, rule)
                filled_params[rule.name] = validated_value
            elif rule.default is not None:
                # Use default value if not extracted
                filled_params[rule.name] = rule.default
        
        filled_step["params"] = filled_params
        return filled_step
    
    def _extract_parameter(self, text: str, rule: ParameterRule) -> Any:
        """Extract parameter value from text using rule"""
        
        # Try regex patterns first
        if rule.regex_patterns:
            for pattern in rule.regex_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    value = matches[0]
                    
                    # Convert based on parameter type
                    if rule.param_type == "number":
                        try:
                            return float(value)
                        except ValueError:
                            continue
                    elif rule.param_type == "string":
                        return str(value)
        
        # For chemical names, try to find common chemicals
        if rule.name == "chemical":
            chemicals = self._extract_chemicals(text)
            if chemicals:
                return chemicals[0]
        
        # For boolean parameters
        if rule.param_type == "boolean":
            positive_keywords = ["yes", "true", "enable", "on", "start"]
            negative_keywords = ["no", "false", "disable", "off", "stop"]
            
            text_lower = text.lower()
            if any(kw in text_lower for kw in positive_keywords):
                return True
            elif any(kw in text_lower for kw in negative_keywords):
                return False
        
        return None
    
    def _extract_chemicals(self, text: str) -> List[str]:
        """Extract chemical names from text"""
        # Common chemicals and their patterns (English only)
        chemical_patterns = {
            "NaOH": [r'\bNaOH\b', r'sodium hydroxide', r'caustic soda'],
            "HCl": [r'\bHCl\b', r'hydrochloric acid', r'hydrogen chloride'],
            "H2SO4": [r'\bH2SO4\b', r'sulfuric acid', r'sulphuric acid'],
            "NaCl": [r'\bNaCl\b', r'sodium chloride', r'salt'],
            "KOH": [r'\bKOH\b', r'potassium hydroxide'],
            "H2O": [r'\bH2O\b', r'water', r'distilled water', r'deionized water'],
            "CH3OH": [r'\bCH3OH\b', r'methanol'],
            "C2H5OH": [r'\bC2H5OH\b', r'ethanol', r'alcohol']
        }
        
        found_chemicals = []
        
        for chemical, patterns in chemical_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    found_chemicals.append(chemical)
                    break
        
        return found_chemicals
    
    def _validate_parameter(self, value: Any, rule: ParameterRule) -> Any:
        """Validate and convert parameter value"""
        
        if rule.param_type == "number":
            try:
                num_value = float(value)
                
                # Apply unit conversion if needed
                if rule.unit:
                    num_value = self._convert_units(num_value, rule.unit, rule.name)
                
                # Check bounds
                if rule.min_value is not None and num_value < rule.min_value:
                    num_value = rule.min_value
                
                if rule.max_value is not None and num_value > rule.max_value:
                    num_value = rule.max_value
                
                return num_value
                
            except (ValueError, TypeError):
                return rule.default
        
        elif rule.param_type == "string":
            return str(value)
        
        elif rule.param_type == "boolean":
            if isinstance(value, bool):
                return value
            return bool(value)
        
        return value
    
    def _convert_units(self, value: float, target_unit: str, param_name: str) -> float:
        """Convert units to standard format"""
        
        # Determine unit category based on parameter name and target unit
        if param_name in ["duration", "time"] or target_unit in ["seconds", "s"]:
            # Convert to seconds
            return value  # Assume already in seconds if no conversion needed
        
        elif param_name in ["volume"] or target_unit in ["ml", "mL"]:
            # Convert to ml
            return value  # Assume already in ml if no conversion needed
        
        elif param_name in ["temperature"] or target_unit in ["°C", "℃"]:
            # Convert to Celsius
            return value  # Assume already in Celsius if no conversion needed
        
        return value
    
    def auto_complete_workflow(self, workflow: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Auto-complete workflow with intelligent parameter suggestions
        
        Adds missing parameters and suggests optimizations
        """
        completed_workflow = []
        
        for i, step in enumerate(workflow):
            completed_step = step.copy()
            step_type = step.get("type")
            
            # Get template for this step type
            template = self.templates.get("templates", {}).get(step_type, {})
            template_params = template.get("params", {})
            
            current_params = completed_step.get("params", {})
            
            # Fill missing parameters with defaults
            for param_name, param_info in template_params.items():
                if param_name not in current_params:
                    default_value = param_info.get("default")
                    if default_value is not None:
                        current_params[param_name] = default_value
            
            # Add intelligent suggestions based on context
            current_params = self._add_context_suggestions(
                current_params, step_type, i, workflow
            )
            
            completed_step["params"] = current_params
            completed_workflow.append(completed_step)
        
        return completed_workflow
    
    def _add_context_suggestions(self, 
                                params: Dict[str, Any], 
                                step_type: str, 
                                step_index: int, 
                                workflow: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Add context-aware parameter suggestions"""
        
        enhanced_params = params.copy()
        
        # Context-aware suggestions
        if step_type == "heat":
            # If heating after adding liquid, suggest appropriate temperature
            prev_steps = workflow[:step_index]
            has_liquid = any(s.get("type") == "add_liquid" for s in prev_steps)
            
            if has_liquid and "temperature" not in enhanced_params:
                enhanced_params["temperature"] = 60  # Conservative heating temp
        
        elif step_type == "cv":
            # Suggest appropriate scan rate based on previous operations
            if "scan_rate" not in enhanced_params:
                enhanced_params["scan_rate"] = 50  # Standard scan rate
        
        elif step_type == "stir":
            # Suggest stirring after liquid addition
            if step_index > 0:
                prev_step = workflow[step_index - 1]
                if prev_step.get("type") == "add_liquid":
                    enhanced_params["duration"] = enhanced_params.get("duration", 60)
                    enhanced_params["speed"] = enhanced_params.get("speed", 300)
        
        return enhanced_params
    
    def suggest_missing_steps(self, workflow: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Suggest missing steps that might be needed
        
        Returns suggested additional steps
        """
        suggestions = []
        
        # Check if workflow has liquid addition but no mixing
        has_liquid = any(step.get("type") == "add_liquid" for step in workflow)
        has_mixing = any(step.get("type") in ["stir", "mix"] for step in workflow)
        
        if has_liquid and not has_mixing:
            suggestions.append({
                "id": f"suggested_stir",
                "type": "stir",
                "name": "Suggestion: Stir for mixing",
                "params": {
                    "speed": 300,
                    "duration": 60
                },
                "description": "Suggest stirring after liquid addition",
                "suggestion": True
            })
        
        # Check if electrochemical test without equilibration
        has_electrochemical = any(
            step.get("type") in ["cv", "lsv", "ocv"] for step in workflow
        )
        has_wait = any(step.get("type") == "wait" for step in workflow)
        
        if has_electrochemical and not has_wait:
            suggestions.append({
                "id": f"suggested_equilibrate",
                "type": "wait",
                "name": "Suggestion: Equilibration wait",
                "params": {
                    "duration": 120,
                    "message": "Electrode equilibrating..."
                },
                "description": "Suggest waiting for electrode equilibration before electrochemical test",
                "suggestion": True
            })
        
        return suggestions
    
    def ai_enhanced_parameter_extraction(self, workflow: List[Dict[str, Any]], original_text: str) -> List[Dict[str, Any]]:
        """
        Use AI model for intelligent parameter extraction and validation
        
        Args:
            workflow: Basic workflow with operations identified
            original_text: Original natural language description
            
        Returns:
            Enhanced workflow with AI-extracted parameters
        """
        if not self.ai_model or self.ai_model.model_type == "mock":
            # Fallback to rule-based extraction
            return self.fill_parameters(workflow, original_text)
        
        enhanced_workflow = []
        
        for step in workflow:
            try:
                enhanced_step = self._ai_extract_step_parameters(step, original_text)
                enhanced_workflow.append(enhanced_step)
            except Exception as e:
                print(f"AI parameter extraction failed for step {step.get('id', 'unknown')}: {e}")
                # Fallback to rule-based
                enhanced_step = self.fill_step_parameters(step, original_text)
                enhanced_workflow.append(enhanced_step)
        
        return enhanced_workflow
    
    def _ai_extract_step_parameters(self, step: Dict[str, Any], text: str) -> Dict[str, Any]:
        """Extract parameters for a single step using AI"""
        
        if not hasattr(self.ai_model, 'qwen_model'):
            # Not a Qwen model, use regular extraction
            return self.fill_step_parameters(step, text)
        
        step_type = step.get("type")
        step_name = step.get("name", step_type)
        
        # Create focused prompt for parameter extraction
        param_prompt = f"""Extract specific parameters for this laboratory operation from the given text.

Operation: {step_name} (Type: {step_type})

Original text: "{text}"

For operation type "{step_type}", extract these parameters if mentioned in the text:
- Numbers with units (temperature, volume, time, voltage, etc.)
- Chemical names or solutions
- Equipment settings (speed, rate, cycles, etc.)

Return ONLY a JSON object with the extracted parameters in this format:
{{
  "temperature": 75.0,
  "volume": 10.5,
  "duration": 300,
  "chemical": "HCl",
  "scan_rate": 50
}}

If a parameter is not mentioned in the text, do not include it in the JSON.
Extract actual numeric values from the text, not defaults."""

        try:
            # Use Qwen to extract parameters
            messages = [
                {"role": "system", "content": "You are a precise parameter extraction AI. Extract only the parameters explicitly mentioned in the user's text."},
                {"role": "user", "content": param_prompt}
            ]
            
            # Apply chat template
            text_input = self.ai_model.qwen_tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            
            # Tokenize
            model_inputs = self.ai_model.qwen_tokenizer([text_input], return_tensors="pt")
            
            # Generate response
            import torch
            with torch.no_grad():
                generated_ids = self.ai_model.qwen_model.generate(
                    model_inputs.input_ids,
                    max_new_tokens=300,
                    temperature=0.1,  # Low temperature for precise extraction
                    do_sample=True,
                    pad_token_id=self.ai_model.qwen_tokenizer.eos_token_id,
                    eos_token_id=self.ai_model.qwen_tokenizer.eos_token_id
                )
            
            # Decode response
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            
            response = self.ai_model.qwen_tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # Extract JSON from response
            import json
            import re
            
            # Try to find JSON object in response
            json_match = re.search(r'\{[^{}]*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                extracted_params = json.loads(json_str)
                
                # Merge with existing step parameters
                enhanced_step = step.copy()
                current_params = enhanced_step.get("params", {})
                
                # Update with AI-extracted parameters
                current_params.update(extracted_params)
                enhanced_step["params"] = current_params
                
                print(f"✅ AI extracted parameters for {step_name}: {list(extracted_params.keys())}")
                return enhanced_step
            
        except Exception as e:
            print(f"⚠️ AI parameter extraction failed: {e}")
        
        # Fallback to rule-based extraction
        return self.fill_step_parameters(step, text)