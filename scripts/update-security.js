/**
 * Script to update all HTML files to include security.js
 */
const fs = require('fs');
const path = require('path');

// Function to recursively process HTML files
function processHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process directories
      processHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      console.log(`Processing ${filePath}`);
      
      // Read the file
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if security.js is already included
      if (content.includes('security.js')) {
        console.log(`  Security.js already included in ${file}`);
        return;
      }
      
      // Find the main.js script tag and add security.js after it
      if (filePath.includes('/pages/')) {
        // For files in the pages directory
        content = content.replace(
          /<script src="\.\.\/js\/main\.js"><\/script>/,
          '<script src="../js/main.js"></script>\n    <script src="../js/security.js"></script>'
        );
      } else {
        // For files in the root directory
        content = content.replace(
          /<script src="js\/main\.js"><\/script>/,
          '<script src="js/main.js"></script>\n    <script src="js/security.js"></script>'
        );
      }
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  Added security.js to ${file}`);
    }
  });
}

// Start processing from the root directory
const rootDir = path.resolve(__dirname, '..');
console.log('Updating HTML files to include security.js...');
processHtmlFiles(rootDir);
console.log('Done!'); 