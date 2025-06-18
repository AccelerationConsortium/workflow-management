/**
 * Mock LLM Client Implementation
 * 
 * Provides realistic mock responses for development and testing
 * Maintains the same interface as real LLM clients
 */

import { BaseLLMClient, LLMMessage, LLMResponse, LLMConfig } from './LLMClient';

export class MockLLMClient extends BaseLLMClient {
  private responseTemplates: Map<string, string[]>;

  constructor(config: LLMConfig) {
    super(config);
    this.initializeResponseTemplates();
  }

  private initializeResponseTemplates(): void {
    this.responseTemplates = new Map([
      // Workflow generation responses
      ['workflow', [
        `Based on your request, I'll create a workflow with the following steps:

1. **Sample Preparation**: Add the specified volume of liquid
2. **Temperature Control**: Heat to the target temperature
3. **Timing Control**: Maintain conditions for the specified duration
4. **Analysis**: Perform the requested measurement

Here's the structured workflow:

\`\`\`json
{
  "operations": [
    {
      "type": "add_liquid",
      "parameters": {
        "volume": 10,
        "chemical": "H2O",
        "container": "reaction_vessel"
      }
    },
    {
      "type": "heat",
      "parameters": {
        "temperature": 60,
        "duration": 300,
        "ramp_rate": 5
      }
    },
    {
      "type": "cv_test",
      "parameters": {
        "start_voltage": -1.0,
        "end_voltage": 1.0,
        "scan_rate": 50
      }
    }
  ]
}
\`\`\`

This workflow will safely execute your experimental procedure with proper parameter validation.`,

        `I understand you want to create an experimental workflow. Let me break this down into executable steps:

**Workflow Analysis:**
- Liquid handling operations detected
- Temperature control required
- Electrochemical analysis requested

**Generated Workflow:**

\`\`\`json
{
  "operations": [
    {
      "type": "prepare_solution",
      "parameters": {
        "volume": 5,
        "concentration": 0.1,
        "solvent": "buffer"
      }
    },
    {
      "type": "stir",
      "parameters": {
        "speed": 300,
        "duration": 120
      }
    },
    {
      "type": "lsv",
      "parameters": {
        "start_voltage": 0.0,
        "end_voltage": 1.5,
        "scan_rate": 100
      }
    }
  ]
}
\`\`\`

The workflow includes safety checks and optimized parameters for your experimental conditions.`
      ]],

      // Parameter analysis responses
      ['parameters', [
        `I've analyzed the experimental parameters in your request:

**Extracted Parameters:**
- Temperature: 80°C (within safe operating range)
- Duration: 30 minutes (appropriate for this reaction type)
- Volume: 10 mL (standard laboratory scale)
- Scan rate: 50 mV/s (optimal for CV analysis)

**Parameter Relationships:**
- Temperature and duration are linked for thermal stability
- Volume affects heating time and uniformity
- Scan rate determines resolution vs. speed trade-off

**Recommendations:**
- Consider ramping temperature gradually (5°C/min)
- Monitor solution for any precipitation
- Ensure proper electrode conditioning before CV`,

        `Parameter analysis complete. Here are the key relationships I identified:

**Primary Parameters:**
- Flow rate: 2 mL/min (compatible with system limits)
- Pressure: 1.2 bar (within safe operating range)
- Temperature: 25°C (ambient conditions)

**Dependencies:**
- Flow rate affects mixing efficiency
- Pressure must be maintained for consistent flow
- Temperature stability critical for reproducible results

**Validation:**
All parameters are within acceptable ranges for your equipment configuration.`
      ]],

      // Error analysis responses
      ['error', [
        `I've identified the issue in your workflow:

**Problem Analysis:**
The error appears to be related to parameter compatibility between connected operations.

**Root Cause:**
- Output type mismatch between operations
- Missing required parameter validation
- Insufficient resource allocation

**Suggested Solutions:**
1. Add a data conversion step between incompatible operations
2. Verify all required parameters are specified
3. Check equipment availability and capacity

**Implementation:**
Consider adding a "format_data" operation to convert between data types, or modify the source operation to output the expected format.`,

        `Error analysis complete. Here's what I found:

**Issue Type:** Resource Constraint
**Severity:** Medium

**Details:**
The workflow requires more concurrent resources than currently available.

**Resolution Options:**
1. **Sequential Execution**: Modify workflow to run operations in sequence
2. **Resource Optimization**: Use alternative equipment with higher capacity
3. **Batch Processing**: Split large operations into smaller batches

**Recommended Action:**
Implement sequential execution with proper timing controls to ensure reliable operation.`
      ]],

      // General assistance responses
      ['general', [
        `I'm here to help you with laboratory workflow automation. I can assist with:

- **Workflow Generation**: Convert natural language descriptions into executable workflows
- **Parameter Optimization**: Analyze and optimize experimental parameters
- **Error Diagnosis**: Identify and resolve workflow issues
- **Equipment Integration**: Help configure operations for your specific equipment

What would you like to work on today?`,

        `I understand you're working on laboratory automation. Here are some ways I can help:

**Workflow Design:**
- Convert experimental procedures into structured workflows
- Optimize parameter relationships and dependencies
- Ensure safety and compliance requirements

**Technical Support:**
- Troubleshoot workflow execution issues
- Recommend equipment configurations
- Validate experimental parameters

Feel free to describe your experimental needs in natural language, and I'll help create the appropriate workflow.`
      ]]
    ]);
  }

  async chat(messages: LLMMessage[]): Promise<LLMResponse> {
    const startTime = Date.now();
    
    // Simulate processing delay
    await this.delay(800 + Math.random() * 1200);
    
    const lastMessage = messages[messages.length - 1];
    const content = this.generateMockResponse(lastMessage.content);
    
    const processingTime = Date.now() - startTime;
    
    return {
      content,
      usage: {
        promptTokens: this.estimateTokens(messages.map(m => m.content).join(' ')),
        completionTokens: this.estimateTokens(content),
        totalTokens: this.estimateTokens(messages.map(m => m.content).join(' ') + content)
      },
      model: 'mock-llm-v1',
      finishReason: 'stop',
      processingTime
    };
  }

  private generateMockResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    
    // Determine response category based on input content
    let category = 'general';
    
    if (this.containsWorkflowKeywords(input)) {
      category = 'workflow';
    } else if (this.containsParameterKeywords(input)) {
      category = 'parameters';
    } else if (this.containsErrorKeywords(input)) {
      category = 'error';
    }
    
    // Get random response from category
    const templates = this.responseTemplates.get(category) || this.responseTemplates.get('general')!;
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return randomTemplate;
  }

  private containsWorkflowKeywords(input: string): boolean {
    const workflowKeywords = [
      'workflow', 'experiment', 'procedure', 'steps', 'operations',
      'add', 'mix', 'heat', 'stir', 'measure', 'analyze', 'perform',
      'then', 'after', 'before', 'next', 'first', 'second'
    ];
    
    return workflowKeywords.some(keyword => input.includes(keyword));
  }

  private containsParameterKeywords(input: string): boolean {
    const parameterKeywords = [
      'parameter', 'temperature', 'volume', 'concentration', 'time',
      'speed', 'rate', 'pressure', 'voltage', 'current',
      '°c', 'ml', 'μl', 'mm', 'rpm', 'mv/s', 'minutes', 'seconds'
    ];
    
    return parameterKeywords.some(keyword => input.includes(keyword));
  }

  private containsErrorKeywords(input: string): boolean {
    const errorKeywords = [
      'error', 'problem', 'issue', 'fail', 'wrong', 'broken',
      'not working', 'help', 'fix', 'debug', 'troubleshoot'
    ];
    
    return errorKeywords.some(keyword => input.includes(keyword));
  }

  private estimateTokens(text: string): number {
    // Simple token estimation: roughly 4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Test connection (always succeeds for mock)
   */
  async testConnection(): Promise<boolean> {
    await this.delay(500);
    return true;
  }

  /**
   * Get mock model information
   */
  async getModelInfo(): Promise<any> {
    return {
      model: 'mock-llm-v1',
      provider: 'mock',
      capabilities: ['text-generation', 'workflow-analysis', 'parameter-optimization'],
      maxTokens: 4096,
      languages: ['en', 'zh'],
      version: '1.0.0'
    };
  }
}
