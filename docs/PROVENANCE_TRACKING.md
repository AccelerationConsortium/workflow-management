# Provenance Tracking System

## Overview

The Provenance Tracking System automatically records metadata for each experimental run, enabling reproducibility, auditability, and lineage tracking. Inspired by Lamin's track() design, this module captures comprehensive experiment context without requiring manual intervention.

## Features

### 🔍 Automatic Metadata Capture
- **Experiment Context**: User, workflow version, timestamp
- **Input & Output Data**: Parameters, files, results
- **Execution Environment**: Python/Conda environment, Git commit hash
- **Transformation Steps**: Algorithm names, function identifiers, runtime duration

### 📊 Data Storage & Retrieval
- PostgreSQL database with optimized indexing
- RESTful API endpoints for accessing run data
- Frontend UI components for visualizing run history

### 🔗 Workflow Integration
- Seamless integration with existing SDL Catalyst executor
- Automatic provenance tracking without code changes
- WebSocket updates for real-time status monitoring

## Architecture

### Backend Components

#### 1. Data Model (`server/prisma/schema.prisma`)
```prisma
model ExperimentRun {
  id              String   @id @default(uuid())
  userId          String?
  workflowId      String
  configHash      String
  inputSummary    Json?
  outputSummary   Json?
  functionName    String?
  environment     Json?
  gitCommitHash   String?
  triggerSource   String?
  status          String   @default("pending")
  startTime       DateTime @default(now())
  endTime         DateTime?
  duration        Int?
  errorMessage    String?
  metadata        Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### 2. Provenance Logger Service (`backend/services/provenance_logger.py`)
Core service that handles experiment run tracking:

```python
class ProvenanceLogger:
    def start_run(self, workflow_id, workflow_config, **kwargs) -> str
    def update_run_status(self, run_id, status, error_message=None)
    def finish_run(self, run_id, output_data=None, status="completed")
    def get_run(self, run_id) -> Optional[ExperimentRun]
    def get_runs(self, **filters) -> List[ExperimentRun]
```

#### 3. API Endpoints (`backend/api/experiment_runs_api.py`)
RESTful endpoints for accessing provenance data:

- `GET /api/runs` - List experiment runs with filtering
- `GET /api/runs/{id}` - Get specific run details
- `GET /api/runs/{id}/summary` - Get run summary
- `GET /api/runs/{id}/logs` - Get run execution logs
- `GET /api/runs/workflow/{workflow_id}/runs` - Get workflow runs
- `GET /api/runs/stats/summary` - Get run statistics

### Frontend Components

#### 1. Provenance History Panel (`src/components/ProvenanceHistoryPanel.tsx`)
React component for displaying experiment run history:

- Real-time run status updates
- Detailed run information dialogs
- Search and filtering capabilities
- Integration with workflow execution

#### 2. Provenance Service (`src/services/provenanceService.ts`)
TypeScript service for API communication:

```typescript
class ProvenanceService {
  async getRuns(filter?: RunsFilter): Promise<ExperimentRunsResponse>
  async getRun(runId: string): Promise<ExperimentRun>
  async getRunLogs(runId: string): Promise<RunLogs>
  async getRunStatistics(): Promise<RunStatistics>
}
```

## Database Schema

### Tables Created

1. **experiment_runs** - Main provenance data table
2. **Indexes** - Optimized for common query patterns:
   - `idx_experiment_runs_workflow_id`
   - `idx_experiment_runs_user_id`
   - `idx_experiment_runs_status`
   - `idx_experiment_runs_start_time`

### Migration Script
Located at: `deployment/migrations/002_create_experiment_runs.sql`

## Integration Points

### SDL Catalyst Executor Integration
The provenance tracking is automatically integrated into the workflow execution:

```python
# In SDLCatalystExecutor.execute_task()
run_id = provenance_logger.start_run(
    workflow_id=workflow_id,
    workflow_config=workflow_config,
    user_id=config.parameters.get("user_id"),
    trigger_source="workflow_api",
    function_name=config.task_type,
    input_data=config.parameters
)

# On completion
provenance_logger.finish_run(
    run_id=run_id,
    output_data=result,
    status="completed"
)
```

### UI Integration
The Provenance History Panel is integrated into the main Control Panel:

- Accessible via the "📋 Experiment Runs" accordion
- Real-time updates during workflow execution
- Detailed view dialogs for run inspection

## API Usage Examples

### Get Recent Runs
```bash
GET /api/runs?limit=20&status=completed
```

### Get Workflow Runs
```bash
GET /api/runs?workflow_id=sdl_wf_123&limit=50
```

### Get Run Details
```bash
GET /api/runs/550e8400-e29b-41d4-a716-446655440000
```

### Get Run Statistics
```bash
GET /api/runs/stats/summary
```

## Configuration Hash

Each experiment run includes a `configHash` field that uniquely identifies the configuration used:

- Generated from workflow configuration JSON
- Enables identification of identical experiment setups
- Useful for reproducibility and comparison

## Environment Capture

The system automatically captures:

- Python version and environment
- Conda/pip package information
- Git commit hash (if available)
- System platform information
- Working directory

## Error Handling

- Failed runs are tracked with error messages
- Partial execution data is preserved
- Cleanup handling for interrupted runs

## Testing

Test suite located at: `backend/tests/test_provenance_tracking.py`

Run tests with:
```bash
cd backend
python -m pytest tests/test_provenance_tracking.py -v
```

## Future Enhancements

1. **Database Integration**: Complete implementation of database storage methods
2. **Advanced Search**: Server-side search and filtering
3. **Data Lineage**: Track data dependencies between runs
4. **Export Functionality**: Export run data in various formats
5. **Notification System**: Alerts for failed or long-running experiments
6. **Performance Metrics**: Detailed performance tracking and analysis

## Security Considerations

- User authentication for run access control
- Sensitive data filtering in environment capture
- Secure handling of configuration data
- Access logging for audit trails

## Deployment Notes

1. Run database migration: `002_create_experiment_runs.sql`
2. Update environment variables for database connection
3. Restart backend services to load new modules
4. Frontend components are automatically available after build

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **Missing Dependencies**: Install required Python packages
3. **Frontend Build**: Rebuild frontend after adding new components
4. **API Endpoints**: Verify router registration in main API module

### Debug Mode

Enable debug logging in the provenance logger:
```python
import logging
logging.getLogger('backend.services.provenance_logger').setLevel(logging.DEBUG)
```

## Contributing

When contributing to the provenance tracking system:

1. Follow existing code patterns and naming conventions
2. Add tests for new functionality
3. Update documentation for API changes
4. Consider performance impact of new features
5. Maintain backward compatibility