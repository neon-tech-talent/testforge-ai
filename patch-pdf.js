const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/pdf-parse/index.js');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('let isDebugMode = !module.parent;')) {
    content = content.replace('let isDebugMode = !module.parent;', 'let isDebugMode = false;');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched pdf-parse/index.js to disable debug mode.');
  } else {
    console.log('pdf-parse/index.js is already patched or has a different structure.');
  }
} else {
  console.error('pdf-parse/index.js not found at ' + filePath);
}
