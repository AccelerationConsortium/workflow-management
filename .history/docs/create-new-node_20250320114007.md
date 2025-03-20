## Creating a New Node

This document describes the steps to create a new node in the workflow management system.

### Basic Structure

1. Create a new directory for your node under `src/components/OperationNodes/`
2. Create the following files:
   - `index.tsx` - Main node component
   - `types.ts` - Type definitions
   - `styles.css` - Component styles

### File Upload Feature Implementation

To add file upload capability to your node:

1. Create a FileUploader component (`src/components/FileUploader.tsx`):
```typescript
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = {
        success: true,
        fileName: file.name,
        fileType: file.type,
        data: e.target?.result
      };
      onUploadComplete(result);
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setFileName(null);
    };

    reader.readAsText(file);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
```

2. Add FileUploader styles (`src/components/FileUploader.css`):
```css
.io-upload-container {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.io-upload-button {
  width: 28px;
  height: 28px;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  position: relative;
  z-index: 2;
}

.io-upload-button:hover {
  background: #f5f5f5;
  border-color: #bbb;
}

.io-upload-button svg {
  width: 16px;
  height: 16px;
  color: #666;
}

.file-name {
  font-size: 12px;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}
```

3. Implement file upload handling in your node component:
```typescript
// In your node component
const handleUploadComplete = (inputId: string) => (result: any) => {
  if (data.onDataChange) {
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
};

// In your JSX
<div className="io-header">
  <span>{input.label}</span>
  {input.required && <span className="required">*</span>}
  <FileUploader
    inputId={input.id}
    nodeId={data.id}
    onUploadComplete={handleUploadComplete(input.id)}
  />
</div>
```

### Features
The file upload implementation includes:
- Support for CSV, Excel, and JSON files
- Visual feedback with an upload button and file name display
- File content reading and parsing
- Error handling
- Upload status indication
- File name display after successful upload

### Usage
1. Import the FileUploader component
2. Add it to your node's input section
3. Implement the upload complete handler
4. Update the node's data structure to store uploaded file information

### Best Practices
- Always handle file upload errors gracefully
- Provide clear visual feedback to users
- Validate file types before upload
- Keep file size limits in mind
- Use appropriate file parsing based on file type
- Maintain consistent styling with the rest of the application

### Node Properties
Remember to update your node's type definitions to include file-related properties:
```typescript
interface NodeInput {
  id: string;
  label: string;
  required?: boolean;
  value?: {
    fileName: string;
    fileType: string;
    data: any;
  };
}
``` 
