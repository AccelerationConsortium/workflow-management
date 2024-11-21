import React, { useState } from 'react';
import './SaveWorkflowDialog.css';

interface SaveWorkflowDialogProps {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export const SaveWorkflowDialog: React.FC<SaveWorkflowDialogProps> = ({
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name, description);
  };

  return (
    <div className="save-dialog-overlay">
      <div className="save-dialog">
        <h3>Save Workflow</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter workflow name"
              required
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter workflow description"
              rows={3}
            />
          </div>
          <div className="dialog-buttons">
            <button type="submit" className="primary">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 