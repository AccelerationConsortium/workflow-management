# Canvas Integrations

This directory contains pluggable integration modules for the Canvas workflow management system.

## Available Integrations

### N8N Connector

A bidirectional integration bridge between Canvas and n8n workflow automation platform.

**Features:**
- Send experiment notifications, alerts, and reports to n8n
- Receive experiment triggers and control commands from n8n  
- Secure webhook handling with signature verification
- Comprehensive error handling and retry logic
- Event logging and monitoring

**Location:** `n8n_connector/`

**Documentation:** [n8n_connector/README.md](n8n_connector/README.md)

## Integration Architecture

Each integration module is designed to be:

- **Pluggable**: Easy to add/remove without affecting core Canvas functionality
- **Configurable**: Environment-based configuration with sensible defaults
- **Testable**: Comprehensive test suite with mocks for external dependencies
- **Documented**: Clear documentation with usage examples
- **Secure**: Authentication and signature verification where applicable

## Adding New Integrations

To add a new integration module:

1. **Create Module Directory**
   ```
   integrations/your_integration/
   ├── __init__.py
   ├── config.py          # Configuration management
   ├── client.py          # Outbound communication
   ├── router.py          # Inbound webhooks (if applicable)
   ├── utils.py           # Common utilities
   ├── README.md          # Documentation
   ├── requirements.txt   # Dependencies
   ├── tests/             # Test suite
   ├── examples/          # Usage examples
   └── templates/         # Payload templates (if applicable)
   ```

2. **Follow Naming Conventions**
   - Use snake_case for module names
   - Prefix classes with the service name (e.g., `N8NClient`, `SlackRouter`)
   - Use clear, descriptive function names

3. **Implement Standard Interface**
   ```python
   # client.py - for outbound communication
   class YourServiceClient:
       async def send_notification(self, payload): pass
       async def send_alert(self, alert): pass
   
   # router.py - for inbound webhooks  
   def create_your_service_router(services): 
       return APIRouter()
   ```

4. **Add Configuration Support**
   ```python
   # config.py
   class YourServiceConfig:
       def __init__(self):
           self.api_url = os.getenv("YOUR_SERVICE_URL")
           self.api_key = os.getenv("YOUR_SERVICE_API_KEY")
       
       def validate_config(self): pass
   ```

5. **Write Tests**
   - Unit tests for all components
   - Integration tests with mocked services
   - Test configuration validation
   - Test error handling scenarios

6. **Document Usage**
   - README with installation and configuration
   - Code examples for common use cases
   - API reference documentation
   - Troubleshooting guide

## Configuration

Each integration should support environment-based configuration:

```bash
# .env file
YOUR_SERVICE_URL=https://api.yourservice.com
YOUR_SERVICE_API_KEY=your_api_key_here
YOUR_SERVICE_TIMEOUT=30
YOUR_SERVICE_RETRY_ATTEMPTS=3
```

## Testing Integrations

Run tests for all integrations:

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run all integration tests
pytest integrations/

# Run specific integration tests
pytest integrations/n8n_connector/tests/

# Run with coverage
pytest --cov=integrations integrations/
```

## Security Considerations

- **API Keys**: Store in environment variables, never commit to code
- **Webhooks**: Implement signature verification for inbound requests
- **HTTPS**: Use HTTPS for all external communication
- **Rate Limiting**: Implement rate limiting for outbound requests
- **Input Validation**: Validate all inbound webhook payloads
- **Logging**: Log security events without exposing sensitive data

## Error Handling

Integrations should implement robust error handling:

- **Network Errors**: Retry with exponential backoff
- **Authentication Errors**: Clear error messages and logging
- **Rate Limiting**: Respect service rate limits with backoff
- **Payload Errors**: Validate payloads and provide clear error messages
- **Service Unavailable**: Graceful degradation when external services are down

## Monitoring and Logging

Each integration should provide:

- **Health Checks**: Endpoint to verify integration status
- **Event Logging**: Log all communication events for debugging
- **Metrics**: Track success/failure rates, response times
- **Alerts**: Notify operators of integration failures

## Examples

See the `examples/` directory in each integration for:

- Basic usage patterns
- FastAPI application integration
- Error handling scenarios
- Configuration examples
- Testing strategies

## Support

For integration-specific support, see the README in each module directory.

For general integration framework questions, see the main Canvas documentation.