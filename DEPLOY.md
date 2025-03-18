# Khatib Family Practice - Deployment Guide

This document outlines the process for deploying the Khatib Family Practice website to a production environment.

## Prerequisites

- Node.js 14+ and npm
- A web hosting service supporting Node.js (or static file hosting if using the static build)

## Option 1: Node.js Server Deployment

### Building for Production

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the production build script:
   ```bash
   npm run build
   ```
4. The optimized production files will be in the `dist/` directory

### Deploying to Server

1. Upload the contents of the `dist/` directory to your web server
2. Install production dependencies:
   ```bash
   cd /path/to/uploaded/files
   npm install --production
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Option 2: Static Hosting Deployment

If your hosting provider doesn't support Node.js, you can deploy as a static site:

1. After building with `npm run build`, upload only these directories to your hosting:
   - index.html
   - css/
   - js/
   - images/
   - pages/

2. Configure your server to properly handle HTML5 History API if needed

## Asset Optimization

The build process includes comprehensive asset optimization:

### CSS Optimization
- All CSS files are minified (removing whitespace, comments, and unnecessary characters)
- A bundled version (`main.bundle.css`) is created to reduce HTTP requests
- HTML files are automatically updated to reference optimized assets

### JavaScript Optimization
- All JavaScript files are minified and compressed
- Console logging and debugging code is removed
- A bundled version (`main.bundle.js`) is created to reduce HTTP requests
- HTML files are automatically updated to reference optimized assets

### Benefits
- Significantly reduced file sizes (typically 60-80% smaller)
- Fewer HTTP requests through bundling
- Faster page load times and improved user experience
- Better search engine ranking (page speed is a ranking factor)

## Post-Deployment Verification

After deploying, verify the following:

1. All pages load correctly
2. Contact form submissions work properly
3. All internal links function
4. The site loads properly on mobile devices
5. Assets are being served in their optimized format

## Security Considerations

1. Ensure your hosting uses HTTPS
2. Set up proper HTTP headers:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Content-Security-Policy: default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; frame-src https://www.google.com;
   ```

3. Configure proper cache settings for static assets:
   ```
   # For bundled and minified assets (longer cache time)
   Cache-Control: public, max-age=31536000, immutable # For main.bundle.css, main.bundle.js

   # For HTML files (shorter cache time)
   Cache-Control: no-cache, no-store
   ```

## Environment-Specific Configuration

The production build automatically:

1. Removes all development logging
2. Simplifies the server for production use
3. Optimizes JavaScript by removing console logs
4. Adds proper meta tags for robots and caching
5. Creates a streamlined package.json with only production dependencies
6. Minifies and bundles all CSS and JavaScript assets

## Maintenance After Deployment

1. To update content after deployment:
   - Make changes to the development version
   - Run the build process again
   - Upload only the changed files to the server

2. For server-side changes:
   - Update the server.js file in the development environment
   - Run the build process
   - Replace the server.js file on the production server
   - Restart the Node.js service

3. When adding new CSS or JavaScript files:
   - The build process will automatically include them in the bundles
   - No changes to the build process are needed

For assistance with deployment, contact the website administrator. 