import React, { useState, useEffect, useRef } from 'react';
import { searchService } from '../services/searchService';
import { nlpWorkflowService } from '../services/nlpWorkflowService';
import './SearchPanel.css';
import './EnhancedSearchPanel.css';
import { primitiveService } from '../services/primitiveService';
import { DevicePrimitive, ControlDetail } from '../types/primitive';
import { OperationNode, Device } from '../types/workflow';
import { PrimitiveConfigDialog } from './PrimitiveConfigDialog';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nodeType: string) => void;
  onWorkflowGenerated?: (workflowJson: any) => void; // Callback for AI-generated workflows
}

interface SearchResult {
  type: string;
  label: string;
  category: string;
  description: string;
  score: number;
  devices?: {
    manufacturer: string;
    model: string;
  }[];
}

export const EnhancedSearchPanel: React.FC<SearchPanelProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  onWorkflowGenerated 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPrimitive, setSelectedPrimitive] = useState<DevicePrimitive | null>(null);
  const [controlDetails, setControlDetails] = useState<ControlDetail | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  
  // NLP workflow generation states
  const [isGeneratingWorkflow, setIsGeneratingWorkflow] = useState(false);
  const [nlpMode, setNlpMode] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [usingMockServer, setUsingMockServer] = useState(false);

  // 当面板打开时聚焦输入框并清空搜索
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm('');
      setResults([]);
      setActiveIndex(0);
      setNlpMode(false);
      setGenerationError(null);
    }
  }, [isOpen]);

  // Detect if user input looks like natural language for workflow generation
  const detectNaturalLanguage = (input: string): boolean => {
    const nlpIndicators = [
      // Action words
      'add', 'mix', 'heat', 'stir', 'wait', 'perform', 'measure', 'transfer',
      'incubate', 'centrifuge', 'pipette', 'wash', 'dilute', 'prepare',
      // Temporal words
      'then', 'after', 'before', 'next', 'finally', 'first', 'second',
      'for', 'during', 'until', 'while',
      // Units and measurements
      'ml', 'μl', '°c', 'rpm', 'minutes', 'seconds', 'hours',
      'mV/s', 'cycles'
    ];
    
    const hasMultipleWords = input.trim().split(' ').length >= 3;
    const hasNlpIndicators = nlpIndicators.some(indicator => 
      input.toLowerCase().includes(indicator)
    );
    const hasNoFilterSyntax = !input.includes('@');
    
    return hasMultipleWords && hasNlpIndicators && hasNoFilterSyntax;
  };

  // 处理搜索
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setNlpMode(false);
      return;
    }

    // Check if input looks like natural language
    const isNaturalLanguage = detectNaturalLanguage(searchTerm);
    setNlpMode(isNaturalLanguage);

    if (!isNaturalLanguage) {
      // 解析搜索语法并执行搜索
      const searchOptions = searchService.parseSearchString(searchTerm);
      const searchResults = searchService.searchNodes(searchOptions);
      setResults(searchResults);
      setActiveIndex(0);
    } else {
      // Clear normal search results when in NLP mode
      setResults([]);
    }
  }, [searchTerm]);

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (nlpMode) {
          e.preventDefault();
          handleGenerateWorkflow();
        } else if (results[activeIndex]) {
          onSelect(results[activeIndex].type);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
      case 'Tab':
        e.preventDefault();
        // 实现智能补全
        if (results.length > 0 && activeIndex >= 0) {
          const activeResult = results[activeIndex];
          if (activeResult.devices && activeResult.devices.length > 0) {
            const device = activeResult.devices[0];
            setSearchTerm(prev => `${prev} @device:${device.manufacturer}`);
          }
        }
        break;
    }
  };

  // Generate workflow from natural language
  const handleGenerateWorkflow = async () => {
    if (!searchTerm.trim() || isGeneratingWorkflow) return;
    
    setIsGeneratingWorkflow(true);
    setGenerationError(null);
    
    try {
      // Check if we're using mock server
      const isServerAvailable = await nlpWorkflowService.checkServiceHealth();
      setUsingMockServer(!isServerAvailable);
      
      if (!isServerAvailable) {
        console.log('AI agent server not available, will use mock fallback');
      }
      
      // Use the NLP workflow service
      const result = await nlpWorkflowService.generateWorkflow({
        text: searchTerm,
        language: 'en',
        model_type: 'mock', // Can be configured
        include_suggestions: true,
        optimize_layout: true,
        register_custom_uos: false
      });
      
      if (result.success && result.workflow_json) {
        // Validate the workflow structure
        const validation = nlpWorkflowService.validateWorkflowStructure(result.workflow_json);
        
        if (!validation.valid) {
          setGenerationError(`Invalid workflow structure: ${validation.errors.join(', ')}`);
          return;
        }
        
        // Call the callback to load the workflow into Canvas
        if (onWorkflowGenerated) {
          onWorkflowGenerated(result.workflow_json);
        }
        
        // Show success message with summary
        const summary = nlpWorkflowService.getExecutionSummary(result.workflow_json);
        console.log('Generated workflow summary:', summary);
        
        onClose();
      } else {
        setGenerationError(result.error || 'Failed to generate workflow');
      }
      
    } catch (error) {
      console.error('Workflow generation error:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingWorkflow(false);
    }
  };

  // 当选择了节点和设备时
  const handleDeviceSelection = async (node: OperationNode, device: Device) => {
    try {
      // 1. 查找兼容的原语
      const compatiblePrimitives = await primitiveService.findCompatiblePrimitives(
        node,
        device
      );

      if (compatiblePrimitives.length > 0) {
        // 2. 默认选择第一个兼容的原语
        const primitive = compatiblePrimitives[0];
        setSelectedPrimitive(primitive);

        // 3. 获取控制细节
        const details = await primitiveService.getControlDetails(primitive.id);
        setControlDetails(details);

        // 4. 显示配置对话框
        setShowConfigDialog(true);
      }
    } catch (error: unknown) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel enhanced-search" onClick={e => e.stopPropagation()}>
        <div className="search-panel-header">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={nlpMode ? 
              "Describe your workflow in English... (e.g., 'Add 10ml water, heat to 60°C, then perform CV test')" :
              "Search operations... (@device:Tecan @format:96-well)"
            }
            className={`search-input ${nlpMode ? 'nlp-mode' : ''}`}
          />
        </div>
        
        {searchTerm && nlpMode && (
          <div className="nlp-mode-indicator">
            <span className="nlp-icon">🤖</span>
            <span>AI Workflow Mode</span>
            {usingMockServer && (
              <span className="mock-indicator">📝 Mock Mode</span>
            )}
            <button 
              className="generate-button"
              onClick={handleGenerateWorkflow}
              disabled={isGeneratingWorkflow}
            >
              {isGeneratingWorkflow ? 'Generating...' : 'Generate Workflow'}
            </button>
          </div>
        )}
        
        {searchTerm && !nlpMode && (
          <div className="search-syntax-help">
            <span>Filters:</span>
            <code>@device:manufacturer</code>
            <code>@format:plate-format</code>
            <code>@volume:min-max</code>
            <code>@category:type</code>
          </div>
        )}

        <div className="search-results">
          {nlpMode && searchTerm && (
            <div className="nlp-preview">
              <div className="nlp-preview-header">
                <span className="nlp-icon">🧠</span>
                <h3>AI Workflow Generation</h3>
              </div>
              <div className="nlp-preview-content">
                <p><strong>Input:</strong> {searchTerm}</p>
                {isGeneratingWorkflow && (
                  <div className="generating-status">
                    <div className="spinner"></div>
                    <span>
                      {usingMockServer 
                        ? 'Using local mock server to generate workflow...' 
                        : 'Analyzing your description and generating workflow...'
                      }
                    </span>
                  </div>
                )}
                {generationError && (
                  <div className="generation-error">
                    <span className="error-icon">⚠️</span>
                    <span>{generationError}</span>
                    <div className="error-help">
                      <p>💡 <strong>Troubleshooting:</strong></p>
                      <ul>
                        <li>Start AI agent server: <code>cd backend/agent_workflow_builder && python -m api.workflow_api</code></li>
                        <li>Or continue with local mock mode for testing</li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className="nlp-help">
                  <p><strong>Tips for better results:</strong></p>
                  <ul>
                    <li>Use specific volumes (e.g., "10ml", "5μl")</li>
                    <li>Include temperatures (e.g., "60°C", "room temperature")</li>
                    <li>Specify durations (e.g., "5 minutes", "30 seconds")</li>
                    <li>Mention sequential steps (e.g., "then", "after", "finally")</li>
                    <li>Include operation types (e.g., "CV test", "stir", "heat")</li>
                  </ul>
                  <div className="example-inputs">
                    <p><strong>Example inputs:</strong></p>
                    <div 
                      className="example-input"
                      onClick={() => setSearchTerm("Add 15ml NaOH solution, heat to 80°C for 10 minutes, then perform CV test")}
                    >
                      "Add 15ml NaOH solution, heat to 80°C for 10 minutes, then perform CV test"
                    </div>
                    <div 
                      className="example-input"
                      onClick={() => setSearchTerm("Mix 5ml water with sample, stir for 2 minutes at 300rpm")}
                    >
                      "Mix 5ml water with sample, stir for 2 minutes at 300rpm"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!nlpMode && results.length === 0 && searchTerm && (
            <div className="no-results">
              <div className="no-results-content">
                <span>No matching operations found</span>
                <p>Try using natural language to describe your workflow instead!</p>
                <div className="nlp-suggestion">
                  <span>💡 Example: "Add 10ml water, heat to 60°C for 5 minutes"</span>
                </div>
              </div>
            </div>
          )}
          
          {!nlpMode && results.map((result, index) => (
            <div
              key={result.type}
              className={`search-result ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                onSelect(result.type);
                onClose();
              }}
            >
              <div className="result-header">
                <span className="result-label">{result.label}</span>
                <span className="result-category">{result.category}</span>
              </div>
              <div className="result-description">{result.description}</div>
              {result.devices && result.devices.length > 0 && (
                <div className="result-devices">
                  {result.devices.map(device => (
                    <span 
                      key={`${device.manufacturer}-${device.model}`} 
                      className="device-tag"
                    >
                      {device.manufacturer} {device.model}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {selectedPrimitive && controlDetails && (
          <PrimitiveConfigDialog
            primitive={selectedPrimitive}
            controlDetails={controlDetails}
            onConfirm={(config) => {
              // Handle config confirmation
              console.log('Config confirmed:', config);
              setShowConfigDialog(false);
            }}
            onCancel={() => setShowConfigDialog(false)}
          />
        )}
      </div>
    </div>
  );
};