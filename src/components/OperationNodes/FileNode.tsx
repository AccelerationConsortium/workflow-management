import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FileData, FileNodeData } from '../../types/file';
import { sampleFiles } from '../../data/sampleFiles';
import './FileNode.css';

export const FileNode: React.FC<{ data: FileNodeData }> = ({ data }) => {
  const [fileData, setFileData] = useState<FileData | null>(data.fileData || null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const handleSampleFileSelect = (sampleFile: typeof sampleFiles[0]) => {
    setFileData({
      id: sampleFile.id,
      fileName: sampleFile.name,
      fileType: 'csv',
      headers: sampleFile.data.headers,
      preview: sampleFile.data.rows,
      mapping: {},
    });
    setShowSampleMenu(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 实际项目中这里应该解析文件
      console.log('File uploaded:', file.name);
      // TODO: 添加文件解析逻辑
    }
  };

  return (
    <div className="workflow-node">
      <div className="node-header">
        File Input
      </div>
      <div className="node-content">
        {!fileData ? (
          <div className="file-actions">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" className="dark-button">
              Choose File
            </label>
            <button 
              className="dark-button"
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
                    onClick={() => handleSampleFileSelect(file)}
                  >
                    <div className="sample-name">{file.name}</div>
                    <div className="sample-desc">{file.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="file-info">
            <div className="file-name">
              {fileData.fileName}
            </div>
            <div className="file-actions">
              <button 
                className="dark-button"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : 'Preview'}
              </button>
              <button
                className="dark-button"
                onClick={() => setFileData(null)}
              >
                Change
              </button>
            </div>
            {isExpanded && fileData.preview.length > 0 && (
              <div className="file-preview">
                <table>
                  <thead>
                    <tr>
                      {fileData.headers.map(header => (
                        <th key={header} title={header}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.preview.slice(0, 3).map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} title={String(cell)}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="handle"
        data-tooltip="Data Output"
      />
    </div>
  );
}; 