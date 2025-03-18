# Image Optimization Guide for Khatib Family Practice Website

## Overview

This document outlines the process for optimizing images on the Khatib Family Practice website to improve performance and user experience.

## Target Specifications

### Gallery Images (About Page)
- **Max Dimensions**: 1200×800px (maintain aspect ratio)
- **Format**: WebP with JPEG fallback
- **Compression**: 80% quality
- **Target Size**: 200-400KB
- **Images to Optimize**:
  - outside-office.jpeg (currently 2.6MB)
  - reception-room.jpeg (currently 2.5MB)
  - examination-office.jpeg (currently 1.8MB)

### Service Images (Resources Page)
- **Max Dimensions**: 1000×700px (maintain aspect ratio)
- **Format**: WebP with JPEG fallback
- **Compression**: 80-85% quality
- **Target Size**: 150-300KB
- **Images to Optimize**:
  - family-medicine.jpg (currently 827KB)
  - preventative-care.jpg (currently 784KB)
  - chronic-care.jpg (currently 910KB)

## Optimization Tools

### Option 1: Online Tools (No Installation Required)
1. **Squoosh** (https://squoosh.app/):
   - Drag and drop images
   - Resize using the resize option
   - Apply MozJPEG compression at 80% quality
   - Export as WebP and JPEG

2. **TinyPNG** (https://tinypng.com/):
   - Supports batch uploads (up to 20 images)
   - Automatically compresses without quality loss
   - Download optimized files

### Option 2: Desktop Applications
1. **ImageOptim** (Mac): https://imageoptim.com/
2. **FileOptimizer** (Windows): https://nikkhokkho.sourceforge.io/static.php?page=FileOptimizer

### Option 3: Command Line (for technical users)
Using ImageMagick and cwebp:

```bash
# Resize and optimize JPEG
magick convert original.jpeg -resize 1200x800 -quality 80 optimized.jpg

# Convert to WebP
cwebp -q 80 optimized.jpg -o optimized.webp
```

## Implementation Process

1. **Create optimized versions**:
   - Create both WebP and JPEG versions of each image
   - Use naming convention: `[original-name].webp` and `[original-name]-opt.jpg`
   - Place in `/images/optimized/` directory

2. **Update HTML to use responsive images**:
   - Implement the `<picture>` element with WebP and JPEG sources
   - Keep same alt text and class attributes
   - Example HTML update is provided in the next section

3. **Test optimized page loading**:
   - Verify images load correctly in all browsers
   - Confirm proper responsive behavior on mobile devices
   - Check load time improvement

## Example HTML Implementation

```html
<!-- Example for gallery image -->
<div class="gallery-item">
    <picture>
        <source srcset="../images/optimized/outside-office.webp" type="image/webp">
        <source srcset="../images/optimized/outside-office-opt.jpg" type="image/jpeg">
        <img src="../images/optimized/outside-office-opt.jpg" 
             alt="Khatib Family Practice office exterior located at Suite 109 with clear signage and convenient access" 
             class="gallery-image">
    </picture>
</div>

<!-- Example for service image -->
<div class="service-image">
    <picture>
        <source srcset="../images/optimized/family-medicine.webp" type="image/webp">
        <source srcset="../images/optimized/family-medicine-opt.jpg" type="image/jpeg">
        <img src="../images/optimized/family-medicine-opt.jpg" 
             alt="Dr. Khatib providing compassionate care to a family with members of different ages" 
             class="service-img">
    </picture>
</div>
```

## Batch Processing Script

For technical users comfortable with command line, here's a PowerShell script that can process multiple images:

```powershell
# Create directories if they don't exist
mkdir -p optimized

# Process each image
$images = @("outside-office.jpeg", "reception-room.jpeg", "examination-office.jpeg", 
           "family-medicine.jpg", "preventative-care.jpg", "chronic-care.jpg")

foreach ($image in $images) {
    # Get the base name without extension
    $name = [System.IO.Path]::GetFileNameWithoutExtension($image)
    $ext = [System.IO.Path]::GetExtension($image)
    
    # Use ImageMagick to resize and optimize
    magick convert $image -resize "1200x800>" -quality 80 "optimized/$name-opt.jpg"
    
    # Use cwebp to create WebP version (if cwebp is installed)
    cwebp -q 80 "optimized/$name-opt.jpg" -o "optimized/$name.webp"
    
    Write-Host "Processed: $image"
}
```

## Performance Impact

Expected improvements after optimization:
- **File Size Reduction**: 70-80% smaller files
- **Page Load Time**: 2-4 second improvement
- **Bandwidth Usage**: 5-6MB less per page visit
- **Mobile Performance**: Significantly faster loading on cellular networks 