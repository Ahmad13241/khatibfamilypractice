# Image Assets for Khatib Family Practice Website

## Logo Files

The website currently uses the following logo file:
- LOGO.webp - Currently in use in the website

## IMPORTANT: Case Sensitivity in Images

Netlify deployments are case-sensitive for filenames, while Windows development environments are not. To avoid deployment issues:

1. Always use consistent casing in filenames (recommend lowercase with hyphens)
2. Ensure HTML references match the exact case of the actual files
3. When adding new images, verify both local and Netlify deployment

## Optimization Recommendations

The following images are currently quite large and would benefit from optimization:
- outside-office.webp (optimize to 200-400KB)
- reception-room.webp (optimize to 200-400KB)
- examination-office.webp (optimize to 200-400KB)

Recommended optimization steps:
1. Resize to 1200×800px maximum dimensions (maintain aspect ratio)
2. Compress WebP to 80-85% quality
3. Target file size: 200-400KB per image for optimal web performance

## Implementation

To avoid deployment issues between local development and Netlify:
1. Make sure all image references in HTML files use the exact filenames that exist in this directory
2. Prefer WebP format with proper fallbacks for better performance
3. After making changes, verify both local and Netlify deployments work correctly

# Logo.png Specifications

To complete the website update, please upload the Logo.png file to this directory with the following specifications:

## File Requirements:
- File name: Logo.png
- Format: PNG with transparency (if the logo has a transparent background)
- Recommended dimensions: 300-400px width (maintaining aspect ratio)
- File size: Optimize to under 100KB without quality loss

## Optimization Tips:
1. Use image optimization tools like TinyPNG (https://tinypng.com/) or ImageOptim
2. Ensure the logo is crisp and clear at the recommended dimensions
3. Test the logo in both light and dark backgrounds to ensure good visibility

## Implementation:
Once uploaded, the Logo.png file will automatically be displayed on:
1. The hero section of the home page
2. The about practice section of the home page

The website has been updated to reference this file, so uploading the logo is the final step to complete the update.

IMAGE OPTIMIZATION NOTE (ADDED 2025-03-15):
-------------------------------------------
The following newer images are currently quite large and would benefit from optimization:
- outside-office.jpeg (2.6MB)
- reception-room.jpeg (2.5MB)
- examination-office.jpeg (1.8MB)

Recommended optimization steps:
1. Resize to 1200×800px maximum dimensions (maintain aspect ratio)
2. Compress to 80-85% quality JPEG
3. Consider converting to WebP format with fallback for broader browser support
4. Target file size: 200-400KB per image for optimal web performance

This optimization would improve page load times, especially on mobile devices. 