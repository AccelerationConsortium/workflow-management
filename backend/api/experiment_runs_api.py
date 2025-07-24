"""
Experiment Runs API

This module provides API endpoints for accessing experiment run data
for provenance tracking and reproducibility.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime

from backend.services.provenance_logger import provenance_logger, ExperimentRun

router = APIRouter(prefix="/api/runs", tags=["experiment-runs"])

class ExperimentRunResponse(BaseModel):
    """Response model for experiment run"""
    id: str
    user_id: Optional[str]
    workflow_id: str
    config_hash: str
    input_summary: Optional[Dict[str, Any]]
    output_summary: Optional[Dict[str, Any]]
    function_name: Optional[str]
    environment: Optional[Dict[str, Any]]
    git_commit_hash: Optional[str]
    trigger_source: Optional[str]
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration: Optional[int]
    error_message: Optional[str]
    metadata: Optional[Dict[str, Any]]

class ExperimentRunsListResponse(BaseModel):
    """Response model for experiment runs list"""
    runs: List[ExperimentRunResponse]
    total: int
    limit: int
    offset: int

class ExperimentRunSummary(BaseModel):
    """Summary model for experiment run"""
    id: str
    workflow_id: str
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    duration: Optional[int]
    function_name: Optional[str]

def _convert_to_response(run: ExperimentRun) -> ExperimentRunResponse:
    """Convert ExperimentRun to response model"""
    return ExperimentRunResponse(
        id=run.id,
        user_id=run.user_id,
        workflow_id=run.workflow_id,
        config_hash=run.config_hash,
        input_summary=run.input_summary,
        output_summary=run.output_summary,
        function_name=run.function_name,
        environment=run.environment,
        git_commit_hash=run.git_commit_hash,
        trigger_source=run.trigger_source,
        status=run.status,
        start_time=run.start_time,
        end_time=run.end_time,
        duration=run.duration,
        error_message=run.error_message,
        metadata=run.metadata
    )

@router.get("/", response_model=ExperimentRunsListResponse)
async def get_experiment_runs(
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, ge=1, le=1000, description="Number of runs to return"),
    offset: int = Query(0, ge=0, description="Number of runs to skip"),
    summary_only: bool = Query(False, description="Return only summary information")
):
    """
    Get experiment runs with optional filtering
    
    Returns a list of experiment runs matching the specified criteria.
    """
    try:
        runs = provenance_logger.get_runs(
            workflow_id=workflow_id,
            user_id=user_id,
            status=status,
            limit=limit,
            offset=offset
        )
        
        if summary_only:
            # Return only summary information
            summaries = [
                ExperimentRunSummary(
                    id=run.id,
                    workflow_id=run.workflow_id,
                    status=run.status,
                    start_time=run.start_time,
                    end_time=run.end_time,
                    duration=run.duration,
                    function_name=run.function_name
                )
                for run in runs
            ]
            return ExperimentRunsListResponse(
                runs=summaries,
                total=len(summaries),
                limit=limit,
                offset=offset
            )
        else:
            # Return full information
            run_responses = [_convert_to_response(run) for run in runs]
            return ExperimentRunsListResponse(
                runs=run_responses,
                total=len(run_responses),
                limit=limit,
                offset=offset
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get experiment runs: {str(e)}")

@router.get("/{run_id}", response_model=ExperimentRunResponse)
async def get_experiment_run(run_id: str):
    """
    Get a specific experiment run by ID
    
    Returns detailed information about a single experiment run.
    """
    try:
        run = provenance_logger.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Experiment run {run_id} not found")
        
        return _convert_to_response(run)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get experiment run: {str(e)}")

@router.get("/{run_id}/summary")
async def get_experiment_run_summary(run_id: str):
    """
    Get a summary of a specific experiment run
    
    Returns basic information about an experiment run without detailed data.
    """
    try:
        run = provenance_logger.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Experiment run {run_id} not found")
        
        return ExperimentRunSummary(
            id=run.id,
            workflow_id=run.workflow_id,
            status=run.status,
            start_time=run.start_time,
            end_time=run.end_time,
            duration=run.duration,
            function_name=run.function_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get experiment run summary: {str(e)}")

@router.get("/{run_id}/logs")
async def get_experiment_run_logs(run_id: str):
    """
    Get logs for a specific experiment run
    
    Returns execution logs associated with the experiment run.
    """
    try:
        run = provenance_logger.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Experiment run {run_id} not found")
        
        # Extract logs from metadata if available
        logs = []
        if run.metadata and "logs" in run.metadata:
            logs = run.metadata["logs"]
        
        return {
            "run_id": run_id,
            "logs": logs,
            "total_entries": len(logs)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get experiment run logs: {str(e)}")

@router.get("/workflow/{workflow_id}/runs")
async def get_workflow_runs(
    workflow_id: str,
    limit: int = Query(50, ge=1, le=500, description="Number of runs to return"),
    offset: int = Query(0, ge=0, description="Number of runs to skip")
):
    """
    Get all runs for a specific workflow
    
    Returns a list of experiment runs for the specified workflow.
    """
    try:
        runs = provenance_logger.get_runs(
            workflow_id=workflow_id,
            limit=limit,
            offset=offset
        )
        
        run_responses = [_convert_to_response(run) for run in runs]
        return ExperimentRunsListResponse(
            runs=run_responses,
            total=len(run_responses),
            limit=limit,
            offset=offset
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow runs: {str(e)}")

@router.get("/stats/summary")
async def get_runs_statistics():
    """
    Get statistics about experiment runs
    
    Returns summary statistics about all experiment runs.
    """
    try:
        all_runs = provenance_logger.get_runs(limit=1000)  # Get a sample
        
        # Calculate statistics
        total_runs = len(all_runs)
        status_counts = {}
        workflow_counts = {}
        
        for run in all_runs:
            # Count by status
            status_counts[run.status] = status_counts.get(run.status, 0) + 1
            
            # Count by workflow
            workflow_counts[run.workflow_id] = workflow_counts.get(run.workflow_id, 0) + 1
        
        return {
            "total_runs": total_runs,
            "status_distribution": status_counts,
            "workflow_distribution": workflow_counts,
            "sample_size": min(1000, total_runs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get runs statistics: {str(e)}")