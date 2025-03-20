import React, { useRef, useEffect, useState } from 'react';
import './FileUploader.css';

interface FileUploaderProps {
  inputId: string;
  nodeId: string;
  onUploadComplete: (result: any) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ inputId, nodeId, onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    console.log('FileUploader mounted, inputId:', inputId);
    console.log('File input ref:', fileInputRef.current);
  }, [inputId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Selected file:', file.name, 'type:', file.type, 'size:', file.size);
    setFileName(file.name);

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
      
      console.log('File read successfully:', result.fileName);
      onUploadComplete(result);
    };

    // Set up error handling
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setFileName(null);
    };

    // Read the file
    reader.readAsText(file);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Upload button clicked');
    console.log('File input element:', fileInputRef.current);
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null');
    }
  };

  return (
    <div className="io-upload-container" onClick={e => e.stopPropagation()}>
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
        onClick={e => e.stopPropagation()}
      />
      {fileName && (
        <span className="file-name" title={fileName}>
          {fileName}
        </span>
      )}
    </div>
  );
}; 
