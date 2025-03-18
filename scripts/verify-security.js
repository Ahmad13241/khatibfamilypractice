/**
 * Security Verification Script
 * 
 * This script verifies that:
 * 1. HTML files don't have CSP meta tags that would conflict with headers
 * 2. Server properly sets all required security headers
 * 3. No wildcards or invalid directives exist in CSP
 * 
 * Run with: node scripts/verify-security.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const chalk = require('chalk');

// Configuration
const config = {
  serverUrl: 'http://localhost:3000',
  endpointsToTest: [
    '/',
    '/robots.txt',
    '/js/main.js',
    '/css/styles.css'
  ],
  requiredHeaders: [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy'
  ],
  problematicHeaders: [
    'x-powered-by'
  ],
  htmlDirectories: [
    path.join(__dirname, '..'),
    path.join(__dirname, '../pages')
  ]
};

// ANSI colors for pretty output
const colors = {
  success: '\x1b[32m', // Green
  error: '\x1b[31m',   // Red
  warning: '\x1b[33m', // Yellow
  info: '\x1b[36m',    // Cyan
  reset: '\x1b[0m'     // Reset
};

// Print colored messages
const print = {
  success: (msg) => console.log(`${colors.success}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.error}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.warning}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.info}ℹ${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.info}${msg}${colors.reset}\n${'='.repeat(msg.length)}`)
};

// Function to check HTML files for CSP meta tags
async function checkHtmlFiles() {
  print.header('Checking HTML Files for CSP Meta Tags');
  
  let allPassed = true;
  
  for (const directory of config.htmlDirectories) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
      if (path.extname(file) === '.html') {
        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for CSP meta tag
        const hasCspMetaTag = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i.test(content);
        
        if (hasCspMetaTag) {
          print.error(`${file} contains CSP meta tag (should be handled by server headers)`);
          allPassed = false;
        } else {
          print.success(`${file} - no CSP meta tags found (good)`);
        }
      }
    }
  }
  
  return allPassed;
}

// Function to test an endpoint for security headers
async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${config.serverUrl}${endpoint}`;
    print.info(`Testing endpoint: ${url}`);
    
    // Choose http or https module based on URL
    const requester = url.startsWith('https') ? https : http;
    
    requester.get(url, (res) => {
      const { headers, statusCode } = res;
      
      print.info(`Status: ${statusCode}`);
      
      // Check for required headers
      const missingHeaders = config.requiredHeaders.filter(header => 
        !headers[header]);
      
      // Check for problematic headers
      const problematicHeadersFound = config.problematicHeaders.filter(header => 
        headers[header]);
      
      // Check for CSP wildcards
      const cspHeader = headers['content-security-policy'];
      const hasWildcard = cspHeader && cspHeader.includes('*');
      
      if (missingHeaders.length === 0 && problematicHeadersFound.length === 0 && !hasWildcard) {
        print.success(`All security checks passed for ${endpoint}`);
        
        // Log present headers
        print.info('Security headers:');
        config.requiredHeaders.forEach(header => {
          if (headers[header]) {
            console.log(`  - ${header}: ${headers[header].substring(0, 70)}...`);
          }
        });
        
        resolve({
          endpoint,
          passed: true,
          statusCode
        });
      } else {
        if (missingHeaders.length > 0) {
          print.error(`Missing headers: ${missingHeaders.join(', ')}`);
        }
        
        if (problematicHeadersFound.length > 0) {
          print.error(`Problematic headers found: ${problematicHeadersFound.join(', ')}`);
        }
        
        if (hasWildcard) {
          print.error('CSP contains wildcards which should be avoided');
        }
        
        resolve({
          endpoint,
          passed: false,
          statusCode,
          missingHeaders,
          problematicHeadersFound,
          hasWildcard
        });
      }
    }).on('error', (err) => {
      print.error(`Error testing ${endpoint}: ${err.message}`);
      resolve({
        endpoint,
        passed: false,
        error: err.message
      });
    });
  });
}

// Main function to run all tests
async function runTests() {
  console.log('\n============================================');
  console.log('Khatib Family Practice - Security Verification');
  console.log('============================================\n');
  
  const htmlResult = await checkHtmlFiles();
  
  print.header('Testing Server Security Headers');
  console.log(`Testing server at: ${config.serverUrl}\n`);
  
  const results = await Promise.all(
    config.endpointsToTest.map(endpoint => testEndpoint(endpoint))
  );
  
  // Print summary
  print.header('Verification Summary');
  
  const allServerTestsPassed = results.every(result => result.passed);
  
  if (htmlResult && allServerTestsPassed) {
    print.success('All security checks passed!');
  } else {
    print.error('Some security checks failed. Review the issues above.');
  }
  
  console.log('\n============================================\n');
}

// Run all tests
runTests().catch(err => {
  print.error(`Unhandled error: ${err.message}`);
  process.exit(1);
}); 