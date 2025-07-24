import React, { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Slide,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { ParameterLinkagePanel } from './ParameterLinkagePanel';
import { VisualizationTemplateSelector } from './VisualizationTemplateSelector';
import { ShortcutHintPanel } from './ShortcutHintPanel';
import { OptimizerPanel } from './OptimizerPanel';
import { OperationHistoryPanel } from './OperationHistoryPanel';
import { ProvenanceHistoryPanel } from './ProvenanceHistoryPanel';
import { ParameterImpact } from '../services/parameterLinkageService';
import { VisualizationTemplate } from '../services/visualizationTemplateService';
import { OptimizationParameter } from '../services/optimizer/optimizerService';
import { OperationGroup } from '../services/historyGroupingService';

interface ControlPanelProps {
  parameterImpacts: ParameterImpact[];
  visualizationTemplates: VisualizationTemplate[];
  shortcuts: Record<string, any>;
  operationGroups: OperationGroup[];
  currentNodeId: string | null;
  workflowId: string;
  optimizationParameters: OptimizationParameter[];
  onParameterChange: (paramId: string, value: number) => void;
  onUndo: (groupId: string) => void;
  onApplyOptimizationSuggestion: (parameters: Record<string, number>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  parameterImpacts,
  visualizationTemplates,
  shortcuts,
  operationGroups,
  currentNodeId,
  workflowId,
  optimizationParameters,
  onParameterChange,
  onUndo,
  onApplyOptimizationSuggestion
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  const handlePanelChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  return (
    <>
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          position: 'fixed',
          right: isExpanded ? 370 : 10, // 调整展开时的位置以匹配面板宽度
          top: 120, // 调整位置避免与Test Styles按钮重叠
          zIndex: 10000,
          backgroundColor: '#2196F3', // 使用蓝色背景使其更明显
          color: 'white',
          boxShadow: 3,
          borderRadius: '8px',
          border: '2px solid #1976D2',
          width: 48,
          height: 48,
          '&:hover': {
            backgroundColor: '#1976D2',
            boxShadow: 4,
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease'
        }}
        title={isExpanded ? "Close BO Control Panel" : "Open BO Control Panel (Bayesian Optimization)"}
      >
        {isExpanded ? <ChevronRightIcon /> : <SettingsIcon />}
      </IconButton>

      <Slide direction="left" in={isExpanded} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            width: 360, // 稍微增加宽度
            position: 'fixed',
            right: 0,
            top: 120, // 与按钮位置对齐
            zIndex: 9999,
            backgroundColor: 'background.paper',
            boxShadow: 4,
            borderRadius: '8px 0 0 8px',
            maxHeight: 'calc(100vh - 140px)',
            overflow: 'auto',
            border: '2px solid #2196F3' // 使用蓝色边框与按钮匹配
          }}
        >
          <Accordion
            expanded={expandedPanel === 'parameters'}
            onChange={handlePanelChange('parameters')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography>Parameters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ParameterLinkagePanel
                impacts={parameterImpacts}
                onApply={onParameterChange}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanel === 'visualization'}
            onChange={handlePanelChange('visualization')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography>Visualization</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <VisualizationTemplateSelector
                templates={visualizationTemplates}
                onSelect={(template) => {
                  console.log('Selected template:', template);
                }}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanel === 'optimizer'}
            onChange={handlePanelChange('optimizer')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f3f8ff' }}
            >
              <Typography sx={{ fontWeight: 600, color: '#2196F3' }}>
                🧠 BO Optimizer (Bayesian Optimization)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OptimizerPanel
                workflowId={workflowId}
                nodeId={currentNodeId}
                parameters={optimizationParameters}
                onApplySuggestion={onApplyOptimizationSuggestion}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanel === 'history'}
            onChange={handlePanelChange('history')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography>History</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OperationHistoryPanel
                groups={operationGroups}
                onUndo={onUndo}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expandedPanel === 'provenance'}
            onChange={handlePanelChange('provenance')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f8f9fa' }}
            >
              <Typography sx={{ fontWeight: 600, color: '#6c757d' }}>
                📋 Experiment Runs
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ProvenanceHistoryPanel
                workflowId={workflowId}
                maxHeight={400}
                onRunSelect={(run) => {
                  console.log('Selected experiment run:', run);
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Slide>
    </>
  );
};