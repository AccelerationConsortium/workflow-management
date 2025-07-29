// Test script to verify BloxOptimization registration
console.log('Testing BloxOptimization registration...');

// Test 1: Check if BloxOptimization can be imported
try {
  const { bloxOptimizationNodeConfig } = require('./src/components/OperationNodes/SDL1/UnitOperations/BloxOptimization/index.tsx');
  console.log('✅ BloxOptimization config imported successfully');
  console.log('Config:', bloxOptimizationNodeConfig);
} catch (error) {
  console.log('❌ Failed to import BloxOptimization config:', error.message);
}

// Test 2: Check if SDL1NodeConfigs includes BloxOptimization
try {
  const { SDL1NodeConfigs } = require('./src/components/OperationNodes/SDL1/index.ts');
  console.log('✅ SDL1NodeConfigs imported successfully');
  console.log('Number of SDL1 configs:', SDL1NodeConfigs.length);
  
  const bloxConfig = SDL1NodeConfigs.find(config => config.type === 'sdl1BloxOptimization');
  if (bloxConfig) {
    console.log('✅ BloxOptimization found in SDL1NodeConfigs');
    console.log('Blox config:', bloxConfig);
  } else {
    console.log('❌ BloxOptimization NOT found in SDL1NodeConfigs');
    console.log('Available configs:', SDL1NodeConfigs.map(c => c.type));
  }
} catch (error) {
  console.log('❌ Failed to import SDL1NodeConfigs:', error.message);
}

// Test 3: Check operationNodes
try {
  const { operationNodes } = require('./src/data/operationNodes.ts');
  console.log('✅ operationNodes imported successfully');
  
  const bloxNode = operationNodes.find(node => node.type === 'sdl1BloxOptimization');
  if (bloxNode) {
    console.log('✅ BloxOptimization found in operationNodes');
    console.log('Blox node:', bloxNode);
  } else {
    console.log('❌ BloxOptimization NOT found in operationNodes');
    const sdl1Nodes = operationNodes.filter(node => node.category === 'SDL1');
    console.log('SDL1 nodes found:', sdl1Nodes.map(n => ({ type: n.type, label: n.label })));
  }
} catch (error) {
  console.log('❌ Failed to import operationNodes:', error.message);
}
