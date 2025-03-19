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

### Step 1: Download Original Images
- Gather all original images that need optimization:
  - outside-office.jpeg (2.6MB)
  - reception-room.jpeg (2.5MB)
  - examination-office.jpeg (1.8MB)
  - family-medicine.jpg (827KB)
  - preventative-care.jpg (784KB)
  - chronic-care.jpg (910KB)

### Step 2: Optimize Using Squoosh (Recommended Method)

1. **Access Squoosh**
   - Go to https://squoosh.app/ in your browser
   - The tool works entirely in the browser with no installation needed

2. **For Gallery Images (About Page)**
   - Upload each gallery image (outside-office.jpeg, reception-room.jpeg, examination-office.jpeg)
   - **Resize Settings:**
     - Click "Resize" in the left panel
     - Set width to 1200px (height will adjust automatically to maintain aspect ratio)
     - Use "Lanczos3" sampling method for best quality
   - **WebP Optimization:**
     - Select "WebP" from the right codec dropdown
     - Set quality to 80%
     - Enable "Auto" effort level for best compression
     - Preview image quality at 100% zoom to ensure sharpness
     - Download the WebP version
   - **JPEG Fallback:**
     - Switch codec to "MozJPEG" 
     - Set quality to 80%
     - Set "Smoothing" to 0
     - Preview image quality
     - Download the JPEG version
   - **Target Results:**
     - Each WebP image should be 150-250KB
     - Each JPEG fallback should be 200-400KB
     - Visual quality should remain crisp and professional

3. **For Service Images (Resources Page)**
   - Upload each service image (family-medicine.jpg, preventative-care.jpg, chronic-care.jpg)
   - **Resize Settings:**
     - Set width to 1000px (height will adjust automatically)
     - Use "Lanczos3" sampling method
   - **WebP Optimization:**
     - Select "WebP" codec
     - Set quality to 85% 
     - Enable "Auto" effort level
     - Download the WebP version
   - **JPEG Fallback:**
     - Switch codec to "MozJPEG"
     - Set quality to 85%
     - Download the JPEG version
   - **Target Results:**
     - Each WebP image should be 100-200KB
     - Each JPEG fallback should be 150-300KB

### Step 3: Verify Results
- Check file sizes of the optimized images to ensure they meet targets
- Compare visual quality to originals to confirm acceptable quality
- Reduced file sizes should be 80-90% smaller than originals

### Step 4: Replace Images on Website
- Replace original images with optimized versions in the images directory
- Keep both JPEG and WebP versions for each image
- Ensure the file names match exactly what's referenced in the HTML
- Update any `<picture>` elements if needed to reference both formats

### Image Display Tips for Developers
- The website uses `object-fit: cover` in CSS to ensure images maintain aspect ratio while filling their containers
- Gallery images on the About page are displayed at 400px height on desktop and 250px on mobile
- Service images are displayed at variable widths based on container
- The `<picture>` element with WebP/JPEG options ensures optimal format based on browser support

Following these optimization steps will significantly improve page load times while maintaining high image quality across the site.

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