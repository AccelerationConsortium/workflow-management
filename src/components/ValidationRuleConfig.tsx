import React, { useState } from 'react';
import { ValidationRule } from '../types/workflow';

interface ValidationRuleConfigProps {
  rules: ValidationRule[];
  onChange: (rules: ValidationRule[]) => void;
}

export const ValidationRuleConfig: React.FC<ValidationRuleConfigProps> = ({
  rules,
  onChange,
}) => {
  const [newRule, setNewRule] = useState<Partial<ValidationRule>>({
    type: 'required',
    message: '',
  });

  const addRule = () => {
    if (newRule.type && newRule.message) {
      onChange([...rules, newRule as ValidationRule]);
      setNewRule({ type: 'required', message: '' });
    }
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="validation-rules">
      <h4>验证规则</h4>
      
      <div className="rules-list">
        {rules.map((rule, index) => (
          <div key={index} className="rule-item">
            <span className="rule-type">{rule.type}</span>
            <span className="rule-message">{rule.message}</span>
            <button onClick={() => removeRule(index)}>删除</button>
          </div>
        ))}
      </div>

      <div className="add-rule">
        <select
          value={newRule.type}
          onChange={(e) => setNewRule({ ...newRule, type: e.target.value as ValidationRule['type'] })}
        >
          <option value="required">必填</option>
          <option value="range">范围</option>
          <option value="format">格式</option>
          <option value="custom">自定义</option>
        </select>
        
        <input
          type="text"
          placeholder="错误提示信息"
          value={newRule.message}
          onChange={(e) => setNewRule({ ...newRule, message: e.target.value })}
        />

        {newRule.type === 'range' && (
          <div className="range-inputs">
            <input
              type="number"
              placeholder="最小值"
              onChange={(e) => setNewRule({
                ...newRule,
                range: [Number(e.target.value), newRule.range?.[1] ?? 0]
              })}
            />
            <input
              type="number"
              placeholder="最大值"
              onChange={(e) => setNewRule({
                ...newRule,
                range: [newRule.range?.[0] ?? 0, Number(e.target.value)]
              })}
            />
          </div>
        )}

        {newRule.type === 'format' && (
          <input
            type="text"
            placeholder="正则表达式"
            onChange={(e) => setNewRule({ ...newRule, format: e.target.value })}
          />
        )}

        <button onClick={addRule}>添加规则</button>
      </div>
    </div>
  );
}; 