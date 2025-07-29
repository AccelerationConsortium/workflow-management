import React, { useEffect } from 'react';
import { operationNodes } from '../data/operationNodes';
import { SDL1NodeConfigs } from '../components/OperationNodes/SDL1';

export const NodeRegistrationDebug: React.FC = () => {
  useEffect(() => {
    console.log('=== Node Registration Debug ===');
    
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
    </div>
  );
};

export default NodeRegistrationDebug;
