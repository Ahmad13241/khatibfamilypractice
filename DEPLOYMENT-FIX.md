# Khatib Family Practice Website Deployment Fix

This document provides instructions to resolve the discrepancies between your local website and the Netlify deployed version.

## Problem Identification

The deployment discrepancy occurs because:

1. **Case sensitivity issues**: Windows (your local environment) is case-insensitive for filenames, but Linux (Netlify servers) is case-sensitive.
2. **Missing files**: Some files referenced in HTML don't exist in the repository.
3. **Build process**: The `dist` directory built locally may differ from the one built by Netlify.
4. **File format inconsistency**: Some images are referenced with file extensions that don't match what's available (.jpeg vs .webp).

## Solution Implemented

We've implemented the following fixes:

1. **Created a proper netlify.toml configuration** in the root directory
2. **Updated image references** in HTML files to use existing formats (WebP)
3. **Created a utility script** for automatically fixing image references
4. **Added deployment guidance** to the README.md
5. **Added new npm scripts** for streamlining the deployment process

## How to Resolve the Issues

### Step 1: Fix Image References

Run the following command to automatically fix image references in HTML files:

```bash
npm run fix:images
```

This will:
- Scan all HTML files for image references
- Check if referenced images actually exist
- Replace references to missing images with available alternatives
- Fix case sensitivity issues

### Step 2: Build and Deploy

After fixing image references, prepare for deployment:

```bash
npm run deploy:prepare
```

This will:
1. Build the project (generating the `dist` directory)
2. Add the `dist` directory to Git
3. Commit the changes
4. Push to GitHub

### Step 3: Verify Deployment

Once Netlify completes the deployment:
1. Visit your Netlify URL
2. Verify all images are loading correctly
3. Check all functionality works as expected

## Preventing Future Issues

To prevent these issues from occurring again:

1. **Use consistent file naming**: Use lowercase names with hyphens for all files
2. **Test builds locally**: Run `npm run build` and test the `dist` directory locally
3. **Be careful with file formats**: Always update HTML when changing image formats
4. **Run the image fix tool**: Run `npm run fix:images` before each deployment

## Troubleshooting

If you still see discrepancies after following these steps:

1. **Check Netlify build logs**: Look for any errors during build
2. **Verify file references**: Make sure HTML files reference existing images
3. **Check case sensitivity**: Ensure filenames match exactly (including case)
4. **Run a fresh build**: Delete `dist` directory and rebuild with `npm run build`

## Additional Resources

For more information:
- Check the [README.md](./README.md) file's Deployment Troubleshooting section
- Review the [Netlify documentation](https://docs.netlify.com/configure-builds/file-based-configuration/)
- Read about [case sensitivity in deployment](https://community.netlify.com/t/support-guide-files-not-found-in-deployed-site-but-work-locally/10539) 