const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts files in app/api directory
function findApiFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findApiFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to add dynamic export to a file
function addDynamicExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if dynamic export already exists
  if (content.includes('export const dynamic = "force-static"')) {
    console.log(`✅ ${filePath} - Already has dynamic export`);
    return;
  }
  
  // Add dynamic export at the beginning
  const newContent = `export const dynamic = "force-static"\n\n${content}`;
  fs.writeFileSync(filePath, newContent);
  console.log(`✅ ${filePath} - Added dynamic export`);
}

// Main execution
const apiDir = path.join(__dirname, '..', 'app', 'api');
const apiFiles = findApiFiles(apiDir);

console.log(`Found ${apiFiles.length} API files:`);
apiFiles.forEach(file => {
  addDynamicExport(file);
});

console.log('\n✅ All API routes updated!'); 