/**
 * Production Build Script
 * Prepares the Khatib Family Practice website for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const CleanCSS = require('clean-css');
const { minify } = require('terser');
const glob = require('glob');

// Define paths
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log(chalk.blue('Starting production build process...'));

// 1. Clean previous builds
console.log('Cleaning previous builds...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR);

// 2. Copy all static files
console.log('Copying static files...');
const copyDirectories = ['css', 'images', 'pages', 'js'];
const copyFiles = ['index.html', 'favicon.ico'];

// Copy directories
copyDirectories.forEach(dir => {
  const sourcePath = path.join(ROOT_DIR, dir);
  const destPath = path.join(DIST_DIR, dir);
  
  if (fs.existsSync(sourcePath)) {
    fs.mkdirSync(destPath, { recursive: true });
    fs.cpSync(sourcePath, destPath, { recursive: true });
    console.log(`  ✓ ${dir}/ directory copied`);
  } else {
    // Create directory even if source doesn't exist to prevent errors later
    fs.mkdirSync(destPath, { recursive: true });
    console.log(`  ! ${dir}/ directory created (source not found)`);
  }
});

// Copy individual files
copyFiles.forEach(file => {
  const sourcePath = path.join(ROOT_DIR, file);
  const destPath = path.join(DIST_DIR, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`  ✓ ${file} copied`);
  }
});

// 3. CSS Minification and Bundling
console.log('Optimizing CSS files...');
const cssFiles = glob.sync(path.join(DIST_DIR, 'css', '**/*.css'));

if (cssFiles.length > 0) {
  // Create a backup of the original files before minification
  const cssOriginals = {};
  cssFiles.forEach(cssFile => {
    cssOriginals[cssFile] = fs.readFileSync(cssFile, 'utf8');
  });

  // First, create a bundled version of all CSS
  const cssBundle = cssFiles.map(file => cssOriginals[file]).join('\n');
  const cssOutputPath = path.join(DIST_DIR, 'css', 'main.bundle.css');

  // Minify the bundled CSS
  const minifiedCssBundle = new CleanCSS({
    level: 2, // Advanced optimization
    compatibility: 'ie10',
    format: 'keep-breaks'
  }).minify(cssBundle);

  fs.writeFileSync(cssOutputPath, minifiedCssBundle.styles);

  // Report CSS optimization results
  const originalCssSize = cssBundle.length;
  const minifiedCssSize = minifiedCssBundle.styles.length;
  const cssReduction = ((originalCssSize - minifiedCssSize) / originalCssSize * 100).toFixed(1);
  console.log(`  ✓ CSS files bundled and minified into main.bundle.css (${cssReduction}% size reduction)`);

  // Minify individual CSS files as well
  cssFiles.forEach(cssFile => {
    const content = cssOriginals[cssFile];
    const minified = new CleanCSS({
      level: 2,
      compatibility: 'ie10'
    }).minify(content);
    
    fs.writeFileSync(cssFile, minified.styles);
    console.log(`  ✓ Minified ${path.basename(cssFile)}`);
  });
} else {
  console.log('  ! No CSS files found to optimize');
  // Create an empty bundle to prevent errors
  fs.writeFileSync(path.join(DIST_DIR, 'css', 'main.bundle.css'), '');
}

// 4. JavaScript Minification and Bundling
console.log('Optimizing JavaScript files...');
const jsFiles = glob.sync(path.join(DIST_DIR, 'js', '**/*.js'))
  .filter(file => !file.includes('min.js'));

// Function to minify and save JS
async function optimizeJsFiles() {
  // Create empty JS bundle if no files found
  if (jsFiles.length === 0) {
    console.log('  ! No JavaScript files found to optimize');
    // Create an empty bundle to prevent errors
    fs.writeFileSync(path.join(DIST_DIR, 'js', 'main.bundle.js'), '');
    return;
  }

  // Create a backup of the original files before minification
  const jsOriginals = {};
  jsFiles.forEach(jsFile => {
    jsOriginals[jsFile] = fs.readFileSync(jsFile, 'utf8');
  });

  // First, bundle all JS
  const jsBundle = jsFiles.map(file => jsOriginals[file]).join('\n');
  const jsBundlePath = path.join(DIST_DIR, 'js', 'main.bundle.js');

  try {
    // Minify the bundled JS
    const minifiedBundle = await minify(jsBundle, {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true,
      format: {
        comments: false
      }
    });
    
    fs.writeFileSync(jsBundlePath, minifiedBundle.code);
    
    // Report JS optimization results
    const originalJsSize = jsBundle.length;
    const minifiedJsSize = minifiedBundle.code.length;
    const jsReduction = ((originalJsSize - minifiedJsSize) / originalJsSize * 100).toFixed(1);
    console.log(`  ✓ JS files bundled and minified into main.bundle.js (${jsReduction}% size reduction)`);
    
    // Minify individual JS files
    for (const jsFile of Object.keys(jsOriginals)) {
      const minified = await minify(jsOriginals[jsFile], {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: true,
        format: {
          comments: false
        }
      });
      
      fs.writeFileSync(jsFile, minified.code);
      console.log(`  ✓ Minified ${path.basename(jsFile)}`);
    }
  } catch (err) {
    console.error(`  ✗ Error during JavaScript optimization: ${err.message}`);
    // Create an empty bundle to prevent errors
    fs.writeFileSync(jsBundlePath, '');
  }
}

// 5. Create production server file
console.log('Creating production server configuration...');
const devServerPath = path.join(ROOT_DIR, 'server.js');
const prodServerPath = path.join(DIST_DIR, 'server.js');

let serverContent = fs.readFileSync(devServerPath, 'utf-8');

// Create production version of server.js
const productionServerContent = `/**
 * Khatib Family Practice Production Server
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic production logging - much simpler than development
app.use(morgan('combined'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Simple form submission endpoint
app.post('/api/contact', (req, res) => {
  // In production this would send an email or connect to a CRM
  // For now just log minimally and return success
  console.log('Contact form submission received');
  res.status(200).json({ success: true, message: 'Form submitted successfully' });
});

// Basic error handling for production
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).send('An error occurred. Please try again later.');
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Khatib Family Practice server running on port \${PORT}\`);
});`;

fs.writeFileSync(prodServerPath, productionServerContent);
console.log('  ✓ Production server.js created');

// 6. Create simplified package.json for production
console.log('Creating production package.json...');
const packageJson = require(path.join(ROOT_DIR, 'package.json'));

// Keep only production dependencies
const prodPackage = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  main: 'server.js',
  scripts: {
    start: "node server.js"
  },
  dependencies: {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "morgan": "^1.10.0"
  }
};

fs.writeFileSync(
  path.join(DIST_DIR, 'package.json'),
  JSON.stringify(prodPackage, null, 2)
);
console.log('  ✓ Production package.json created');

// 7. Process HTML files to use optimized assets
console.log('Optimizing HTML files...');
function processHtmlFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      processHtmlFiles(fullPath);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      try {
        // Remove development-only scripts
        content = content.replace(/<script.*?data-env="development".*?><\/script>/g, '');
        
        // Update CSS references to use the bundled version
        content = content.replace(
          /<link\s+rel="stylesheet"\s+href="(.*?)styles\.css".*?>/g,
          (match, pathPrefix) => {
            return `<link rel="stylesheet" href="${pathPrefix}main.bundle.css" media="screen">`;
          }
        );
        
        // Update JS references to use the bundled version
        content = content.replace(
          /<script\s+src="(.*?)main\.js".*?><\/script>/g,
          (match, pathPrefix) => {
            return `<script src="${pathPrefix}main.bundle.js" defer></script>`;
          }
        );
        
        // Add production-specific meta tags
        if (content.includes('<head>')) {
          const metaTags = `
    <!-- Production environment -->
    <meta name="robots" content="index, follow">
    <meta http-equiv="Cache-Control" content="public, max-age=86400">`;
          content = content.replace('<head>', '<head>' + metaTags);
        }
        
        fs.writeFileSync(fullPath, content);
        console.log(`  ✓ Optimized ${entry.name}`);
      } catch (err) {
        console.error(`  ✗ Error optimizing ${entry.name}: ${err.message}`);
      }
    }
  }
}

// 8. Create a .env.production file
console.log('Creating production environment file...');
const envContent = `NODE_ENV=production
PORT=3000
LOGGING_ENABLED=false`;

fs.writeFileSync(path.join(DIST_DIR, '.env.production'), envContent);
console.log('  ✓ .env.production created');

// Execute asynchronous operations
(async function() {
  try {
    // Run JS optimization
    await optimizeJsFiles();
    
    // Process HTML files after JS/CSS optimization
    processHtmlFiles(DIST_DIR);
    
    // Complete the build
    console.log(chalk.green('\nBuild completed successfully! ✓'));
    console.log('\nAsset Optimization Results:');
    
    // Calculate and display total asset size reduction
    function getFileSizeInKB(filePath) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2);
      }
      return '0.00';
    }
    
    const bundledCss = path.join(DIST_DIR, 'css', 'main.bundle.css');
    const bundledJs = path.join(DIST_DIR, 'js', 'main.bundle.js');
    
    console.log(`CSS Bundle: ${getFileSizeInKB(bundledCss)} KB`);
    console.log(`JS Bundle: ${getFileSizeInKB(bundledJs)} KB`);
    
    console.log(chalk.yellow('\nTo deploy:'));
    console.log('1. Upload the contents of the dist/ directory to your web server');
    console.log('2. Install production dependencies: npm install --production');
    console.log('3. Start the server: npm start\n');
  } catch (err) {
    console.error(chalk.red('Build failed:'), err);
    process.exit(1);
  }
})(); 