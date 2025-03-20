import React, { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { OperationNode } from '../types/workflow';
import { nodeColors } from '../styles/nodeTheme';
import { fileUploadService } from '../services/fileUploadService';
import './BaseNode.css';

interface UploadStatus {
  [key: string]: {
    uploading: boolean;
    fileName?: string;
    error?: string;
  };
}

export const BaseNode: React.FC<{ data: OperationNode }> = ({ data }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = (inputId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'size:', file.size, 'type:', file.type);

    setUploadStatus(prev => {
      console.log('Updating upload status for input:', inputId, 'Previous status:', prev);
      return {
        ...prev,
        [inputId]: { uploading: true }
      };
    });

    try {
      console.log('Starting file upload process...');
      fileUploadService.uploadFile(file, data.id, inputId)
        .then(result => {
          console.log('Upload completed with result:', result);
          
          if (result.success) {
            setUploadStatus(prev => ({
              ...prev,
              [inputId]: {
                uploading: false,
                fileName: result.fileName
              }
            }));

            if (data.onDataChange) {
              console.log('Updating node data with file information');
              data.onDataChange({
                ...data,
                inputs: data.inputs?.map(input => 
                  input.id === inputId 
                    ? { 
                        ...input, 
                        value: {
                          fileName: result.fileName,
                          fileType: result.fileType,
                          data: result.data
                        }
                      }
                    : input
                )
              });
            }
          } else {
            console.error('Upload failed:', result.error);
            setUploadStatus(prev => ({
              ...prev,
              [inputId]: {
                uploading: false,
                error: result.error
              }
            }));
          }
        })
        .catch(error => {
          console.error('Upload error:', error);
          setUploadStatus(prev => ({
            ...prev,
            [inputId]: {
              uploading: false,
              error: 'Upload failed: ' + (error.message || 'Unknown error')
            }
          }));
        });
    } catch (error) {
      console.error('Error during upload setup:', error);
      setUploadStatus(prev => ({
        ...prev,
        [inputId]: {
          uploading: false,
          error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
        }
      }));
    }
  };

  const handleUploadClick = (inputId: string) => {
    console.log('Upload button clicked for input:', inputId);
    const fileInput = fileInputRefs.current[inputId];
    console.log('File input element:', fileInput);
    
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('File input not found for:', inputId);
      setUploadStatus(prev => ({
        ...prev,
        [inputId]: {
          uploading: false,
          error: 'Upload failed: Could not find file input'
        }
      }));
    }
  };

  const colors = nodeColors[data.category] || {
    handle: '#555',
    border: '#ddd',
    background: 'white',
    text: '#333'
  };

  return (
    <div className="node-container">
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.handle }}
      />
      
      <div className="node-inner" style={{ background: colors.background }}>
        <div className="node-header">
          <h3>{data.label}</h3>
          <div className="node-description">{data.description}</div>
        </div>

        {data.inputs && (
          <div className="io-group">
            {data.inputs.map((input) => (
              <div key={input.id} className="io-item">
                <div className="io-header">
                  <span>{input.label}</span>
                  {input.required && <span className="required">*</span>}
                  <div className="io-upload-container">
                    <button 
                      className={`io-upload-button ${uploadStatus[input.id]?.uploading ? 'uploading' : ''}`}
                      onClick={() => handleUploadClick(input.id)}
                      title="Upload data file"
                      disabled={uploadStatus[input.id]?.uploading}
                    >
                      {uploadStatus[input.id]?.uploading ? (
                        <span className="loading-spinner" />
                      ) : (
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="file"
                      ref={el => {
                        fileInputRefs.current[input.id] = el;
                        console.log('Setting ref for input:', input.id, el);
                      }}
                      style={{ display: 'none' }}
                      onChange={handleFileUpload(input.id)}
                      accept=".csv,.xlsx,.json"
                    />
                    {uploadStatus[input.id]?.fileName && (
                      <span className="file-name" title={uploadStatus[input.id].fileName}>
                        {uploadStatus[input.id].fileName}
                      </span>
                    )}
                  </div>
                </div>
                {input.description && (
                  <div className="io-desc">{input.description}</div>
                )}
                {uploadStatus[input.id]?.error && (
                  <div className="upload-info error">
                    {uploadStatus[input.id].error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.handle }}
      />
    </div>
  );
}; 
