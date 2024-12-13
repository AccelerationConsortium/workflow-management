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
import { OperationHistoryPanel } from './OperationHistoryPanel';
import { ParameterImpact } from '../services/parameterLinkageService';
import { VisualizationTemplate } from '../services/visualizationTemplateService';
import { OperationGroup } from '../services/historyGroupingService';

interface ControlPanelProps {
  parameterImpacts: ParameterImpact[];
  visualizationTemplates: VisualizationTemplate[];
  shortcuts: Record<string, any>;
  operationGroups: OperationGroup[];
  onParameterChange: (paramId: string, value: number) => void;
  onUndo: (groupId: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  parameterImpacts,
  visualizationTemplates,
  shortcuts,
  operationGroups,
  onParameterChange,
  onUndo
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
          right: isExpanded ? 340 : 0,
          top: 80,
          zIndex: 1000,
          backgroundColor: 'background.paper',
          boxShadow: 2,
          borderRadius: '4px 0 0 4px',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        {isExpanded ? <ChevronRightIcon /> : <SettingsIcon />}
      </IconButton>

      <Slide direction="left" in={isExpanded} mountOnEnter unmountOnExit>
        <Paper 
          sx={{ 
            width: 320,
            position: 'fixed',
            right: 0,
            top: 80,
            zIndex: 900,
            backgroundColor: 'background.paper',
            boxShadow: 2,
            borderRadius: '4px 0 0 4px',
            maxHeight: 'calc(100vh - 100px)',
            overflow: 'auto'
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
            expanded={expandedPanel === 'shortcuts'}
            onChange={handlePanelChange('shortcuts')}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Typography>Shortcuts</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ShortcutHintPanel shortcuts={shortcuts} />
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
        </Paper>
      </Slide>
    </>
  );
}; 