import React, { useState, useEffect, useRef } from 'react';
import { searchService } from '../services/searchService';
import './SearchPanel.css';
import { primitiveService } from '../services/primitiveService';
import { DevicePrimitive, ControlDetail } from '../types/primitive';
import { OperationNode, Device } from '../types/workflow';
import { PrimitiveConfigDialog } from './PrimitiveConfigDialog';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (nodeType: string) => void;
}

interface SearchResult {
  type: string;
  label: string;
  category: string;
  description: string;
  score: number;
  devices?: {
    manufacturer: string;
    model: string;
  }[];
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPrimitive, setSelectedPrimitive] = useState<DevicePrimitive | null>(null);
  const [controlDetails, setControlDetails] = useState<ControlDetail | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  // 当面板打开时聚焦输入框并清空搜索
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchTerm('');
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // 处理搜索
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    // 解析搜索语法并执行搜索
    const searchOptions = searchService.parseSearchString(searchTerm);
    const searchResults = searchService.searchNodes(searchOptions);
    setResults(searchResults);
    setActiveIndex(0);
  }, [searchTerm]);

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (results[activeIndex]) {
          onSelect(results[activeIndex].type);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
      case 'Tab':
        e.preventDefault();
        // 实现智能补全
        if (results.length > 0 && activeIndex >= 0) {
          const activeResult = results[activeIndex];
          if (activeResult.devices && activeResult.devices.length > 0) {
            const device = activeResult.devices[0];
            setSearchTerm(prev => `${prev} @device:${device.manufacturer}`);
          }
        }
        break;
    }
  };

  // 当选择了节点和设备时
  const handleDeviceSelection = async (node: OperationNode, device: Device) => {
    try {
      // 1. 查找兼容的原语
      const compatiblePrimitives = await primitiveService.findCompatiblePrimitives(
        node,
        device
      );

      if (compatiblePrimitives.length > 0) {
        // 2. 默认选择第一个兼容的原语
        const primitive = compatiblePrimitives[0];
        setSelectedPrimitive(primitive);

        // 3. 获取控制细节
        const details = await primitiveService.getControlDetails(primitive.id);
        setControlDetails(details);

        // 4. 显示配置对话框
        setShowConfigDialog(true);
      }
    } catch (error) {
      console.error('Error finding compatible primitives:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel" onClick={e => e.stopPropagation()}>
        <div className="search-panel-header">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search operations... (@device:Tecan @format:96-well)"
            className="search-input"
          />
        </div>
        
        {searchTerm && (
          <div className="search-syntax-help">
            <span>Filters:</span>
            <code>@device:manufacturer</code>
            <code>@format:plate-format</code>
            <code>@volume:min-max</code>
            <code>@category:type</code>
          </div>
        )}

        <div className="search-results">
          {results.length === 0 && searchTerm && (
            <div className="no-results">
              No matching operations found
            </div>
          )}
          
          {results.map((result, index) => (
            <div
              key={result.type}
              className={`search-result ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                onSelect(result.type);
                onClose();
              }}
            >
              <div className="result-header">
                <span className="result-label">{result.label}</span>
                <span className="result-category">{result.category}</span>
              </div>
              <div className="result-description">{result.description}</div>
              {result.devices && result.devices.length > 0 && (
                <div className="result-devices">
                  {result.devices.map(device => (
                    <span 
                      key={`${device.manufacturer}-${device.model}`} 
                      className="device-tag"
                    >
                      {device.manufacturer} {device.model}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {selectedPrimitive && controlDetails && (
          <PrimitiveConfigDialog
            primitive={selectedPrimitive}
            controlDetails={controlDetails}
            onConfirm={handleConfigConfirm}
            onCancel={() => setShowConfigDialog(false)}
          />
        )}
      </div>
    </div>
  );
}; 