# N8N Connector

A pluggable bidirectional bridge between Canvas workflow system and n8n automation platform.

## Overview

The N8N Connector enables seamless integration between your Canvas laboratory automation system and n8n workflow automation. It provides:

- **Outbound Communication**: Send experiment status, alerts, and reports from Canvas to n8n
- **Inbound Triggers**: Receive experiment triggers, pause/resume commands, and user input from n8n
- **Secure Webhooks**: Signature verification and authentication for secure communication
- **Retry Logic**: Robust error handling with configurable retry mechanisms
- **Event Logging**: Comprehensive logging for debugging and audit trails

## Architecture

```
         ┌──────────────┐
         │   Slack / UI │
         └────┬─────────┘
              │
         ┌────▼────┐
         │   n8n   │◀────────────┐
         └────┬────┘             │
              │ Webhook/API      │
              ▼                  │
     ┌────────────────┐   ┌──────▼─────────┐
     │  n8n_connector  │◀──┤   Canvas Core  │
     └────────────────┘   └────────────────┘
           ▲      │
           │      ▼
  [POST to n8n]  [Webhook Handler]
```

## Installation

1. Install the connector in your Canvas project:
```bash
pip install -r requirements.txt  # Install dependencies
```

2. Add the connector to your Canvas application:
```python
from integrations.n8n_connector import create_n8n_router, N8NClient

# Add webhook routes to your FastAPI app
app.include_router(create_n8n_router(experiment_service, status_service))
```

## Configuration

Create a `.env` file or set environment variables:

```bash
# N8N Server Configuration
N8N_BASE_URL=https://n8n.mylab.io/webhook/
N8N_AUTH_TOKEN=your_n8n_auth_token_here

# Webhook Security
N8N_WEBHOOK_SECRET=your_webhook_secret_here

# Endpoints (optional - defaults provided)
N8N_NOTIFY_ENDPOINT=notify-experiment-status
N8N_ALERT_ENDPOINT=alert-human-intervention
N8N_REPORT_ENDPOINT=report-ready
N8N_ERROR_ENDPOINT=error-notification

# Retry Configuration
N8N_TIMEOUT=30
N8N_RETRY_ATTEMPTS=3
N8N_RETRY_DELAY=5

# Debugging
N8N_DEBUG_MODE=false
N8N_ENABLE_LOGGING=true
N8N_LOG_LEVEL=INFO
```

## Usage

### Sending Notifications from Canvas to N8N

```python
from integrations.n8n_connector import N8NClient, ExperimentInfo, ExperimentStatus

# Create experiment info
experiment = ExperimentInfo(
    experiment_id="exp_123",
    status=ExperimentStatus.COMPLETED,
    template_id="catalyst_test",
    started_by="researcher@lab.com",
    progress=100.0,
    results={"peak_current": 1.2}
)

# Send notification
async with N8NClient() as client:
    success = await client.notify_experiment_status(experiment)
    if success:
        print("Notification sent successfully")
```

### Sending Alerts

```python
from integrations.n8n_connector import N8NClient, NotificationLevel

async with N8NClient() as client:
    success = await client.send_alert(
        experiment_id="exp_123",
        alert_type="temperature_warning",
        message="Temperature exceeded safe limits (85°C)",
        level=NotificationLevel.WARNING,
        requires_action=True,
        suggested_actions=["Lower temperature", "Pause experiment"]
    )
```

### Using the Notification Builder

```python
from integrations.n8n_connector import N8NNotificationBuilder, ExperimentStatus

async with N8NClient() as client:
    # Build and send custom notification
    success = await (N8NNotificationBuilder()
                    .experiment("exp_123")
                    .status(ExperimentStatus.COMPLETED)
                    .summary("Custom experiment completed")
                    .add_metadata("duration", "45 minutes")
                    .add_metadata("yield", "92%")
                    .send_to(client, "custom-endpoint", "custom_event"))
```

### Handling N8N Webhooks

The router automatically handles incoming webhooks. Integrate with your services:

```python
from integrations.n8n_connector import create_n8n_router

# Your experiment service
class ExperimentService:
    async def start_experiment(self, template_id, parameters, triggered_by, metadata):
        # Start experiment logic
        return "exp_new_123"
    
    async def pause_experiment(self, experiment_id, reason=None):
        # Pause logic
        return True

# Your status service  
class StatusService:
    async def get_experiment_status(self, experiment_id):
        # Return ExperimentInfo object
        return experiment_info

# Create router with your services
experiment_service = ExperimentService()
status_service = StatusService()
router = create_n8n_router(experiment_service, status_service)

# Add to FastAPI app
app.include_router(router)
```

## API Endpoints

### Inbound Webhooks (from N8N to Canvas)

- `POST /api/v1/n8n/trigger-experiment` - Start new experiment
- `POST /api/v1/n8n/pause-experiment` - Pause running experiment  
- `POST /api/v1/n8n/resume-experiment` - Resume paused experiment
- `GET /api/v1/n8n/get-status` - Get experiment status
- `POST /api/v1/n8n/inject-user-input` - Inject user input
- `GET /api/v1/n8n/health` - Health check

### Outbound Webhooks (from Canvas to N8N)

Configure these endpoints in your N8N workflows:

- `{N8N_BASE_URL}/notify-experiment-status` - Experiment status updates
- `{N8N_BASE_URL}/alert-human-intervention` - Alerts requiring attention
- `{N8N_BASE_URL}/report-ready` - Report generation complete
- `{N8N_BASE_URL}/error-notification` - Error notifications

## Payload Examples

### Trigger Experiment (N8N → Canvas)

```json
{
  "template_id": "catalyst_test_basic",
  "parameters": {
    "temperature": 80,
    "duration": 300,
    "scan_rate": 50,
    "cycles": 3
  },
  "triggered_by": "slack_user:@alice",
  "priority": "normal",
  "metadata": {
    "project": "catalyst_screening",
    "batch": "batch_001"
  }
}
```

### Experiment Status (Canvas → N8N)

```json
{
  "experiment_id": "exp_123",
  "status": "completed",
  "timestamp": "2024-01-15T14:30:00Z",
  "summary": "CV test completed. Peak current = 1.2A",
  "level": "info",
  "metadata": {
    "template_id": "catalyst_test_basic",
    "started_by": "researcher@lab.com",
    "progress": 100.0,
    "duration": "30m 15s",
    "results": {
      "peak_current": 1.2,
      "cycles_completed": 3
    }
  }
}
```

### Alert Notification (Canvas → N8N)

```json
{
  "experiment_id": "exp_123",
  "alert_type": "temperature_warning",
  "message": "Temperature exceeded safe limits (85°C)",
  "level": "warning",
  "timestamp": "2024-01-15T14:30:00Z",
  "requires_action": true,
  "suggested_actions": [
    "Lower temperature to 75°C",
    "Pause experiment for inspection"
  ],
  "metadata": {
    "current_temperature": 85.2,
    "target_temperature": 80.0,
    "safety_limit": 85.0
  }
}
```

## Security

### Webhook Signature Verification

Enable signature verification for production:

1. Set `N8N_WEBHOOK_SECRET` in your environment
2. Configure n8n to send signatures in `x-n8n-signature` header
3. Signatures use HMAC-SHA256: `sha256={hex_digest}`

Example signature generation in n8n:
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', 'your_webhook_secret')
  .update(JSON.stringify(payload))
  .digest('hex');
headers['x-n8n-signature'] = `sha256=${signature}`;
```

### Authentication

For n8n server authentication, set `N8N_AUTH_TOKEN`:
```bash
N8N_AUTH_TOKEN=your_bearer_token
```

This adds `Authorization: Bearer {token}` to outbound requests.

## Testing

Run the test suite:

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest integrations/n8n_connector/tests/

# Run with coverage
pytest --cov=integrations.n8n_connector integrations/n8n_connector/tests/
```

### Manual Testing

1. **Test Configuration**:
```python
from integrations.n8n_connector.config import config
validation = config.validate_config()
print(validation)
```

2. **Test Connectivity**:
```python
from integrations.n8n_connector import N8NClient

async def test_connection():
    async with N8NClient() as client:
        # Send test notification
        success = await client.send_custom_notification(
            "test-endpoint", 
            {"test": "message"}, 
            "connectivity_test"
        )
        print(f"Connection test: {'PASS' if success else 'FAIL'}")

import asyncio
asyncio.run(test_connection())
```

## Error Handling

The connector includes comprehensive error handling:

- **Network Errors**: Automatic retry with exponential backoff
- **HTTP Errors**: Proper status code handling and logging
- **Validation Errors**: Clear error messages for malformed requests
- **Signature Errors**: Security validation with detailed logging

Monitor logs for integration health:

```python
import logging
logging.getLogger('integrations.n8n_connector').setLevel(logging.INFO)
```

## Advanced Features

### Custom Templates

Create custom payload templates in `templates/` directory using Jinja2:

```json
{
  "experiment_id": "{{ experiment_id }}",
  "custom_field": "{{ custom_value }}",
  "actions": [
    {% for action in actions %}
    {
      "label": "{{ action.label }}",
      "url": "{{ action.url }}"
    }{% if not loop.last %},{% endif %}
    {% endfor %}
  ]
}
```

### Event Logging

All communication events are logged for audit and debugging:

```python
from integrations.n8n_connector.utils import N8NUtils

# Custom event logging
N8NUtils.log_event(
    event_type="custom_integration",
    experiment_id="exp_123", 
    payload={"custom": "data"},
    direction="outbound"
)
```

### Retry Configuration

Customize retry behavior:

```python
from integrations.n8n_connector import N8NClient

client = N8NClient(custom_config={
    'retry_attempts': 5,
    'retry_delay': 10,
    'timeout': 60
})
```

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Verify `N8N_BASE_URL` is correct
   - Check n8n server is running and accessible
   - Validate network connectivity

2. **Authentication Failed**:
   - Verify `N8N_AUTH_TOKEN` is valid
   - Check token permissions in n8n

3. **Signature Verification Failed**:
   - Ensure `N8N_WEBHOOK_SECRET` matches n8n configuration
   - Verify signature generation in n8n workflow

4. **Webhook Not Receiving**:
   - Check webhook endpoint URLs
   - Verify Canvas server is accessible from n8n
   - Check firewall and routing configuration

### Debug Mode

Enable debug mode for verbose logging:

```bash
N8N_DEBUG_MODE=true
N8N_LOG_LEVEL=DEBUG
```

This disables signature verification and provides detailed request/response logging.

## Contributing

1. Follow the existing code structure
2. Add tests for new functionality
3. Update documentation for API changes
4. Use type hints and docstrings
5. Test with both mock and real n8n instances

## License

This module is part of the Canvas workflow management system.