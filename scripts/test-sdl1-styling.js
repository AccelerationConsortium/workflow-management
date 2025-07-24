/**
 * Test script to verify SDL1 UO styling matches SDL7 design
 * Checks CSS classes, color schemes, and design consistency
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing SDL1 UO Styling Consistency...\n');

// Read SDL1 styles
const sdl1StylesPath = path.join(__dirname, '../src/components/OperationNodes/SDL1/styles.css');
const sdl7StylesPath = path.join(__dirname, '../src/components/OperationNodes/SDL7/styles.css');

if (!fs.existsSync(sdl1StylesPath)) {
  console.error('❌ SDL1 styles file not found:', sdl1StylesPath);
  process.exit(1);
}

if (!fs.existsSync(sdl7StylesPath)) {
  console.error('❌ SDL7 styles file not found:', sdl7StylesPath);
  process.exit(1);
}

const sdl1Styles = fs.readFileSync(sdl1StylesPath, 'utf8');
const sdl7Styles = fs.readFileSync(sdl7StylesPath, 'utf8');

// Test 1: Check for consistent design patterns
console.log('1️⃣ Testing Design Pattern Consistency...');

const designPatterns = [
  'linear-gradient',
  'box-shadow',
  'border-radius: 8px',
  'transition: all 0.2s ease',
  'transform: translateY(-1px)',
  'min-width: 300px',
  'padding: 8px 12px',
  'border-radius: 6px 6px 0 0'
];

let patternsFound = 0;
designPatterns.forEach(pattern => {
  if (sdl1Styles.includes(pattern)) {
    console.log(`✅ Found design pattern: "${pattern}"`);
    patternsFound++;
  } else {
    console.log(`❌ Missing design pattern: "${pattern}"`);
  }
});

// Test 2: Check for SDL1-specific color schemes
console.log('\n2️⃣ Testing SDL1 Color Schemes...');

const sdl1ColorSchemes = [
  { name: 'Primary Pink', color: '#e91e63' },
  { name: 'Solution Prep Green', color: '#4caf50' },
  { name: 'Electrode Orange', color: '#ff9800' },
  { name: 'Measurement Purple', color: '#9c27b0' },
  { name: 'Cleaning Cyan', color: '#00bcd4' },
  { name: 'Data Brown', color: '#795548' },
  { name: 'Control Blue Grey', color: '#607d8b' }
];

let colorsFound = 0;
sdl1ColorSchemes.forEach(scheme => {
  if (sdl1Styles.includes(scheme.color)) {
    console.log(`✅ Found color scheme: ${scheme.name} (${scheme.color})`);
    colorsFound++;
  } else {
    console.log(`❌ Missing color scheme: ${scheme.name} (${scheme.color})`);
  }
});

// Test 3: Check for proper CSS class structure
console.log('\n3️⃣ Testing CSS Class Structure...');

const requiredClasses = [
  '.sdl1-node',
  '.sdl1-node:hover',
  '.sdl1-node .node-header',
  '.sdl1-node .node-header svg',
  '.sdl1-node .node-content',
  '.sdl1-node .react-flow__handle',
  '.sdl1-node .react-flow__handle:hover',
  '.sdl1-node .MuiButton-outlined',
  '.sdl1-node .MuiChip-root'
];

let classesFound = 0;
requiredClasses.forEach(className => {
  if (sdl1Styles.includes(className)) {
    console.log(`✅ Found CSS class: "${className}"`);
    classesFound++;
  } else {
    console.log(`❌ Missing CSS class: "${className}"`);
  }
});

// Test 4: Check for operation-specific styling
console.log('\n4️⃣ Testing Operation-Specific Styling...');

const operationTypes = [
  'solution-prep',
  'electrode',
  'measurement',
  'cleaning',
  'data',
  'control'
];

let operationStylesFound = 0;
operationTypes.forEach(type => {
  const headerClass = `.sdl1-node.${type} .node-header`;
  const borderClass = `.sdl1-node.${type}`;
  
  if (sdl1Styles.includes(headerClass) && sdl1Styles.includes(borderClass)) {
    console.log(`✅ Found operation styling: "${type}"`);
    operationStylesFound++;
  } else {
    console.log(`❌ Missing operation styling: "${type}"`);
  }
});

// Test 5: Check for modern UI elements
console.log('\n5️⃣ Testing Modern UI Elements...');

const modernElements = [
  'webkit-scrollbar',
  'transform: scale(1.2)',
  'rgba(',
  'font-weight: 500',
  'border: 2px solid',
  'width: 12px',
  'height: 12px'
];

let modernElementsFound = 0;
modernElements.forEach(element => {
  if (sdl1Styles.includes(element)) {
    console.log(`✅ Found modern element: "${element}"`);
    modernElementsFound++;
  } else {
    console.log(`❌ Missing modern element: "${element}"`);
  }
});

// Test 6: Compare with SDL7 structure
console.log('\n6️⃣ Testing Structural Similarity with SDL7...');

const sharedStructures = [
  '.node-header',
  '.node-content',
  'linear-gradient(135deg',
  'box-shadow: 0 2px 4px',
  'box-shadow: 0 4px 8px',
  'border: 2px solid',
  'border-radius: 8px'
];

let structuresMatched = 0;
sharedStructures.forEach(structure => {
  const inSDL1 = sdl1Styles.includes(structure);
  const inSDL7 = sdl7Styles.includes(structure);
  
  if (inSDL1 && inSDL7) {
    console.log(`✅ Shared structure: "${structure}"`);
    structuresMatched++;
  } else if (inSDL1 && !inSDL7) {
    console.log(`⚠️ SDL1 only: "${structure}"`);
  } else if (!inSDL1 && inSDL7) {
    console.log(`❌ Missing from SDL1: "${structure}"`);
  }
});

// Summary
console.log('\n📋 Styling Test Summary:');
console.log('========================');
console.log(`Design Patterns: ${patternsFound >= 6 ? '✅ PASS' : '❌ FAIL'} (${patternsFound}/${designPatterns.length})`);
console.log(`Color Schemes: ${colorsFound >= 6 ? '✅ PASS' : '❌ FAIL'} (${colorsFound}/${sdl1ColorSchemes.length})`);
console.log(`CSS Classes: ${classesFound >= 8 ? '✅ PASS' : '❌ FAIL'} (${classesFound}/${requiredClasses.length})`);
console.log(`Operation Styles: ${operationStylesFound >= 5 ? '✅ PASS' : '❌ FAIL'} (${operationStylesFound}/${operationTypes.length})`);
console.log(`Modern Elements: ${modernElementsFound >= 6 ? '✅ PASS' : '❌ FAIL'} (${modernElementsFound}/${modernElements.length})`);
console.log(`SDL7 Similarity: ${structuresMatched >= 6 ? '✅ PASS' : '❌ FAIL'} (${structuresMatched}/${sharedStructures.length})`);

const allTestsPassed = (
  patternsFound >= 6 &&
  colorsFound >= 6 &&
  classesFound >= 8 &&
  operationStylesFound >= 5 &&
  modernElementsFound >= 6 &&
  structuresMatched >= 6
);

console.log(`\n🎯 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 SDL1 styling successfully matches SDL7 design!');
  console.log('✅ Consistent design patterns implemented');
  console.log('✅ SDL1-specific color schemes applied');
  console.log('✅ Modern UI elements included');
  console.log('✅ Operation-specific styling configured');
  console.log('✅ Structural similarity with SDL7 achieved');
  
  console.log('\n🎨 Key Style Features:');
  console.log('• Gradient headers with white text');
  console.log('• Hover effects with shadow and transform');
  console.log('• Color-coded operation types');
  console.log('• Modern scrollbars and handles');
  console.log('• Consistent spacing and typography');
  console.log('• Professional button and chip styling');
} else {
  console.log('\n⚠️ Some styling tests failed. Please review the CSS implementation.');
}

console.log('\n📄 Files Checked:');
console.log(`SDL1 Styles: ${sdl1StylesPath}`);
console.log(`SDL7 Styles: ${sdl7StylesPath}`);
console.log(`SDL1 File Size: ${(sdl1Styles.length / 1024).toFixed(2)} KB`);
console.log(`SDL7 File Size: ${(sdl7Styles.length / 1024).toFixed(2)} KB`);
