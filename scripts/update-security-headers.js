/**
 * Update Security Headers Script
 * This script updates HTML files to remove CSP meta tags and only keep needed security headers
 */

const fs = require('fs');
const path = require('path');

// Define the corrected security headers to add (without CSP)
const securityHeaders = `
    <!-- Security headers (CSP handled by server) -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">`;

// Directories to process
const directories = [
  path.join(__dirname, '..'), // Root directory
  path.join(__dirname, '../pages'), // Pages directory
];

// Process HTML files
const processHtmlFiles = (directory) => {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    if (path.extname(file) === '.html') {
      const filePath = path.join(directory, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove existing security headers section
      content = content.replace(/<!-- Enhanced security headers -->[\s\S]*?<meta http-equiv="Referrer-Policy"[^>]*>/g, '');
      
      // Remove any CSP meta tag (directly targeted)
      content = content.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/g, '');
      
      // Remove any standalone X-Frame-Options meta tag (non-compliant)
      content = content.replace(/<meta http-equiv="X-Frame-Options"[^>]*>\s*/g, '');
      
      // Find the position to insert headers (after description meta tag)
      const descriptionMetaRegex = /<meta\s+name="description"[^>]*>/i;
      const match = content.match(descriptionMetaRegex);
      
      if (match) {
        const insertPosition = match.index + match[0].length;
        
        // Insert corrected security headers
        content = 
          content.substring(0, insertPosition) + 
          securityHeaders + 
          content.substring(insertPosition);
        
        // Write the updated content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated security headers in: ${filePath}`);
      } else {
        console.log(`Could not find insertion point in: ${filePath}`);
      }
    }
  });
};

// Check script usage
console.log('Starting security headers update...');

// Process all directories
directories.forEach(directory => {
  console.log(`Processing directory: ${directory}`);
  processHtmlFiles(directory);
});

console.log('Security headers update complete.'); 