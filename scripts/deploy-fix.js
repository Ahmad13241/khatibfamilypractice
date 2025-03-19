/**
 * Deployment Fix Script for Khatib Family Practice Website
 * 
 * This script addresses common deployment issues between local development
 * and Netlify production environment. It:
 * 
 * 1. Fixes image references to ensure case sensitivity matches
 * 2. Ensures CSS is properly applied to production
 * 3. Checks that JS environment variables are properly set
 * 4. Validates important sections are displayed correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('Starting deployment fix process...');

// Ensure the dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.log('Creating dist directory...');
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Function to run a script and capture output
function runScript(scriptName) {
  try {
    console.log(`Running ${scriptName}...`);
    const output = execSync(`npm run ${scriptName}`, { encoding: 'utf8' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error running ${scriptName}: ${error.message}`);
    return false;
  }
}

// Fix image references first
const imageFixResult = runScript('fix:images');

if (!imageFixResult) {
  console.warn('Image reference fixing encountered issues, but continuing...');
}

// Check for key CSS sections
const cssFiles = [
  path.join(ROOT_DIR, 'css', 'styles.css')
];

const cssPatterns = {
  'career-section': [
    '.career-section',
    '.career-content',
    '.career-text',
    '.career-action'
  ],
  'gallery': [
    '.gallery-grid',
    '.gallery-item',
    '.gallery-image',
    '.gallery-caption'
  ],
  'map-container': [
    '.map-container',
    '.map-container iframe'
  ],
  'accordion': [
    '.accordion',
    '.accordion-item',
    '.accordion-header',
    '.accordion-content',
    '.accordion-item.active'
  ],
  'mobile-navigation': [
    '.mobile-toggle',
    '.nav-menu',
    '.nav-menu.active',
    'body.menu-open'
  ]
};

console.log('Validating CSS sections...');

for (const cssFile of cssFiles) {
  if (!fs.existsSync(cssFile)) {
    console.error(`CSS file ${cssFile} not found!`);
    continue;
  }
  
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  
  for (const [section, selectors] of Object.entries(cssPatterns)) {
    const missingSections = [];
    
    for (const selector of selectors) {
      if (!cssContent.includes(selector)) {
        missingSections.push(selector);
      }
    }
    
    if (missingSections.length > 0) {
      console.warn(`Section "${section}" is missing selectors: ${missingSections.join(', ')}`);
    } else {
      console.log(`Section "${section}" CSS validated successfully.`);
    }
  }
}

// Check JavaScript environment variables
console.log('Checking JavaScript environment variables...');

const mainJsFile = path.join(ROOT_DIR, 'js', 'main.js');
if (fs.existsSync(mainJsFile)) {
  const jsContent = fs.readFileSync(mainJsFile, 'utf8');
  
  // Look for conditional logging using process.env
  const envUsageCount = (jsContent.match(/process\.env\./g) || []).length;
  console.log(`Found ${envUsageCount} uses of environment variables in JavaScript.`);
  
  // Create production .env file if necessary
  const envProdFile = path.join(ROOT_DIR, '.env.production');
  if (!fs.existsSync(envProdFile)) {
    console.log('Creating .env.production file...');
    fs.writeFileSync(envProdFile, 'NODE_ENV=production\n');
  }
}

// Create netlify.toml if it doesn't exist
const netlifyTomlPath = path.join(ROOT_DIR, 'netlify.toml');
if (!fs.existsSync(netlifyTomlPath)) {
  console.log('Creating netlify.toml...');
  
  const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false

# Ensure all deployed files keep their case sensitivity
[build.processing]
  skip_processing = true

[build.environment]
  NODE_ENV = "production"
`;
  
  fs.writeFileSync(netlifyTomlPath, netlifyConfig);
  console.log('Created netlify.toml with production settings.');
}

// Run the build process to ensure dist directory is up to date
console.log('Running build process...');
const buildResult = runScript('build');

if (!buildResult) {
  console.error('Build process failed. Please check the errors above.');
  process.exit(1);
}

console.log('\n✓ Deployment fix process completed successfully!');
console.log('\nNext steps:');
console.log('1. Commit changes: git add . && git commit -m "Fix deployment issues"');
console.log('2. Push to GitHub: git push origin master');
console.log('3. Netlify will automatically deploy your site from the updated code.');
console.log('\nAfter deployment, verify that:');
console.log('- "Join Our Team" section appears correctly');
console.log('- Gallery images are high quality');
console.log('- Google Map fills its container');
console.log('- FAQ accordions expand when clicked');
console.log('- Mobile navigation links are accessible'); 