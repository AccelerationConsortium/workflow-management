/**
 * NLP Search Demo Component
 * 
 * Demonstrates the integrated Command+P search with NLP workflow generation
 */

import React, { useState } from 'react';
import { EnhancedSearchPanel } from './EnhancedSearchPanel';
import './EnhancedSearchPanel.css';

export const NLPSearchDemo: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lastGeneratedWorkflow, setLastGeneratedWorkflow] = useState<any>(null);

  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMacCmd = e.metaKey && !e.ctrlKey;
      const isCtrl = e.ctrlKey && !e.metaKey;

      if ((isMacCmd || isCtrl) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNodeSelect = (nodeType: string) => {
    console.log('Selected node:', nodeType);
    alert(`Selected node: ${nodeType}`);
  };

  const handleWorkflowGenerated = (workflowJson: any) => {
    console.log('Generated workflow:', workflowJson);
    setLastGeneratedWorkflow(workflowJson);
    
    // Here you would integrate with Canvas/ReactFlow
    // For demo purposes, we'll just show the workflow data
    alert(`Workflow generated successfully!\nSteps: ${workflowJson.execution?.total_steps || 0}\nDuration: ${workflowJson.execution?.estimated_duration || 0}s`);
  };

  const renderWorkflowSummary = () => {
    if (!lastGeneratedWorkflow) return null;

    const workflow = lastGeneratedWorkflow;
    const nodes = workflow.workflow?.nodes || [];
    const operationNodes = nodes.filter((node: any) => node.type === 'operationNode');

    return (
      <div className="workflow-summary">
        <h3>Last Generated Workflow</h3>
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Steps:</span>
            <span className="stat-value">{operationNodes.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Estimated Duration:</span>
            <span className="stat-value">{workflow.execution?.estimated_duration || 0}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Required Devices:</span>
            <span className="stat-value">{workflow.execution?.required_devices?.length || 0}</span>
          </div>
        </div>
        
        <div className="operation-list">
          <h4>Operations:</h4>
          {operationNodes.map((node: any, index: number) => (
            <div key={node.id} className="operation-item">
              <span className="operation-number">{index + 1}</span>
              <span className="operation-name">{node.data?.label || 'Unknown'}</span>
              <span className="operation-type">{node.data?.nodeType || ''}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="nlp-search-demo">
      <div className="demo-header">
        <h1>🤖 NLP-Enhanced Search Demo</h1>
        <p>Press <kbd>Cmd/Ctrl + P</kbd> to open the enhanced search panel with AI workflow generation</p>
      </div>

      <div className="demo-content">
        <div className="feature-section">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔍 Advanced Search</h3>
              <p>Search for operations using filters like @device:manufacturer, @category:type</p>
            </div>
            <div className="feature-card">
              <h3>🧠 AI Workflow Generation</h3>
              <p>Describe your experiment in natural language and get a complete workflow</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Smart Detection</h3>
              <p>Automatically detects when you're using natural language vs search filters</p>
            </div>
            <div className="feature-card">
              <h3>🎯 Integration Ready</h3>
              <p>Compatible with existing CustomUOService and Canvas system</p>
            </div>
          </div>
        </div>

        <div className="example-section">
          <h2>Try These Examples</h2>
          <div className="example-grid">
            <div className="example-card" onClick={() => setIsSearchOpen(true)}>
              <h4>Natural Language Examples:</h4>
              <ul>
                <li>"Add 10ml water, heat to 60°C for 5 minutes"</li>
                <li>"Perform CV test with 50mV/s scan rate"</li>
                <li>"Mix sample, stir for 2 minutes, then analyze"</li>
              </ul>
            </div>
            <div className="example-card" onClick={() => setIsSearchOpen(true)}>
              <h4>Search Filter Examples:</h4>
              <ul>
                <li>@device:Tecan @format:96-well</li>
                <li>@category:electrochemical @volume:1-100</li>
                <li>pipette @device:Hamilton</li>
              </ul>
            </div>
          </div>
        </div>

        {renderWorkflowSummary()}
      </div>

      <EnhancedSearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleNodeSelect}
        onWorkflowGenerated={handleWorkflowGenerated}
      />

      <style jsx>{`
        .nlp-search-demo {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .demo-header h1 {
          color: #1f2937;
          margin-bottom: 10px;
        }

        .demo-header p {
          color: #6b7280;
          font-size: 16px;
        }

        .demo-header kbd {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 14px;
        }

        .feature-section, .example-section {
          margin-bottom: 40px;
        }

        .feature-section h2, .example-section h2 {
          color: #1f2937;
          margin-bottom: 20px;
        }

        .feature-grid, .example-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .feature-card, .example-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .feature-card:hover, .example-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

        .feature-card h3, .example-card h4 {
          margin: 0 0 10px 0;
          color: #374151;
        }

        .feature-card p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .example-card ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }

        .example-card li {
          margin-bottom: 5px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        .workflow-summary {
          background: #f8f9ff;
          border: 1px solid #e0e7ff;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
        }

        .workflow-summary h3 {
          margin: 0 0 15px 0;
          color: #4c1d95;
        }

        .summary-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          padding: 10px 15px;
          border-radius: 6px;
          min-width: 100px;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #4c1d95;
        }

        .operation-list h4 {
          margin: 0 0 10px 0;
          color: #4c1d95;
        }

        .operation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #e0e7ff;
        }

        .operation-item:last-child {
          border-bottom: none;
        }

        .operation-number {
          width: 24px;
          height: 24px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .operation-name {
          flex: 1;
          font-weight: 500;
          color: #374151;
        }

        .operation-type {
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};