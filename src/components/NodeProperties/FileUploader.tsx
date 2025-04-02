import React, { useState } from 'react';

interface FileUploaderProps {
  nodeType: string;
  onUploadComplete: (content: any) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ nodeType, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const validateFile = (file: File) => {
    if (nodeType === 'HotplateControl') {
      if (!file.name.endsWith('.json')) {
        throw new Error('Only JSON files are allowed for HotplateControl');
      }
    } else if (nodeType === 'Activation') {
      if (!file.name.endsWith('.json')) {
        throw new Error('Only JSON files are allowed for Activation');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      validateFile(selectedFile);
      setFile(selectedFile);
      setError('');
    } catch (err) {
      setError((err as Error).message);
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          // Validate content based on node type
          if (nodeType === 'HotplateControl') {
            if (!content.temperature || !content.stirring) {
              throw new Error('Invalid HotplateControl configuration file');
            }
          } else if (nodeType === 'Activation') {
            if (!content.mode || !content.activationTime || !content.deactivationTime) {
              throw new Error('Invalid Activation configuration file');
            }
          }

          onUploadComplete(content);
          setFile(null);
        } catch (err) {
          setError('Invalid JSON format or missing required fields');
        }
        setLoading(false);
      };

      reader.onerror = () => {
        setError('Error reading file');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Error uploading file');
      setLoading(false);
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        disabled={loading}
      />
      {file && (
        <button 
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default FileUploader; 
