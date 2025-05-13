import React, { useState, useRef } from 'react';
import './SaveWorkflowDialog.css'; // Reuse the same CSS

interface LoadWorkflowDialogProps {
  onLoad: (file: File) => void;
  onCancel: () => void;
}

export const LoadWorkflowDialog: React.FC<LoadWorkflowDialogProps> = ({
  onLoad,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    onLoad(selectedFile);
  };

  return (
    <div className="save-dialog-overlay">
      <div className="save-dialog">
        <h3>Load Workflow</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Select Workflow File</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          {selectedFile && (
            <div className="file-info" style={{
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              Selected file: <strong>{selectedFile.name}</strong>
            </div>
          )}
          <div className="dialog-buttons">
            <button
              type="submit"
              className="primary"
              disabled={!selectedFile}
            >
              Load
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
