"""
Provenance Logger Service

This module provides functionality to automatically record metadata
for each experimental run, enabling reproducibility and auditability.
"""

import json
import hashlib
import subprocess
import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)

@dataclass
class ExperimentRun:
    """Data class representing an experiment run record"""
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
    status: str = "pending"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ProvenanceLogger:
    """
    Provenance tracking service that automatically captures and stores
    experimental run metadata for reproducibility and auditability.
    """
    
    def __init__(self, db_connection=None):
        """
        Initialize the provenance logger
        
        Args:
            db_connection: Database connection object (to be implemented)
        """
        self.db_connection = db_connection
        self.active_runs: Dict[str, ExperimentRun] = {}
        
    def start_run(self, 
                  workflow_id: str, 
                  workflow_config: Dict[str, Any],
                  user_id: Optional[str] = None,
                  trigger_source: Optional[str] = None,
                  function_name: Optional[str] = None,
                  input_data: Optional[Dict[str, Any]] = None) -> str:
        """
        Start tracking a new experimental run
        
        Args:
            workflow_id: Unique identifier for the workflow
            workflow_config: Configuration used for the workflow
            user_id: ID of the user who triggered the run
            trigger_source: Source of the trigger (CLI, frontend, etc.)
            function_name: Name of the main function/algorithm being executed
            input_data: Input data or parameters
            
        Returns:
            run_id: Unique identifier for this run
        """
        run_id = str(uuid.uuid4())
        
        # Generate configuration hash for reproducibility
        config_hash = self._generate_config_hash(workflow_config)
        
        # Capture environment information
        environment = self._capture_environment()
        
        # Get git commit hash if available
        git_commit_hash = self._get_git_commit_hash()
        
        # Create experiment run record
        experiment_run = ExperimentRun(
            id=run_id,
            user_id=user_id,
            workflow_id=workflow_id,
            config_hash=config_hash,
            input_summary=input_data,
            output_summary=None,
            function_name=function_name,
            environment=environment,
            git_commit_hash=git_commit_hash,
            trigger_source=trigger_source,
            status="running",
            start_time=datetime.utcnow(),
            metadata={"workflow_config": workflow_config}
        )
        
        # Store in memory
        self.active_runs[run_id] = experiment_run
        
        # Store in database
        self._save_run_to_db(experiment_run)
        
        logger.info(f"Started tracking experiment run: {run_id}")
        return run_id
    
    def update_run_status(self, run_id: str, status: str, error_message: Optional[str] = None):
        """
        Update the status of an active run
        
        Args:
            run_id: Unique identifier for the run
            status: New status (running, completed, failed)
            error_message: Error message if status is failed
        """
        if run_id not in self.active_runs:
            logger.warning(f"Run {run_id} not found in active runs")
            return
            
        run = self.active_runs[run_id]
        run.status = status
        
        if error_message:
            run.error_message = error_message
            
        if status in ["completed", "failed"]:
            run.end_time = datetime.utcnow()
            if run.start_time:
                run.duration = int((run.end_time - run.start_time).total_seconds() * 1000)
        
        self._update_run_in_db(run)
        logger.info(f"Updated run {run_id} status to {status}")
    
    def finish_run(self, run_id: str, output_data: Optional[Dict[str, Any]] = None, 
                   status: str = "completed", error_message: Optional[str] = None):
        """
        Finish tracking an experimental run
        
        Args:
            run_id: Unique identifier for the run
            output_data: Output data or results
            status: Final status (completed, failed)
            error_message: Error message if failed
        """
        if run_id not in self.active_runs:
            logger.warning(f"Run {run_id} not found in active runs")
            return
            
        run = self.active_runs[run_id]
        run.output_summary = output_data
        run.status = status
        run.end_time = datetime.utcnow()
        
        if error_message:
            run.error_message = error_message
            
        if run.start_time:
            run.duration = int((run.end_time - run.start_time).total_seconds() * 1000)
        
        # Save final state to database
        self._update_run_in_db(run)
        
        # Remove from active runs
        del self.active_runs[run_id]
        
        logger.info(f"Finished tracking experiment run: {run_id} with status: {status}")
    
    def get_run(self, run_id: str) -> Optional[ExperimentRun]:
        """
        Get experiment run by ID
        
        Args:
            run_id: Unique identifier for the run
            
        Returns:
            ExperimentRun object or None if not found
        """
        # First check active runs
        if run_id in self.active_runs:
            return self.active_runs[run_id]
        
        # Then check database
        return self._get_run_from_db(run_id)
    
    def get_runs(self, 
                 workflow_id: Optional[str] = None,
                 user_id: Optional[str] = None,
                 status: Optional[str] = None,
                 limit: int = 100,
                 offset: int = 0) -> List[ExperimentRun]:
        """
        Get experiment runs with optional filtering
        
        Args:
            workflow_id: Filter by workflow ID
            user_id: Filter by user ID
            status: Filter by status
            limit: Maximum number of runs to return
            offset: Number of runs to skip
            
        Returns:
            List of ExperimentRun objects
        """
        return self._get_runs_from_db(workflow_id, user_id, status, limit, offset)
    
    def _generate_config_hash(self, config: Dict[str, Any]) -> str:
        """Generate a hash of the configuration for reproducibility"""
        config_str = json.dumps(config, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(config_str.encode()).hexdigest()[:16]
    
    def _capture_environment(self) -> Dict[str, Any]:
        """Capture current environment information"""
        env_info = {
            "python_version": os.popen("python --version").read().strip(),
            "platform": os.popen("uname -a").read().strip(),
            "working_directory": os.getcwd(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Try to get conda/pip environment info
        try:
            conda_info = os.popen("conda info --json").read()
            if conda_info:
                env_info["conda_info"] = json.loads(conda_info)
        except:
            pass
            
        try:
            pip_freeze = os.popen("pip freeze").read()
            if pip_freeze:
                env_info["pip_packages"] = pip_freeze.strip().split('\n')
        except:
            pass
            
        return env_info
    
    def _get_git_commit_hash(self) -> Optional[str]:
        """Get current git commit hash if available"""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        return None
    
    def _save_run_to_db(self, run: ExperimentRun):
        """Save experiment run to database"""
        # TODO: Implement database save logic
        # This will be implemented when we have the database connection
        logger.debug(f"Saving run to database: {run.id}")
        pass
    
    def _update_run_in_db(self, run: ExperimentRun):
        """Update experiment run in database"""
        # TODO: Implement database update logic
        logger.debug(f"Updating run in database: {run.id}")
        pass
    
    def _get_run_from_db(self, run_id: str) -> Optional[ExperimentRun]:
        """Get experiment run from database"""
        # TODO: Implement database query logic
        logger.debug(f"Getting run from database: {run_id}")
        return None
    
    def _get_runs_from_db(self, 
                         workflow_id: Optional[str] = None,
                         user_id: Optional[str] = None,
                         status: Optional[str] = None,
                         limit: int = 100,
                         offset: int = 0) -> List[ExperimentRun]:
        """Get experiment runs from database with filtering"""
        # TODO: Implement database query logic
        logger.debug(f"Getting runs from database with filters")
        return []

# Global instance
provenance_logger = ProvenanceLogger()