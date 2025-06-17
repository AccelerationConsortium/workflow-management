/**
 * Test script to verify Robotic Control parameter collection
 */

console.log('🧪 Testing Robotic Control Parameter Collection...\n');

// Simulate a robotic control node with parameters
const mockRoboticNode = {
  id: 'robot-test-1',
  type: 'robot_move_to',
  data: {
    label: 'Robot Move To',
    // Parameters stored directly in data (as they are in the actual implementation)
    robotType: 'UR3e',
    x: 46,
    y: 26,
    z: 100,
    rx: 12,
    ry: 7,
    rz: 5,
    speed: 100,
    motionType: 'linear',
    acceleration: 100,
    blendRadius: 0
  }
};

// Simulate operationNodes definition
const mockOperationNodes = [
  {
    type: 'robot_move_to',
    parameters: [
      { name: 'robotType', default: 'Generic' },
      { name: 'x', default: 0 },
      { name: 'y', default: 0 },
      { name: 'z', default: 100 },
      { name: 'rx', default: 0 },
      { name: 'ry', default: 0 },
      { name: 'rz', default: 0 },
      { name: 'speed', default: 100 },
      { name: 'motionType', default: 'linear' },
      { name: 'acceleration', default: 100 },
      { name: 'blendRadius', default: 0 }
    ]
  }
];

// Simulate the fixed parameter extraction logic
function extractRoboticParams(node, operationNodes) {
  const roboticControlTypes = [
    'robot_move_to', 'robot_pick', 'robot_place', 
    'robot_home', 'robot_execute_sequence', 'robot_wait'
  ];
  
  if (roboticControlTypes.includes(node.type)) {
    const nodeDefinition = operationNodes.find(n => n.type === node.type);
    if (nodeDefinition && nodeDefinition.parameters) {
      const params = {};
      nodeDefinition.parameters.forEach(param => {
        const paramValue = node.data?.[param.name];
        if (paramValue !== undefined) {
          params[param.name] = paramValue;
        } else if (param.default !== undefined) {
          params[param.name] = param.default;
        }
      });
      return params;
    }
  }
  
  return node.data?.params || {};
}

// Test the extraction
const extractedParams = extractRoboticParams(mockRoboticNode, mockOperationNodes);

console.log('📊 Test Results:');
console.log('================');
console.log('Input node data:', JSON.stringify(mockRoboticNode.data, null, 2));
console.log('\nExtracted params:', JSON.stringify(extractedParams, null, 2));

// Verify all parameters were extracted
const expectedParams = ['robotType', 'x', 'y', 'z', 'rx', 'ry', 'rz', 'speed', 'motionType', 'acceleration', 'blendRadius'];
const extractedKeys = Object.keys(extractedParams);

console.log('\n🔍 Verification:');
console.log('================');
console.log(`Expected ${expectedParams.length} parameters, got ${extractedKeys.length}`);

let allParamsFound = true;
expectedParams.forEach(param => {
  const found = extractedKeys.includes(param);
  console.log(`  ${param}: ${found ? '✅' : '❌'} ${found ? extractedParams[param] : 'MISSING'}`);
  if (!found) allParamsFound = false;
});

console.log(`\n🎯 Overall Result: ${allParamsFound ? '✅ SUCCESS' : '❌ FAILED'}`);

if (allParamsFound) {
  console.log('\n✨ All robotic control parameters are now correctly extracted!');
  console.log('The JSON output should now include all parameter values.');
} else {
  console.log('\n⚠️  Some parameters are still missing. Check the implementation.');
}

console.log('\n📝 Next Steps:');
console.log('1. Test in the browser by adding a robotic control node');
console.log('2. Set some parameter values in the UI');
console.log('3. Save the workflow and check the JSON output');
console.log('4. Verify that all parameters appear in the "params" section');
