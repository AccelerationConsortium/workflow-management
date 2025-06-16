"""
Workflow API Module

FastAPI endpoints for the Workflow Agent system.
Provides REST API for natural language to workflow conversion.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging
import traceback
from datetime import datetime

from ..agent.uo_parser import UOParser
from ..agent.parameter_filler import ParameterFiller
from ..agent.json_builder import JSONBuilder
from ..integration.workflow_integration import WorkflowIntegration


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Pydantic models for API
class WorkflowRequest(BaseModel):
    """Request model for workflow generation"""
    text: str = Field(..., description="English language description of the experiment")
    language: str = Field(default="en", description="Language of the input (en only)")
    model_type: str = Field(default="mock", description="AI model type to use (openai/local/qwen/mock)")
    include_suggestions: bool = Field(default=True, description="Include suggested improvements")
    optimize_layout: bool = Field(default=True, description="Optimize node layout")
    register_custom_uos: bool = Field(default=False, description="Register unknown UOs as custom UOs")


class WorkflowResponse(BaseModel):
    """Response model for workflow generation"""
    success: bool
    workflow_json: Optional[Dict[str, Any]] = None
    suggestions: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None


class ValidationResponse(BaseModel):
    """Response model for workflow validation"""
    valid: bool
    errors: List[str]
    warnings: List[str]
    canvas_compatible: bool
    total_steps: int


class TemplatesResponse(BaseModel):
    """Response model for available templates"""
    templates: Dict[str, Any]
    categories: Dict[str, str]
    total_count: int


class WorkflowAPI:
    """
    Workflow Agent API Handler
    
    Provides REST API endpoints for the workflow generation system
    """
    
    def __init__(self, app: Optional[FastAPI] = None):
        """Initialize the API with FastAPI app"""
        self.app = app or FastAPI(
            title="Workflow Agent API",
            description="AI-powered workflow generation from natural language",
            version="1.0.0"
        )
        
        # Initialize agent components
        self.parser = UOParser(model_type="mock")  # Start with mock, can be configured
        self.filler = ParameterFiller(ai_model=self.parser)  # Pass parser for AI-enhanced extraction
        self.builder = JSONBuilder()
        self.integration = WorkflowIntegration()  # Integration with existing system
        
        # Configure CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Configure appropriately for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Register routes
        self._register_routes()
    
    def _register_routes(self):
        """Register all API routes"""
        
        @self.app.post("/generate-workflow", response_model=WorkflowResponse)
        async def generate_workflow(
            request: WorkflowRequest,
            background_tasks: BackgroundTasks
        ):
            """
            Generate workflow from natural language description
            
            This is the main endpoint that orchestrates the entire workflow
            generation process from text to Canvas-compatible JSON.
            """
            start_time = datetime.now()
            
            try:
                logger.info(f"Generating workflow from text: {request.text[:100]}...")
                
                # Reconfigure parser if different model type requested
                if request.model_type != self.parser.model_type:
                    logger.info(f"Switching parser from {self.parser.model_type} to {request.model_type}")
                    self.parser = UOParser(model_type=request.model_type)
                    self.filler.ai_model = self.parser  # Update filler's AI model reference
                
                # Step 1: Parse natural language into unit operations
                logger.info("Step 1: Parsing natural language...")
                operations = self.parser.parse_workflow(request.text)
                logger.info(f"Extracted {len(operations)} operations")
                
                # Step 2: Fill parameters intelligently (with AI enhancement if available)
                logger.info("Step 2: Filling parameters...")
                if request.model_type == "qwen" and hasattr(self.filler, 'ai_enhanced_parameter_extraction'):
                    filled_operations = self.filler.ai_enhanced_parameter_extraction(operations, request.text)
                    logger.info("Using AI-enhanced parameter extraction")
                else:
                    filled_operations = self.filler.fill_parameters(operations, request.text)
                
                # Step 3: Auto-complete with smart suggestions
                if request.include_suggestions:
                    logger.info("Step 3: Adding intelligent suggestions...")
                    filled_operations = self.filler.auto_complete_workflow(filled_operations)
                
                # Step 4: Build Canvas-compatible JSON using integration layer
                logger.info("Step 4: Building workflow JSON with integration...")
                workflow_metadata = {
                    "name": f"AI Generated Workflow - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    "description": f"Generated from: {request.text[:50]}...",
                    "source_text": request.text,
                    "language": request.language,
                    "model_type": request.model_type
                }
                
                # Use integration layer for Canvas compatibility
                workflow_json = self.integration.build_workflow_for_canvas(
                    filled_operations, 
                    workflow_metadata
                )
                
                # Step 5: Optimize layout if requested
                if request.optimize_layout:
                    logger.info("Step 5: Optimizing layout...")
                    workflow_json = self.builder.optimize_layout(workflow_json)
                
                # Generate suggestions for improvement
                suggestions = []
                if request.include_suggestions:
                    suggestions = self.filler.suggest_missing_steps(filled_operations)
                
                # Calculate processing time
                processing_time = (datetime.now() - start_time).total_seconds()
                
                # Log success
                background_tasks.add_task(
                    self._log_workflow_generation,
                    request.text,
                    len(filled_operations),
                    processing_time
                )
                
                return WorkflowResponse(
                    success=True,
                    workflow_json=workflow_json,
                    suggestions=suggestions,
                    metadata={
                        "total_operations": len(filled_operations),
                        "estimated_duration": workflow_json["execution"]["estimated_duration"],
                        "required_devices": workflow_json["execution"]["required_devices"]
                    },
                    processing_time=processing_time
                )
                
            except Exception as e:
                logger.error(f"Error generating workflow: {str(e)}")
                logger.error(traceback.format_exc())
                
                return WorkflowResponse(
                    success=False,
                    error=str(e),
                    processing_time=(datetime.now() - start_time).total_seconds()
                )
        
        @self.app.post("/validate-workflow", response_model=ValidationResponse)
        async def validate_workflow(workflow_json: Dict[str, Any]):
            """
            Validate workflow JSON for Canvas compatibility
            
            Checks the workflow structure and validates against templates.
            """
            try:
                # Validate Canvas compatibility
                canvas_validation = self.builder.validate_canvas_compatibility(workflow_json)
                
                # Validate operations if workflow structure is present
                operation_validation = {"valid": True, "errors": [], "warnings": []}
                
                if "workflow" in workflow_json and "nodes" in workflow_json["workflow"]:
                    nodes = workflow_json["workflow"]["nodes"]
                    operation_nodes = [n for n in nodes if n.get("type") == "operationNode"]
                    
                    # Convert to operation list for validation
                    operations = []
                    for node in operation_nodes:
                        data = node.get("data", {})
                        operations.append({
                            "id": node.get("id"),
                            "type": data.get("nodeType"),
                            "name": data.get("label"),
                            "params": data.get("parameters", {})
                        })
                    
                    if operations:
                        operation_validation = self.parser.validate_workflow(operations)
                
                # Combine validations
                all_errors = canvas_validation.get("errors", []) + operation_validation.get("errors", [])
                all_warnings = canvas_validation.get("warnings", []) + operation_validation.get("warnings", [])
                
                return ValidationResponse(
                    valid=len(all_errors) == 0,
                    errors=all_errors,
                    warnings=all_warnings,
                    canvas_compatible=canvas_validation.get("canvas_compatible", False),
                    total_steps=len(workflow_json.get("workflow", {}).get("nodes", [])) - 2  # Exclude start/end
                )
                
            except Exception as e:
                logger.error(f"Error validating workflow: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/templates", response_model=TemplatesResponse)
        async def get_templates():
            """
            Get available unit operation templates
            
            Returns all supported UO types with their parameters and descriptions.
            """
            try:
                templates_data = self.parser.get_supported_operations()
                categories = self.filler.templates.get("categories", {})
                
                return TemplatesResponse(
                    templates=templates_data,
                    categories=categories,
                    total_count=len(templates_data)
                )
                
            except Exception as e:
                logger.error(f"Error getting templates: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/export-workflow")
        async def export_workflow(
            workflow_json: Dict[str, Any],
            format: str = "json"
        ):
            """
            Export workflow to different formats
            
            Supports JSON, simplified JSON, and CSV exports.
            """
            try:
                if format not in ["json", "simplified_json", "csv"]:
                    raise HTTPException(
                        status_code=400, 
                        detail="Unsupported format. Use: json, simplified_json, csv"
                    )
                
                exports = self.builder.export_to_formats(workflow_json)
                
                if format not in exports:
                    raise HTTPException(status_code=500, detail=f"Export format {format} not available")
                
                return {
                    "format": format,
                    "content": exports[format],
                    "exported_at": datetime.now().isoformat()
                }
                
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"Error exporting workflow: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/health")
        async def health_check():
            """Health check endpoint"""
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "version": "1.0.0",
                "components": {
                    "parser": "active",
                    "parameter_filler": "active", 
                    "json_builder": "active"
                }
            }
        
        @self.app.get("/")
        async def root():
            """Root endpoint with API information"""
            return {
                "name": "Workflow Agent API",
                "description": "AI-powered workflow generation from natural language",
                "version": "1.0.0",
                "endpoints": {
                    "generate_workflow": "/generate-workflow",
                    "validate_workflow": "/validate-workflow",
                    "templates": "/templates",
                    "export_workflow": "/export-workflow",
                    "health": "/health"
                },
                "documentation": "/docs"
            }
    
    async def _log_workflow_generation(self, 
                                     input_text: str, 
                                     operation_count: int, 
                                     processing_time: float):
        """Background task to log workflow generation metrics"""
        logger.info(
            f"Workflow generated: {operation_count} operations, "
            f"{processing_time:.2f}s processing time, "
            f"input length: {len(input_text)} chars"
        )
    
    def configure_parser(self, model_type: str, **kwargs):
        """
        Reconfigure the UO parser with different model
        
        Args:
            model_type: Type of model ("openai", "local", "qwen", "mock")
            **kwargs: Additional configuration parameters
        """
        try:
            self.parser = UOParser(model_type=model_type, **kwargs)
            logger.info(f"Parser reconfigured with model type: {model_type}")
        except Exception as e:
            logger.error(f"Failed to reconfigure parser: {str(e)}")
            raise
    
    def get_app(self) -> FastAPI:
        """Get the FastAPI application instance"""
        return self.app


# Create global API instance
workflow_api = WorkflowAPI()
app = workflow_api.get_app()


# Additional utility endpoints
@app.get("/config")
async def get_configuration():
    """Get current configuration"""
    return {
        "parser_model": workflow_api.parser.model_type,
        "supported_languages": ["en"],
        "max_operations": 50,
        "supported_formats": ["json", "simplified_json", "csv"],
        "integration_enabled": True,
        "custom_uo_registration": True
    }


@app.post("/config/parser")
async def update_parser_config(
    model_type: str,
    model_name: Optional[str] = None,
    api_key: Optional[str] = None
):
    """Update parser configuration"""
    try:
        config = {"model_type": model_type}
        if model_name:
            config["model_name"] = model_name
        if api_key:
            config["api_key"] = api_key
        
        workflow_api.configure_parser(**config)
        
        return {
            "success": True,
            "message": f"Parser configured with {model_type}",
            "configuration": config
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)