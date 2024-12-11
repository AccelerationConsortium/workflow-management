import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { useDropzone } from 'react-dropzone';
import { validateFile, FileValidationResult } from '../../utils/fileValidator';
import './FileNode.css';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  headers?: string[];
  preview?: any[];
  mapping?: Record<string, string>;
}

interface FileNodeProps {
  data: {
    id: string;
    label: string;
    fileData?: FileData;
    validationRules?: ValidationRule[];
  };
}

export const FileNode: React.FC<FileNodeProps> = ({ data }) => {
  const [fileData, setFileData] = useState<FileData | null>(data.fileData || null);
  const [validationResult, setValidationResult] = useState<FileValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 验证文件
      const result = await validateFile(file, data.validationRules);
      setValidationResult(result);

      if (result.isValid) {
        // 处理文件数据
        const fileData: FileData = {
          id: crypto.randomUUID(),
          fileName: file.name,
          fileType: file.type,
          headers: result.headers,
          preview: result.preview,
          mapping: {}
        };
        setFileData(fileData);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setValidationResult({
        isValid: false,
        errors: [{
          message: 'Failed to process file',
          type: 'error'
        }]
      });
    } finally {
      setIsProcessing(false);
    }
  }, [data.validationRules]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="file-node">
      <Handle type="target" position={Position.Left} />
      
      <div className="file-node-content">
        <div className="file-node-header">{data.label}</div>
        
        {!fileData ? (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="processing">
                <span className="spinner" />
                Processing file...
              </div>
            ) : (
              <p>Drag & drop a file here, or click to select</p>
            )}
          </div>
        ) : (
          <div className="file-info">
            <div className="file-preview">
              <h4>{fileData.fileName}</h4>
              {fileData.headers && (
                <div className="headers-preview">
                  <p>Detected columns:</p>
                  <div className="headers-list">
                    {fileData.headers.map(header => (
                      <span key={header} className="header-tag">{header}</span>
                    ))}
                  </div>
                </div>
              )}
              <button 
                className="change-file"
                onClick={() => {
                  setFileData(null);
                  setValidationResult(null);
                }}
              >
                Change File
              </button>
            </div>
          </div>
        )}

        {validationResult && !validationResult.isValid && (
          <div className="validation-errors">
            {validationResult.errors.map((error, index) => (
              <div key={index} className="error-message">
                ⚠️ {error.message}
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}; 