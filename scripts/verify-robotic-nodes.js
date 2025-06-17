/**
 * Script to verify that Robotic Control nodes have complete parameter definitions
 */

const fs = require('fs');
const path = require('path');

// Read the operationNodes.ts file
const operationNodesPath = path.join(__dirname, '../src/data/operationNodes.ts');
const content = fs.readFileSync(operationNodesPath, 'utf8');

// Extract robotic control nodes
const roboticNodeTypes = [
  'robot_move_to',
  'robot_pick', 
  'robot_place',
  'robot_home',
  'robot_execute_sequence',
  'robot_wait'
];

console.log('🤖 Verifying Robotic Control Node Parameters...\n');

roboticNodeTypes.forEach(nodeType => {
  console.log(`\n📋 ${nodeType.toUpperCase()}:`);
  
  // Find the node definition in the file
  const nodeRegex = new RegExp(`type: '${nodeType}'[\\s\\S]*?parameters: \\[([\\s\\S]*?)\\]`, 'g');
  const match = nodeRegex.exec(content);
  
  if (match) {
    const parametersSection = match[1];
    
    // Count parameters
    const paramMatches = parametersSection.match(/name: '[^']+'/g);
    const paramCount = paramMatches ? paramMatches.length : 0;
    
    console.log(`   ✅ Found ${paramCount} parameters`);
    
    // Extract parameter names
    if (paramMatches) {
      const paramNames = paramMatches.map(p => p.replace(/name: '([^']+)'/, '$1'));
      console.log(`   📝 Parameters: ${paramNames.join(', ')}`);
      
      // Check for required fields
      const hasRobotType = paramNames.includes('robotType');
      const hasRequiredFields = parametersSection.includes('required: true');
      const hasDescriptions = parametersSection.includes('description:');
      const hasUnits = parametersSection.includes('unit:');
      const hasRanges = parametersSection.includes('range:');
      
      console.log(`   🔧 Robot Type: ${hasRobotType ? '✅' : '❌'}`);
      console.log(`   📋 Required Fields: ${hasRequiredFields ? '✅' : '❌'}`);
      console.log(`   📖 Descriptions: ${hasDescriptions ? '✅' : '❌'}`);
      console.log(`   📏 Units: ${hasUnits ? '✅' : '❌'}`);
      console.log(`   📊 Ranges: ${hasRanges ? '✅' : '❌'}`);
    }
  } else {
    console.log(`   ❌ Node definition not found!`);
  }
});

console.log('\n🎯 Summary:');
console.log('All Robotic Control nodes should now have complete parameter definitions');
console.log('including robotType, proper field names, required flags, descriptions, units, and ranges.');

console.log('\n📄 To test the JSON output:');
console.log('1. Open the application in browser');
console.log('2. Add robotic control nodes to a workflow');
console.log('3. Save the workflow to see the complete JSON structure');
console.log('4. Verify that all parameters are included in the saved JSON');

console.log('\n✨ Verification complete!');
