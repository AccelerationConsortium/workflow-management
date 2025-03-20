import React, { useRef, useState } from 'react';
import { fileUploadService } from '../services/fileUploadService';
import './FileUploader.css';

interface UploadStatus {
  uploading: boolean;
  fileName?: string;
  error?: string;
}

interface FileUploaderProps {
  inputId: string;
  nodeId: string;
  onUploadComplete: (result: any) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ inputId, nodeId, onUploadComplete }) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ uploading: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, 'size:', file.size, 'type:', file.type);
    setUploadStatus({ uploading: true });

    try {
      console.log('Starting file upload process...');
      const result = await fileUploadService.uploadFile(file, nodeId, inputId);
      console.log('Upload completed with result:', result);
      
      if (result.success) {
        setUploadStatus({
          uploading: false,
          fileName: result.fileName
        });
        onUploadComplete(result);
      } else {
        console.error('Upload failed:', result.error);
        setUploadStatus({
          uploading: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error during upload:', error);
      setUploadStatus({
        uploading: false,
        error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="io-upload-container">
      <button 
        className={`io-upload-button ${uploadStatus.uploading ? 'uploading' : ''}`}
        onClick={handleUploadClick}
        title="Upload data file"
        disabled={uploadStatus.uploading}
      >
        {uploadStatus.uploading ? (
          <span className="loading-spinner" />
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
          </svg>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.json"
      />
      {uploadStatus.fileName && (
        <span className="file-name" title={uploadStatus.fileName}>
          {uploadStatus.fileName}
        </span>
      )}
      {uploadStatus.error && (
        <div className="upload-info error">
          {uploadStatus.error}
        </div>
      )}
    </div>
  );
}; 
