#!/usr/bin/env node

/**
 * Production Optimization Script for Khatib Family Practice Website
 * This script prepares the website for deployment by removing development artifacts
 * and optimizing for production.
 */

const fs = require('fs');
const path = require('path');

console.log('🏥 Khatib Family Practice - Production Optimization Starting...\n');

// Files to process
const htmlFiles = [
    'index.html',
    'pages/about.html',
    'pages/contact.html',
    'pages/healow.html',
    'pages/resources.html',
    'pages/testimonials.html'
];

const cssFiles = [
    'css/styles.css',
    'css/index.css',
    'css/about.css',
    'css/healow.css',
    'css/testimonials.css',
    'css/contact.css',
    'css/resources.css'
];

// Development scripts to remove
const devScriptsToRemove = [
    'js/logger.js',
    'js/security.js',
    'js/cssLoader.js'
];

/**
 * Remove development scripts from HTML files
 */
function removeDevScriptsFromHTML() {
    console.log('📝 Removing development scripts from HTML files...');
    
    htmlFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Remove development script tags
            content = content.replace(/<script[^>]*data-env="development"[^>]*><\/script>/g, '');
            content = content.replace(/<script[^>]*data-env="development"[^>]*defer><\/script>/g, '');
            
            // Remove development CSS loader script
            content = content.replace(/<script src="js\/cssLoader\.js"[^>]*><\/script>/g, '');
            
            // Clean up any leftover development comments
            content = content.replace(/<!-- Mark as dev-only -->/g, '');
            content = content.replace(/<!-- Development-only scripts[^>]*>/g, '');
            
            fs.writeFileSync(filePath, content);
            console.log(`   ✅ Processed ${filePath}`);
        } else {
            console.log(`   ⚠️  File not found: ${filePath}`);
        }
    });
}

/**
 * Update CSS cache busters
 */
function updateCacheBusters() {
    console.log('\n🔄 Updating cache busters...');
    
    const timestamp = Date.now();
    
    htmlFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Update CSS cache busters
            content = content.replace(/\.css\?v=\d+/g, `.css?v=${timestamp}`);
            
            fs.writeFileSync(filePath, content);
            console.log(`   ✅ Updated cache busters in ${filePath}`);
        }
    });
}

/**
 * Optimize CSS files (remove comments, minimize whitespace)
 */
function optimizeCSS() {
    console.log('\n🎨 Optimizing CSS files...');
    
    cssFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Remove comments but keep important ones
            content = content.replace(/\/\*(?!\!)[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '');
            
            // Minimize whitespace (but keep some for readability)
            content = content.replace(/\s+/g, ' ');
            content = content.replace(/;\s+/g, ';');
            content = content.replace(/\{\s+/g, '{');
            content = content.replace(/\s+\}/g, '}');
            
            fs.writeFileSync(filePath, content);
            console.log(`   ✅ Optimized ${filePath}`);
        } else {
            console.log(`   ⚠️  CSS file not found: ${filePath}`);
        }
    });
}

/**
 * Remove development script files
 */
function removeDevScriptFiles() {
    console.log('\n🗑️  Removing development script files...');
    
    devScriptsToRemove.forEach(scriptPath => {
        if (fs.existsSync(scriptPath)) {
            fs.unlinkSync(scriptPath);
            console.log(`   ✅ Removed ${scriptPath}`);
        } else {
            console.log(`   ⚠️  Development script not found: ${scriptPath}`);
        }
    });
}

/**
 * Validate HTML files for common issues
 */
function validateHTML() {
    console.log('\n🔍 Validating HTML files...');
    
    htmlFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for common issues
            const issues = [];
            
            // Check for missing alt attributes
            const imagesWithoutAlt = content.match(/<img(?![^>]*alt=)[^>]*>/g);
            if (imagesWithoutAlt) {
                issues.push(`${imagesWithoutAlt.length} images without alt attributes`);
            }
            
            // Check for missing title tags
            if (!content.includes('<title>')) {
                issues.push('Missing title tag');
            }
            
            // Check for missing meta description
            if (!content.includes('name="description"')) {
                issues.push('Missing meta description');
            }
            
            if (issues.length > 0) {
                console.log(`   ⚠️  ${filePath}: ${issues.join(', ')}`);
            } else {
                console.log(`   ✅ ${filePath} validated successfully`);
            }
        }
    });
}

/**
 * Generate deployment summary
 */
function generateSummary() {
    console.log('\n📊 Deployment Summary:');
    console.log('   ✅ Development scripts removed');
    console.log('   ✅ Cache busters updated');
    console.log('   ✅ CSS optimized');
    console.log('   ✅ HTML validated');
    console.log('\n🚀 Website is ready for production deployment!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the website locally');
    console.log('   2. Deploy to your web server');
    console.log('   3. Configure SSL certificate');
    console.log('   4. Set up proper caching headers');
    console.log('   5. Monitor website performance');
}

/**
 * Main execution
 */
function main() {
    try {
        removeDevScriptsFromHTML();
        updateCacheBusters();
        optimizeCSS();
        removeDevScriptFiles();
        validateHTML();
        generateSummary();
    } catch (error) {
        console.error('\n❌ Error during optimization:', error.message);
        process.exit(1);
    }
}

// Run the optimization
main(); 