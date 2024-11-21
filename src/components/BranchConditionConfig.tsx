import React, { useState } from 'react';
import { BranchCondition } from '../types/workflow';

interface BranchConditionConfigProps {
  condition: BranchCondition;
  sourceOptions: { id: string; label: string }[];
  targetOptions: { id: string; label: string }[];
  onChange: (condition: BranchCondition) => void;
  onDelete: () => void;
}

export const BranchConditionConfig: React.FC<BranchConditionConfigProps> = ({
  condition,
  sourceOptions,
  targetOptions,
  onChange,
  onDelete,
}) => {
  return (
    <div className="branch-condition">
      <div className="condition-row">
        <select
          value={condition.sourcePort}
          onChange={(e) => onChange({ ...condition, sourcePort: e.target.value })}
        >
          {sourceOptions.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>

        <select
          value={condition.operator}
          onChange={(e) => onChange({ ...condition, operator: e.target.value as BranchCondition['operator'] })}
        >
          <option value=">">大于</option>
          <option value="<">小于</option>
          <option value="==">等于</option>
          <option value=">=">大于等于</option>
          <option value="<=">小于等于</option>
          <option value="!=">不等于</option>
          <option value="contains">包含</option>
          <option value="matches">匹配</option>
        </select>

        <input
          type="text"
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="比较值"
        />

        <select
          value={condition.targetPort}
          onChange={(e) => onChange({ ...condition, targetPort: e.target.value })}
        >
          {targetOptions.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>

        <button onClick={onDelete}>删除</button>
      </div>

      <input
        type="text"
        value={condition.description || ''}
        onChange={(e) => onChange({ ...condition, description: e.target.value })}
        placeholder="条件描述（可选）"
        className="condition-description"
      />
    </div>
  );
}; 