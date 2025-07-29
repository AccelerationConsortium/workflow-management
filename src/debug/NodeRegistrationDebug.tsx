import React, { useEffect } from 'react';
import { operationNodes } from '../data/operationNodes';
import { SDL1NodeConfigs } from '../components/OperationNodes/SDL1';

export const NodeRegistrationDebug: React.FC = () => {
  useEffect(() => {
    console.log('=== Node Registration Debug ===');

    // Add temporary highlighting for BloxOptimization
    setTimeout(() => {
      const bloxElements = document.querySelectorAll('[data-node-type="sdl1BloxOptimization"], .operation-node');
      bloxElements.forEach(el => {
        const titleEl = el.querySelector('.operation-title');
        if (titleEl && titleEl.textContent?.includes('Blox Optimization')) {
          el.style.border = '3px solid red';
          el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          console.log('🔴 Found and highlighted BloxOptimization element:', el);
        }
      });
    }, 1000);

    // Check SDL1NodeConfigs
    console.log('SDL1NodeConfigs:', SDL1NodeConfigs);
    console.log('SDL1NodeConfigs length:', SDL1NodeConfigs.length);

    const bloxConfig = SDL1NodeConfigs.find(config => config.type === 'sdl1BloxOptimization');
    console.log('BloxOptimization in SDL1NodeConfigs:', bloxConfig);

    // Check operationNodes
    console.log('operationNodes length:', operationNodes.length);
    const sdl1Nodes = operationNodes.filter(node => node.category === 'SDL1');
    console.log('SDL1 nodes in operationNodes:', sdl1Nodes.map(n => ({ type: n.type, label: n.label })));

    const bloxNode = operationNodes.find(node => node.type === 'sdl1BloxOptimization');
    console.log('BloxOptimization in operationNodes:', bloxNode);

    // Check grouping logic
    const groups = new Map<string, any[]>();
    operationNodes.forEach(node => {
      if (!node.label || !node.category) {
        return;
      }
      const group = groups.get(node.category) || [];
      group.push(node);
      groups.set(node.category, group);
    });

    console.log('=== Grouping Debug ===');
    console.log('All groups:', Array.from(groups.keys()));
    console.log('SDL1 group:', groups.get('SDL1'));
    console.log('SDL1 group size:', groups.get('SDL1')?.length);

    const sdl1Group = groups.get('SDL1');
    if (sdl1Group) {
      const bloxInGroup = sdl1Group.find(n => n.type === 'sdl1BloxOptimization');
      console.log('BloxOptimization in SDL1 group:', bloxInGroup);
    }

    if (!bloxNode) {
      console.error('❌ BloxOptimization NOT found in operationNodes!');
    } else {
      console.log('✅ BloxOptimization found in operationNodes');
    }
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Debug: Check console for node registration info</div>
      <div>SDL1 Nodes: {operationNodes.filter(n => n.category === 'SDL1').length}</div>
      <div>Blox Found: {operationNodes.find(n => n.type === 'sdl1BloxOptimization') ? '✅' : '❌'}</div>
      <div>All Categories: {Array.from(new Set(operationNodes.map(n => n.category))).join(', ')}</div>
      <div style={{ fontSize: '10px', marginTop: '5px' }}>
        SDL1 Types: {operationNodes.filter(n => n.category === 'SDL1').map(n => n.type.replace('sdl1', '')).join(', ')}
      </div>
    </div>
  );
};

export default NodeRegistrationDebug;
