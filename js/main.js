/**
 * Khatib Family Practice Website
 * Main JavaScript functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Performance logging for page initialization
    const domLoadTime = Date.now() - performance.timing.navigationStart;
    // Use conditional logging to avoid console statement warnings
    if (process.env.NODE_ENV !== 'production') {
        console.info(`DOM loaded in ${domLoadTime}ms`);
    }
    
    // Mobile menu toggle - UPDATED for new nav structure
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    // Remove any 'mobile-style' class as we're using CSS media queries instead
    if (navMenu && navMenu.classList.contains('mobile-style')) {
        navMenu.classList.remove('mobile-style');
    }
    
    // Remove any dynamically added mobile styles
    const existingMobileStyles = document.getElementById('mobile-menu-styles');
    if (existingMobileStyles) {
        existingMobileStyles.remove();
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Update aria-expanded attribute
            const isExpanded = navMenu.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            
            // Log mobile menu action
            if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                const action = isExpanded ? 'open' : 'close';
                window.KLogger.logUserAction('Mobile Menu', { action: action });
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active') && 
            !e.target.closest('.nav-menu') && 
            !e.target.closest('.mobile-toggle')) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Update aria-expanded attribute
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                e.preventDefault();
                
                window.scrollTo({
                    top: target.offsetTop - 100, // Offset for fixed header
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            }
        });
    });
    
    // Add fixed header class on scroll
    const header = document.querySelector('header');
    const headerHeight = header.offsetHeight;
    
    // Set the CSS variable for header height
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > headerHeight) {
            header.classList.add('fixed');
            document.body.classList.add('has-fixed-header');
        } else {
            header.classList.remove('fixed');
            document.body.classList.remove('has-fixed-header');
        }
    });

    // Handle form submissions if form exists
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Log form submission attempt
            if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                KLogger.logUserAction('Form Submission', { 
                    formId: 'contact-form',
                    fields: Object.fromEntries(new FormData(contactForm))
                });
            }
            
            // Normally would submit the form data to a server
            // For now, just show a success message
            const formContainer = document.querySelector('.form-container');
            formContainer.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you for your message!</h3><p>We will get back to you shortly.</p></div>';
            
            // Log successful form submission
            if (process.env.NODE_ENV !== 'production') {
                console.info('Contact form submitted successfully');
            }
        });
    }

    // Handle all images for error fallback
    const images = document.querySelectorAll('img');
    
    // Determine base path for assets
    const getBasePath = () => {
        // Check if we're in the site root or in a subdirectory
        const path = window.location.pathname;
        // If we're in a subdirectory (pages/), we need to go up one level
        return path.includes('/pages/') ? '../' : '';
    };
    
    // Function to check if an image exists
    const imageExists = (url) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    };
    
    images.forEach(img => {
        // Add performance tracking for image loading
        img.addEventListener('load', function() {
            if (window.KLogger && typeof window.KLogger.logPerformance === 'function') {
                KLogger.logPerformance('Image Loaded', Math.round(performance.now() - performance.timing.navigationStart), 'ms');
            }
            
            // Store the original width and height
            if (!this.dataset.originalWidth) {
                this.dataset.originalWidth = this.offsetWidth;
                this.dataset.originalHeight = this.offsetHeight;
            }
        });
        
        img.addEventListener('error', async function() {
            // Log image error
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`Failed to load image: ${this.src}`);
            }
            
            // Special handling for known problematic images
            const imagePath = this.src.split('/').pop();
            if (imagePath === 'reception-room-2.jpeg' || imagePath === 'courtyard.jpeg') {
                // Try the WebP version directly as we know JPEG is missing
                const basePath = getBasePath();
                
                // Map to correct filenames
                let webpPath;
                if (imagePath === 'reception-room-2.jpeg') {
                    webpPath = `${basePath}images/reception-room-2.webp`;
                } else if (imagePath === 'courtyard.jpeg') {
                    webpPath = `${basePath}images/courtyard-of-the-building.webp`;
                }
                
                if (webpPath) {
                    this.src = webpPath;
                    return; // Exit early as we've handled this special case
                }
            }
            
            // First try with the base path placeholder for other images
            const basePath = getBasePath();
            const placeholderPath = `${basePath}images/placeholder.jpg`;
            
            // Check that the placeholder actually exists
            const placeholderExists = await imageExists(placeholderPath);
            
            if (placeholderExists) {
                this.src = placeholderPath;
            } else {
                // If the placeholder doesn't exist, try an absolute path
                const absolutePathPlaceholder = '/images/placeholder.jpg';
                this.src = absolutePathPlaceholder;
            }
            
            this.alt = 'Image currently unavailable';
            this.classList.add('placeholder-fallback');
            
            // Log the fallback
            if (process.env.NODE_ENV !== 'production') {
                console.info(`Image replaced with placeholder: ${this.src}`);
            }
        });
    });

    // Update on window resize
    window.addEventListener('resize', function() {
        // Also update image handling on resize
        handleImageResize();
    });
    
    // Handle image resizing when window size changes - IMPROVED VERSION
    function handleImageResize() {
        // Handle all types of images that need responsive behavior
        const serviceImages = document.querySelectorAll('.service-img');
        const doctorImages = document.querySelectorAll('.doctor-img');
        const galleryImages = document.querySelectorAll('.gallery-image');
        
        // Log the resize event for debugging
        if (process.env.NODE_ENV !== 'production') {
            console.info(`Window resized: ${window.innerWidth}px × ${window.innerHeight}px`);
            console.info(`Found ${serviceImages.length} service images, ${doctorImages.length} doctor images, ${galleryImages.length} gallery images`);
        }
        
        // Handle service images
        if (serviceImages.length > 0) {
            serviceImages.forEach(img => {
                // Ensure loaded state for proper display
                if (!img.classList.contains('loaded')) {
                    img.classList.add('loaded');
                }
                
                // Remove any inline opacity styling that might be causing the disappearing effect
                if (img.style.opacity !== '1') {
                    img.style.opacity = '1';
                }
                
                // Get parent container dimensions
                const container = img.closest('.service-image');
                if (container) {
                    // Ensure container has proper dimensions based on viewport width
                    if (window.innerWidth <= 576) {
                        container.style.height = '300px';
                    } else if (window.innerWidth <= 768) {
                        container.style.height = '250px';
                    } else {
                        container.style.height = '400px';
                    }
                }
            });
        }
        
        // Handle doctor images - these need specific handling for doctor profile
        if (doctorImages.length > 0) {
            doctorImages.forEach(img => {
                // Mark as loaded to avoid any fade-in issues
                if (!img.classList.contains('loaded')) {
                    img.classList.add('loaded');
                }
                
                // Ensure proper display
                if (img.style.opacity !== '1') {
                    img.style.opacity = '1';
                }
                
                // Handle containing element's responsive behavior
                const container = img.closest('.doctor-image');
                if (container) {
                    // Set appropriate height based on viewport
                    if (window.innerWidth <= 576) {
                        container.style.height = '350px';
                    } else if (window.innerWidth <= 992) {
                        container.style.height = '400px';
                    } else {
                        container.style.height = '450px';
                    }
                }
            });
        }
        
        // Handle gallery images with improved aspect ratio preservation
        if (galleryImages.length > 0) {
            galleryImages.forEach(img => {
                // Ensure loaded state
                if (!img.classList.contains('loaded')) {
                    img.classList.add('loaded');
                }
                
                // Make sure they're visible
                if (img.style.opacity !== '1') {
                    img.style.opacity = '1';
                }
                
                // Set object-fit property to preserve aspect ratio
                img.style.objectFit = 'cover';
                
                // Remove any inline height that might be causing stretching
                if (img.style.height) {
                    img.style.height = '';
                }
                
                // Apply consistent width instead
                img.style.width = '100%';
                
                // Set the container height instead of the image height
                const galleryItem = img.closest('.gallery-item');
                if (galleryItem) {
                    // Adjust container height based on viewport
                    if (window.innerWidth <= 576) {
                        galleryItem.style.height = '200px';
                    } else if (window.innerWidth <= 768) {
                        galleryItem.style.height = '220px';
                    } else {
                        galleryItem.style.height = '250px';
                    }
                }
            });
        }
    }
    
    // Initialize image handling on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        // Preload important images
        preloadImages();
        
        // Initialize all images with proper attributes
        initializeAllImages();
    });
    
    // Initialize image handling on complete page load
    window.addEventListener('load', function() {
        // Apply resize handling to ensure correct dimensions
        handleImageResize();
        
        // Mark all successfully loaded images
        document.querySelectorAll('img').forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('loaded');
                // Ensure proper display
                img.style.opacity = '1';
            }
        });
    });
    
    // Preload important images
    function preloadImages() {
        const criticalImages = [
            // JPEG/JPG versions
            'family-medicine.jpg',
            'preventative-care.jpg',
            'chronic-care.jpg',
            'outside-office.jpeg',
            'reception-room.jpeg',
            'examination-office.jpeg',
            // Updated names to match actual files
            'reception-room-2.webp', // Using webp as fallback since jpeg doesn't exist
            'courtyard-of-the-building.webp', // Updated from courtyard.jpeg
            'dr-khatib-professional.jpg',
            
            // WebP versions
            'family-medicine.webp',
            'preventative-care.webp',
            'chronic-care.jpg.webp',
            'outside-office.webp',
            'reception-room.webp',
            'examination-office.webp',
            'reception-room-2.webp',
            'courtyard-of-the-building.webp', // Updated from courtyard.webp
            'dr-khatib-professional.webp',
            
            // Placeholder
            'placeholder.jpg'
        ];
        
        const basePath = getBasePath();
        
        // Preload each critical image
        criticalImages.forEach(img => {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = `${basePath}images/${img}`;
            document.head.appendChild(preloadLink);
            
            // Log preloading
            console.info(`Preloading image: ${preloadLink.href}`);
        });
    }
    
    // Consolidated function to initialize all images with consistent behavior
    function initializeAllImages() {
        // Target all relevant image types in one pass
        const allContentImages = document.querySelectorAll('.service-img, .card-img, .doctor-img, .gallery-image');
        
        allContentImages.forEach(img => {
            // Add lazy loading attribute for performance
            img.setAttribute('loading', 'lazy');
            
            // Set consistent transition for all images
            img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            // Start with opacity 1 to prevent disappearing
            img.style.opacity = '1';
            
            // Add object-fit cover property to all images
            img.style.objectFit = 'cover';
            
            // For gallery images specifically, add higher quality settings
            if (img.classList.contains('gallery-image')) {
                img.style.objectFit = 'cover';
                img.style.width = '100%';
                img.style.height = '100%';
                
                // Remove any potential inline styles causing quality issues
                img.style.imageRendering = 'auto';
                
                // Set appropriate parent container styles
                const container = img.closest('.gallery-item');
                if (container) {
                    container.style.overflow = 'hidden';
                }
            }
            
            // Listen for load event to ensure visibility
            img.addEventListener('load', function() {
                this.classList.add('loaded');
                this.style.opacity = '1';
                if (process.env.NODE_ENV !== 'production') {
                    console.info(`Image loaded successfully: ${this.src}`);
                }
            });
        });
    }
    
    // Add active class to current page in navigation
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-menu li');
    
    navItems.forEach(item => {
        const link = item.querySelector('a');
        const href = link.getAttribute('href');
        
        if (currentLocation.endsWith(href) || 
            (href === 'index.html' && (currentLocation === '/' || currentLocation.endsWith('/')))) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Smooth scroll to anchors for service items
    const serviceLinks = document.querySelectorAll('.read-more, a[href^="#"]');
    
    serviceLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Only process internal links
            if (this.getAttribute('href').indexOf('#') === 0 || 
                this.getAttribute('href').indexOf('#') > 0) {
                
                const targetId = this.getAttribute('href').split('#').pop();
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    event.preventDefault();
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Expandable sections toggle for mobile
    const expandDetails = document.querySelectorAll('.service-expand details');
    
    expandDetails.forEach(detail => {
        detail.addEventListener('toggle', function() {
            // Smooth scroll to expanded content if it opens
            if (this.open) {
                const rect = this.getBoundingClientRect();
                const isVisible = (
                    rect.top >= 0 &&
                    rect.bottom <= window.innerHeight
                );
                
                // If not fully visible, scroll it into view
                if (!isVisible) {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });
    });
    
    // Initialize accordion functionality for FAQs
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length > 0) {
        console.log(`Found ${accordionHeaders.length} accordion headers`);
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const accordionItem = this.closest('.accordion-item');
                accordionItem.classList.toggle('active');
                
                // Log accordion state for debugging
                console.log(`Toggled accordion: ${this.querySelector('span').textContent} - active: ${accordionItem.classList.contains('active')}`);
                
                // Log interaction if KLogger is available
                if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                    window.KLogger.logUserAction('FAQ Accordion', { 
                        action: accordionItem.classList.contains('active') ? 'expand' : 'collapse',
                        question: this.querySelector('span').textContent
                    });
                }
            });
        });
    } else {
        console.warn('No accordion headers found on page');
    }
    
    // Feature item hover effect
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Add event listeners with logging for all navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                window.KLogger.logUserAction('Navigation', { 
                    linkText: this.textContent.trim(),
                    href: this.getAttribute('href')
                });
            }
        });
    });

    // Add event listeners to all links in the footer
    const footerLinks = document.querySelectorAll('footer a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Log the click with specific info
            if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                KLogger.logUserAction('Footer Link Click', {
                    href: this.getAttribute('href')
                });
            }
        });
    });

    // Map interaction logging
    function initMapLogging() {
        console.log('Initializing map logging');
        const mapIframe = document.querySelector('.map-container iframe');
        
        if (mapIframe) {
            console.log('Map iframe found, logging interaction');
            
            // Log that the map was viewed
            if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                KLogger.logUserAction('Map', { action: 'map-view' });
            }
            
            // Add a click event listener to the map container to log interaction
            const mapContainer = document.querySelector('.map-container');
            if (mapContainer) {
                mapContainer.addEventListener('click', function() {
                    if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                        KLogger.logUserAction('Map', { action: 'map-click' });
                    }
                });
            }
        } else {
            console.warn('Map iframe not found in the DOM');
        }
    }
    
    // Initialize map logging with a slight delay to ensure DOM is fully loaded
    setTimeout(function() {
        initMapLogging();
    }, 500);
}); 