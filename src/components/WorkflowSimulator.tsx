import React, { useState } from 'react';
import { WorkflowValidator } from '../utils/validator';
import { ValidationResult } from '../types/validation';
import { getTopologicalOrder } from '../utils/topologicalSort';
import { simulateNodeExecution } from '../utils/nodeExecutor';
import { generateWorkflowReport, downloadCSV } from '../utils/reportGenerator';
import './WorkflowSimulator.css';

export const WorkflowSimulator: React.FC<{
  nodes: any[];
  edges: any[];
  onValidationComplete: (result: ValidationResult) => void;
}> = ({ nodes, edges, onValidationComplete }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const validator = new WorkflowValidator();

  const runSimulation = async () => {
    setIsSimulating(true);
    
    try {
      // 1. 验证工作流
      const validationResult = validator.validateWorkflow(nodes, edges);
      onValidationComplete(validationResult);
      
      if (validationResult.isValid) {
        // 2. 获取拓扑排序的节点
        const orderedNodes = getTopologicalOrder(nodes, edges);
        const results = [];

        // 3. 按顺序执行每个节点
        for (const node of orderedNodes) {
          console.log(`Simulating node: ${node.id}`);
          const result = await simulateNodeExecution(node);
          results.push(result);
        }

        setSimulationResults(results);

        // 4. 生成并下载报告
        const report = generateWorkflowReport(results);
        downloadCSV(report, 'workflow-simulation-report.csv');

        console.log('Simulation completed successfully');
      } else {
        console.error('Validation failed:', validationResult.errors);
      }
    } catch (error) {
      console.error('Simulation failed:', error);
      onValidationComplete({
        isValid: false,
        errors: [{
          nodeId: '',
          field: 'execution',
          message: `Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'data'
        }],
        warnings: []
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className={`workflow-simulator ${simulationResults.length > 0 ? 'success' : ''}`}>
      <button 
        onClick={runSimulation}
        disabled={isSimulating}
        className={isSimulating ? 'simulating' : ''}
      >
        {isSimulating ? (
          <>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
              />
            </svg>
            Simulating...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M8,5.14V19.14L19,12.14L8,5.14Z"
              />
            </svg>
            Run Simulation
          </>
        )}
      </button>
      
      {simulationResults.length > 0 && (
        <div className="simulation-results">
          <div className="result-count">
            {simulationResults.length} nodes executed
          </div>
        </div>
      )}
    </div>
  );
}; 