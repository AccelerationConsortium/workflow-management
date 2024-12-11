import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NodeParameter } from '../../types/nodeConfig';
import { NodeConfigForm } from '../NodeConfigForm';
import './styles.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface NodeDialogProps {
  open: boolean;
  node: any;
  onClose: () => void;
  onParameterUpdate: (nodeId: string, values: any) => void;
}

export const NodeDialog: React.FC<NodeDialogProps> = ({
  open,
  node,
  onClose,
  onParameterUpdate,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="node-dialog"
    >
      <DialogTitle className="dialog-title">
        {node?.data?.label || 'Node Settings'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        className="dialog-tabs"
      >
        <Tab label="Parameters" />
        <Tab label="Specifications" />
        <Tab label="Status" />
      </Tabs>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <NodeConfigForm
            nodeId={node?.id}
            parameters={node?.data?.parameters || []}
            initialValues={node?.data?.parameterValues || {}}
            onSubmit={(values) => {
              onParameterUpdate(node.id, values);
              onClose();
            }}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <div className="specs-content">
            {node?.data?.specs && Object.entries(node.data.specs).map(([key, value]) => (
              <div key={key} className="spec-item">
                <span className="spec-label">{key}:</span>
                <span className="spec-value">{value as string}</span>
              </div>
            ))}
          </div>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <div className="status-content">
            <div className="status-item">
              <span className="status-label">Current Status:</span>
              <span className={`status-badge ${node?.data?.status || 'idle'}`}>
                {node?.data?.status || 'Idle'}
              </span>
            </div>
            {node?.data?.progress !== undefined && (
              <div className="status-item">
                <span className="status-label">Progress:</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${node.data.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 