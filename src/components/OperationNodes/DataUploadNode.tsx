import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { sampleFiles } from '../../data/sampleFiles';
import './DataUploadNode.css';

export const DataUploadNode: React.FC<{ data: any }> = ({ data }) => {
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  const handleSampleSelect = (sampleFile: typeof sampleFiles[0]) => {
    setSelectedFile(sampleFile.name);
    setShowSampleMenu(false);
  };

  return (
    <div className="node-container">
      <Handle
        type="target"
        position={Position.Left}
        id="data-input"
        data-tooltip="Input"
      />
      
      <div className="node-inner">
        <div className="node-header">
          Data Upload
        </div>
        <div className="node-content">
          {!selectedFile ? (
            <div className="file-actions">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="data-file-upload"
              />
              <label htmlFor="data-file-upload" className="upload-button">
                Choose File
              </label>
              <button 
                className="upload-button"
                onClick={() => setShowSampleMenu(!showSampleMenu)}
              >
                Sample Files
              </button>
              
              {showSampleMenu && (
                <div className="sample-menu">
                  {sampleFiles.map(file => (
                    <div 
                      key={file.id}
                      className="sample-item"
                      onClick={() => handleSampleSelect(file)}
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="file-info">
              <div className="selected-file">
                Selected: {selectedFile}
              </div>
              <button
                className="upload-button"
                onClick={() => setSelectedFile(null)}
              >
                Change File
              </button>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="data-output"
        data-tooltip="Output"
      />
    </div>
  );
}; 