/**
 * Image Reference Fixer for Khatib Family Practice Website
 * 
 * This script scans all HTML files for image references and ensures they
 * match the actual files that exist in the images directory. This helps
 * avoid issues with case sensitivity and missing files when deploying to Netlify.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define paths
const ROOT_DIR = path.join(__dirname, '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'images');

console.log('Starting image reference fix...');

// Check for production environment or add a flag
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// 1. Get list of actual images available
const getAvailableImages = () => {
  try {
    const images = {};
    const imageFiles = fs.readdirSync(IMAGES_DIR)
      .filter(file => !fs.statSync(path.join(IMAGES_DIR, file)).isDirectory())
      .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file));
    
    console.log(`Found ${imageFiles.length} image files in the images directory`);
    
    // Create a map of lowercase filename to actual filename to handle case sensitivity
    imageFiles.forEach(file => {
      images[file.toLowerCase()] = file;
    });
    
    return images;
  } catch (err) {
    console.error(`Error reading images directory: ${err.message}`);
    return {};
  }
};

// 2. Find all HTML files
const findHtmlFiles = () => {
  console.log('Looking for HTML files in:');
  console.log(`- ${path.join(ROOT_DIR, '*.html')}`);
  console.log(`- ${path.join(ROOT_DIR, 'pages', '*.html')}`);
  
  try {
    // Use explicit file paths
    const indexHtml = path.join(ROOT_DIR, 'index.html');
    const pageHtmlFiles = [
      path.join(ROOT_DIR, 'pages', 'about.html'),
      path.join(ROOT_DIR, 'pages', 'contact.html'),
      path.join(ROOT_DIR, 'pages', 'healow.html'),
      path.join(ROOT_DIR, 'pages', 'resources.html'),
      path.join(ROOT_DIR, 'pages', 'testimonials.html')
    ];
    
    // Filter to only include files that exist
    const htmlFiles = [indexHtml, ...pageHtmlFiles].filter(file => fs.existsSync(file));
    
    console.log(`Found these HTML files:`);
    htmlFiles.forEach(file => console.log(`- ${file}`));
    
    return htmlFiles;
  } catch (err) {
    console.error(`Error finding HTML files: ${err.message}`);
    return [];
  }
};

// 3. Fix image references in HTML files
const fixImageReferences = (htmlFiles, availableImages) => {
  let totalFixes = 0;
  
  htmlFiles.forEach(htmlFile => {
    try {
      let content = fs.readFileSync(htmlFile, 'utf8');
      let fileModified = false;
      
      // Find all image references
      const imgRegex = /(src|srcset)=["'](\.\.\/)?images\/([^"']+)["']/g;
      let match;
      
      while ((match = imgRegex.exec(content)) !== null) {
        const prefix = match[2] || '';
        const imgPath = match[3];
        const imgLower = imgPath.toLowerCase();
        
        // Check if the exact file exists
        const exactFileExists = fs.existsSync(path.join(IMAGES_DIR, imgPath));
        
        // If the file doesn't exist but a case-insensitive match does
        if (!exactFileExists && availableImages[imgLower]) {
          const correctImgPath = availableImages[imgLower];
          console.log(`In ${path.basename(htmlFile)}: Replacing ${imgPath} with ${correctImgPath}`);
          
          // Replace the specific occurrence
          const replacement = `${match[1]}="${prefix}images/${correctImgPath}"`;
          content = content.replace(match[0], replacement);
          
          fileModified = true;
          totalFixes++;
        }
        
        // If the file doesn't exist and no case-insensitive match exists
        else if (!exactFileExists) {
          console.log(`WARNING: In ${path.basename(htmlFile)}: Image ${imgPath} not found`);
          
          // Try different extensions
          const baseName = imgLower.substring(0, imgLower.lastIndexOf('.'));
          const webpVersion = baseName + '.webp';
          const jpgVersion = baseName + '.jpg';
          const jpegVersion = baseName + '.jpeg';
          const pngVersion = baseName + '.png';
          
          let correctImgPath = null;
          
          // Check for WebP version first (preferred format)
          if (availableImages[webpVersion]) {
            correctImgPath = availableImages[webpVersion];
            console.log(`  Found WebP alternative: ${correctImgPath}`);
          }
          // Then try JPG
          else if (availableImages[jpgVersion]) {
            correctImgPath = availableImages[jpgVersion];
            console.log(`  Found JPG alternative: ${correctImgPath}`);
          }
          // Then try JPEG
          else if (availableImages[jpegVersion]) {
            correctImgPath = availableImages[jpegVersion];
            console.log(`  Found JPEG alternative: ${correctImgPath}`);
          }
          // Finally try PNG
          else if (availableImages[pngVersion]) {
            correctImgPath = availableImages[pngVersion];
            console.log(`  Found PNG alternative: ${correctImgPath}`);
          }
          
          if (correctImgPath) {
            const replacement = `${match[1]}="${prefix}images/${correctImgPath}"`;
            content = content.replace(match[0], replacement);
            
            fileModified = true;
            totalFixes++;
          } else {
            console.log(`  No alternative found. Using placeholder.jpg if available.`);
            
            if (availableImages['placeholder.jpg']) {
              const replacement = `${match[1]}="${prefix}images/placeholder.jpg"`;
              content = content.replace(match[0], replacement);
              
              fileModified = true;
              totalFixes++;
            }
          }
        }
      }
      
      // Save the modified file
      if (fileModified) {
        fs.writeFileSync(htmlFile, content);
        console.log(`Updated ${path.basename(htmlFile)}`);
      } else {
        console.log(`No changes needed in ${path.basename(htmlFile)}`);
      }
    } catch (err) {
      console.error(`Error processing ${htmlFile}: ${err.message}`);
    }
  });
  
  return totalFixes;
};

// Main process
try {
  const availableImages = getAvailableImages();
  console.log(`Found ${Object.keys(availableImages).length} images in the images directory`);

  const htmlFiles = findHtmlFiles();
  console.log(`Found ${htmlFiles.length} HTML files to check`);

  const totalFixes = fixImageReferences(htmlFiles, availableImages);
  console.log(`Completed with ${totalFixes} fixes`);

  if (totalFixes > 0) {
    console.log('Image references have been fixed. Please review changes, then:');
    console.log('1. Run "npm run build" to update the dist directory');
    console.log('2. Commit changes with "git add . && git commit -m \'Fix image references\'"');
    console.log('3. Push to GitHub with "git push origin master"');
  } else {
    console.log('No issues found with image references.');
  }
} catch (err) {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
} 