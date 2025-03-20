import React, { useRef } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  inputId: string;
  nodeId: string;
  onUploadComplete: (result: any) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ inputId, nodeId, onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Create a FileReader instance
    const reader = new FileReader();

    // Set up the FileReader onload event
    reader.onload = (e) => {
      const result = {
        success: true,
        fileName: file.name,
        fileType: file.type,
        data: e.target?.result
      };
      
      console.log('File uploaded:', result);
      onUploadComplete(result);
    };

    // Set up error handling
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    // Read the file
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="io-upload-container">
      <button 
        className="io-upload-button"
        onClick={handleUploadClick}
        title="Upload data file"
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
        </svg>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".csv,.xlsx,.json"
      />
    </div>
  );
}; 
