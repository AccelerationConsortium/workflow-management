interface LLMSuggestion {
  suggestion: string;
  confidence: number;
  alternatives?: string[];
  explanation?: string;
}

export class LLMService {
  // 模拟 LLM API 调用
  private async queryLLM(prompt: string): Promise<string> {
    // TODO: 实际项目中这里会调用真实的 LLM API
    // 现在用模拟响应演示功能
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟延迟
    return this.getMockResponse(prompt);
  }

  async getWorkflowSuggestion(error: any): Promise<LLMSuggestion> {
    const prompt = `Given the workflow validation error: ${JSON.stringify(error)}, 
                   suggest how to fix it.`;
    
    const response = await this.queryLLM(prompt);
    return JSON.parse(response);
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes('type mismatch')) {
      return JSON.stringify({
        suggestion: "Consider adding a type conversion node between these components",
        confidence: 0.85,
        alternatives: [
          "Modify the output type of the source node",
          "Use a data transformation primitive"
        ],
        explanation: "The type mismatch can be resolved by converting the data format. For example, if you're passing a CSV to a component expecting a float, you should first extract the specific value needed."
      });
    }
    
    if (prompt.includes('resource')) {
      return JSON.stringify({
        suggestion: "Check if alternative resources can be used",
        confidence: 0.75,
        alternatives: [
          "Split the operation into smaller batches",
          "Schedule the workflow for when resources are available"
        ],
        explanation: "Resource constraints can often be resolved by either using alternative resources or modifying the workflow to use resources more efficiently."
      });
    }

    return JSON.stringify({
      suggestion: "Review the workflow configuration",
      confidence: 0.6,
      explanation: "Unable to provide specific suggestions without more context."
    });
  }
} 