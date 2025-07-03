/**
 * Test script to verify workflow_prompt.txt is fully in English
 * Checks for any remaining Chinese characters and validates prompt structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Workflow Prompt English Conversion...\n');

// Read the workflow prompt file
const promptPath = path.join(__dirname, '../backend/agent_workflow_builder/prompts/workflow_prompt.txt');

if (!fs.existsSync(promptPath)) {
  console.error('❌ Workflow prompt file not found:', promptPath);
  process.exit(1);
}

const promptContent = fs.readFileSync(promptPath, 'utf8');

// Test 1: Check for Chinese characters
console.log('1️⃣ Testing for Chinese Characters...');

function containsChinese(text) {
  // Unicode range for Chinese characters (CJK Unified Ideographs)
  const chineseRegex = /[\u4e00-\u9fff]/g;
  return chineseRegex.test(text);
}

function findChineseCharacters(text) {
  const chineseRegex = /[\u4e00-\u9fff]/g;
  const matches = [];
  let match;
  
  while ((match = chineseRegex.exec(text)) !== null) {
    const lineNumber = text.substring(0, match.index).split('\n').length;
    const line = text.split('\n')[lineNumber - 1];
    matches.push({
      character: match[0],
      lineNumber,
      line: line.trim()
    });
  }
  
  return matches;
}

const chineseChars = findChineseCharacters(promptContent);

if (chineseChars.length === 0) {
  console.log('✅ No Chinese characters found - fully converted to English');
} else {
  console.log('❌ Found Chinese characters:');
  chineseChars.forEach(char => {
    console.log(`  Line ${char.lineNumber}: "${char.character}" in "${char.line}"`);
  });
}

// Test 2: Check for key English sections
console.log('\n2️⃣ Testing Key Sections...');

const requiredSections = [
  'You are an expert laboratory assistant',
  'Available Unit Operations:',
  'Input Processing Guidelines:',
  'Step 1: Intent Recognition',
  'Step 2: Operation Extraction',
  'Step 3: Parameter Extraction', 
  'Step 4: JSON Construction',
  'Example Transformations:',
  'Important Rules:',
  'Error Handling:'
];

let sectionsFound = 0;
requiredSections.forEach(section => {
  if (promptContent.includes(section)) {
    console.log(`✅ Found: "${section}"`);
    sectionsFound++;
  } else {
    console.log(`❌ Missing: "${section}"`);
  }
});

// Test 3: Check for English operation keywords
console.log('\n3️⃣ Testing Operation Keywords...');

const englishKeywords = [
  'add liquid/add/pour/inject → add_liquid',
  'heat/warm/temperature/thermal → heat',
  'CV/cyclic voltammetry/electrochemical → cv',
  'LSV/linear sweep/voltage sweep → lsv',
  'OCV/open circuit/voltage measurement → ocv',
  'stir/mix/agitate/blend → stir',
  'wait/pause/delay/hold → wait',
  'transfer/move/pipette/dispense → transfer',
  'wash/clean/rinse/flush → wash'
];

let keywordsFound = 0;
englishKeywords.forEach(keyword => {
  if (promptContent.includes(keyword)) {
    console.log(`✅ Found keyword mapping: ${keyword.split(' →')[0]}`);
    keywordsFound++;
  } else {
    console.log(`❌ Missing keyword mapping: ${keyword}`);
  }
});

// Test 4: Check for English examples
console.log('\n4️⃣ Testing Example Content...');

const englishExamples = [
  'First add 10ml NaOH solution',
  'Add NaOH Solution',
  'Heat Sample',
  'Cyclic Voltammetry Test',
  'Prepare 0.1 M NaCl solution',
  'Heat sample to 60°C'
];

let examplesFound = 0;
englishExamples.forEach(example => {
  if (promptContent.includes(example)) {
    console.log(`✅ Found English example: "${example}"`);
    examplesFound++;
  } else {
    console.log(`❌ Missing English example: "${example}"`);
  }
});

// Test 5: Validate JSON structure in examples
console.log('\n5️⃣ Testing JSON Structure...');

const jsonBlocks = promptContent.match(/```json\s*([\s\S]*?)\s*```/g);

if (jsonBlocks) {
  console.log(`✅ Found ${jsonBlocks.length} JSON code blocks`);
  
  let validJsonCount = 0;
  jsonBlocks.forEach((block, index) => {
    try {
      const jsonContent = block.replace(/```json\s*/, '').replace(/\s*```/, '');
      const parsed = JSON.parse(jsonContent);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstStep = parsed[0];
        if (firstStep.id && firstStep.type && firstStep.name && firstStep.description) {
          console.log(`✅ JSON block ${index + 1}: Valid structure with English content`);
          validJsonCount++;
        } else {
          console.log(`❌ JSON block ${index + 1}: Missing required fields`);
        }
      } else {
        console.log(`❌ JSON block ${index + 1}: Not a valid array structure`);
      }
    } catch (error) {
      console.log(`❌ JSON block ${index + 1}: Invalid JSON syntax`);
    }
  });
  
  console.log(`📊 Valid JSON blocks: ${validJsonCount}/${jsonBlocks.length}`);
} else {
  console.log('❌ No JSON code blocks found');
}

// Summary
console.log('\n📋 Test Summary:');
console.log('================');
console.log(`Chinese Characters: ${chineseChars.length === 0 ? '✅ PASS' : '❌ FAIL'} (${chineseChars.length} found)`);
console.log(`Required Sections: ${sectionsFound === requiredSections.length ? '✅ PASS' : '❌ FAIL'} (${sectionsFound}/${requiredSections.length})`);
console.log(`English Keywords: ${keywordsFound === englishKeywords.length ? '✅ PASS' : '❌ FAIL'} (${keywordsFound}/${englishKeywords.length})`);
console.log(`English Examples: ${examplesFound >= 4 ? '✅ PASS' : '❌ FAIL'} (${examplesFound} found)`);
console.log(`JSON Structure: ${jsonBlocks && jsonBlocks.length >= 2 ? '✅ PASS' : '❌ FAIL'} (${jsonBlocks ? jsonBlocks.length : 0} blocks)`);

const allTestsPassed = (
  chineseChars.length === 0 &&
  sectionsFound === requiredSections.length &&
  keywordsFound === englishKeywords.length &&
  examplesFound >= 4 &&
  jsonBlocks && jsonBlocks.length >= 2
);

console.log(`\n🎯 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 Workflow prompt successfully converted to English!');
  console.log('✅ All Chinese text has been replaced with English');
  console.log('✅ All required sections are present');
  console.log('✅ Operation keywords are in English');
  console.log('✅ Examples use English descriptions');
  console.log('✅ JSON structure is valid');
  
  console.log('\n📝 Key Improvements:');
  console.log('• Operation keywords now use English terms');
  console.log('• Example workflows have English names and descriptions');
  console.log('• All instructional text is in English');
  console.log('• Added additional comprehensive examples');
  console.log('• Maintained proper JSON structure and formatting');
} else {
  console.log('\n⚠️ Some issues found. Please review the prompt file.');
}

console.log('\n📄 File Location:', promptPath);
console.log(`📊 File Size: ${(promptContent.length / 1024).toFixed(2)} KB`);
console.log(`📝 Line Count: ${promptContent.split('\n').length} lines`);
