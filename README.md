# Khatib Family Practice Website

A modern, responsive website for Khatib Family Practice, a family medicine clinic located in Bullhead City, AZ.

## Project Overview

This website was designed to provide patients with information about Khatib Family Practice, its services, and to facilitate appointment requests. The site features a clean, professional design that aligns with healthcare industry best practices.

## Features

- Responsive design that works on desktop, tablet, and mobile devices
- Detailed information about Dr. Nadim Khatib and the practice
- Comprehensive services section
- Appointment request form
- Patient testimonials
- Location information with Google Maps integration
- Patient resources section with healow Patient Portal integration
- Modern UI with accessibility considerations

## Technology Stack

- HTML5
- CSS3 (with CSS Variables for theming)
- JavaScript (vanilla)
- Font Awesome for icons
- Google Fonts (Montserrat and Open Sans)
- Google Maps API (for location embed)
- healow Patient Portal integration

## healow Integration

The website has been integrated with the healow Patient Portal system for improved patient experience. This includes:

- Links to the healow Patient Portal throughout the site
- Detailed information about the healow app features and benefits
- Step-by-step instructions for downloading and using the healow app
- Direct links to download the app from the App Store and Google Play
- FAQ section addressing common questions about the healow platform

## File Structure

```
khatib-family-practice/
│
├── css/
│   └── styles.css          # Main stylesheet
│
├── js/
│   └── main.js             # JavaScript functionality
│
├── images/
│   └── ...                 # Image assets (to be added)
│
├── pages/
│   ├── about.html          # About page with doctor info
│   ├── resources.html      # Patient resources
│   ├── testimonials.html   # Patient testimonials
│   ├── healow.html         # healow Portal Service information
│   └── contact.html        # Contact information and form
│
├── index.html              # Homepage
└── README.md               # This documentation file
```

## Development Notes

### Color Scheme

- Primary Blue: #2c5282
- Secondary Teal: #38b2ac
- Accent Beige: #f6e9d7
- Dark Gray/Blue: #2d3748
- Light Gray: #f7fafc
- Text: #333333

### Typography

- Headings: Montserrat (sans-serif)
- Body Text: Open Sans (sans-serif)

## Future Enhancements

- Online bill payment functionality through healow Pay
- Telehealth integration for virtual visits
- Blog/Health tips section
- Staff directory
- Expanded health resources section

## Deployment

This website is designed to be hosted on any standard web hosting platform. Simply upload all files maintaining the directory structure.

## Maintenance

### Adding New Content

1. To add new pages, create HTML files in the pages/ directory
2. Add navigation links in the header and footer sections
3. Ensure consistent header and footer structure across all pages

### Updating Existing Content

1. Doctor information: Update in about.html and index.html
2. Services: Update in resources.html
3. Contact information: Update in the header, footer, and contact.html

### Adding Images

1. Add image files to the images/ directory
2. Replace the placeholder `<div class="image-placeholder">` elements with `<img>` tags
3. Ensure all images have appropriate alt text for accessibility

## Browser Compatibility

This website has been designed to be compatible with:
- Chrome 70+
- Firefox 60+
- Safari 12+
- Edge 18+
- Opera 60+
- Mobile browsers (iOS Safari, Android Chrome)

## Accessibility Considerations

- Semantic HTML structure
- ARIA attributes where needed
- Sufficient color contrast
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for various devices

## License

All rights reserved. This website was created specifically for Khatib Family Practice. 

## Recent Maintenance

### Image Fixes (March 2025)
- Fixed image references for services page by updating HTML to match actual filenames
- Created placeholder images for gallery sections
- Updated CSS styling to improve image display across the site
- Note: Some images are currently using placeholders and should be replaced with actual professional photos before site launch 