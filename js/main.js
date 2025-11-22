/**
 * Khatib Family Practice Website
 * Main JavaScript functionality - Refactored
 */

// Define IS_DEVELOPMENT at the top level (browser-only detection)
const IS_DEVELOPMENT = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));


document.addEventListener('DOMContentLoaded', function () {

  // --- Performance Logging ---
  logPerformance('DOM Content Loaded', performance.now());

  // --- Feature Flags / Config ---
  const SMOOTH_SCROLL_OFFSET_FIXED = 100;
  const SMOOTH_SCROLL_OFFSET_NORMAL = 100;

  // --- Element Selectors ---
  const body = document.body;
  const header = document.querySelector('header');
  const mobileToggle = document.querySelector('.mobile-toggle'); // Should be a <button>
  const navMenu = document.querySelector('.nav-menu'); // Should be a <ul>
  const menuBackdrop = document.querySelector('.menu-backdrop');
  const contactForm = document.getElementById('contact-form');
  const mapContainer = document.querySelector('.map-container');
  const sections = document.querySelectorAll('.services, .career-section, .about-doctor, .testimonials, .location, .hero, .resource-section, .contact-section, .testimonial-hero, .rating-overview-section, .share-reviews-section, .resources-intro');

  // --- Initialization Functions ---

  // Shared navigation helpers
  function isMenuOpen() {
    return !!(navMenu && navMenu.classList.contains('active'));
  }

  function setMenuState(isOpen) {
    if (!navMenu || !mobileToggle || !menuBackdrop) return;
    navMenu.classList.toggle('active', isOpen);
    mobileToggle.classList.toggle('active', isOpen);
    menuBackdrop.classList.toggle('active', isOpen);
    body.classList.toggle('menu-open', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    updateHeaderHeight();
  }

  function toggleMenuState(forceOpen) {
    const open = typeof forceOpen === 'boolean' ? forceOpen : !isMenuOpen();
    setMenuState(open);
  }

  function closeMenuIfOpen() {
    if (isMenuOpen()) {
      setMenuState(false);
      return true;
    }
    return false;
  }

  /**
   * Sets up mobile menu toggle functionality.
   */
  function setupMobileMenu() {
    if (!mobileToggle || !navMenu || !menuBackdrop) {
      if (IS_DEVELOPMENT) console.warn('Mobile menu elements not found.');
      return;
    }

    // Toggle on button click
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault(); // If it's a button, not strictly necessary but good practice
      e.stopPropagation();
      toggleMenuState();
    });

    // Close menu when clicking backdrop
    menuBackdrop.addEventListener('click', () => toggleMenuState(false));

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        toggleMenuState(false);
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenuState(false);
      }
    });

    navMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && navMenu.classList.contains('active')) {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#') || href.includes('healow.html')) {
          toggleMenuState(false);
        }
      }
    });
  }

  function updateHeaderHeight() {
    if (header) {
      requestAnimationFrame(() => {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty(
          '--header-height',
          `${headerHeight}px`
        );
      });
    }
  }

  function setupFixedHeader() {
    if (!header) return;
    let lastScrollY = window.scrollY;
    let ticking = false;
    const headerHeightThreshold = 50;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!body.classList.contains('menu-open')) {
            const isFixed = lastScrollY > headerHeightThreshold;
            header.classList.toggle('fixed', isFixed);
            body.classList.toggle('has-fixed-header', isFixed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function setupSmoothScrolling() {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href.length <= 1 || href === '#') return;

      let targetElement;
      try {
        targetElement = document.querySelector(href);
      } catch (err) {
        if (IS_DEVELOPMENT) console.warn(`Invalid selector for smooth scroll: ${href}`);
        return;
      }

      if (targetElement) {
        e.preventDefault();

        const menuWasClosed = closeMenuIfOpen();

        setTimeout(() => {
          const headerOffset = header && header.classList.contains('fixed')
            ? SMOOTH_SCROLL_OFFSET_FIXED
            : SMOOTH_SCROLL_OFFSET_NORMAL;

          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }
          targetElement.focus({ preventScroll: true });

          logPerformance('Smooth Scroll to', performance.now(), href);
        }, menuWasClosed ? 100 : 0);
      }
    });
  }

  function setupImageHandling() {
    const images = document.querySelectorAll('img:not([data-no-lazy])');
    const placeholderSrc = getBasePath() + 'images/LOGO.webp';

    images.forEach((img) => {
      img.setAttribute('loading', 'lazy');
      img.classList.add('content-image', 'image-loading');

      img.addEventListener('load', function () {
        this.classList.remove('image-loading');
        this.classList.add('loaded');
        logPerformance('Image Loaded', performance.now(), img.src);
      }, { once: true });

      img.addEventListener('error', function () {
        if (IS_DEVELOPMENT) console.warn(`Failed to load image: ${this.src}. Attempting fallback.`);
        this.classList.remove('image-loading');
        this.classList.add('placeholder-fallback');

        // Prevent infinite loops: track attempts
        if (!this.dataset.originalSrc) {
          this.dataset.originalSrc = this.src;
        }
        const originalSrc = this.dataset.originalSrc;
        const filenameWithExt = originalSrc.substring(originalSrc.lastIndexOf('/') + 1);
        const filename = filenameWithExt.replace(/\.[^.]+$/, '');

        // Try WebP alternative for JPEGs once
        if (/\.(jpg|jpeg)$/i.test(filenameWithExt) && !this.dataset.webpTried) {
          this.dataset.webpTried = '1';
          const webpSrc = getBasePath() + `images/${filename}.webp`;
          if (IS_DEVELOPMENT) console.log(`Attempting WebP fallback for ${filenameWithExt}: ${webpSrc}`);
          this.src = webpSrc;
          return;
        }

        // Fallback to placeholder
        if (this.src !== placeholderSrc && !this.dataset.placeholderTried) {
          this.dataset.placeholderTried = '1';
          this.src = placeholderSrc;
          this.alt = `${this.alt || 'content image'} (placeholder)`;
          return;
        }
      });

      if (img.complete && img.naturalHeight > 0) {
        img.dispatchEvent(new Event('load'));
      } else if (img.complete && img.naturalHeight === 0 && img.src) {
        img.dispatchEvent(new Event('error'));
      }
    });
  }

  function preloadImages() {
    const criticalImages = [
      'LOGO.webp',
      'courtyard-of-the-building.webp',
      'dr-khatib-professional.webp',
    ];
    const basePath = getBasePath();

    criticalImages.forEach((imgName) => {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = `${basePath}images/${imgName}`;
      document.head.appendChild(preloadLink);
      if (IS_DEVELOPMENT) console.info(`Preloading image: ${preloadLink.href}`);
    });
  }

  function setupAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (accordionItems.length === 0) {
      if (IS_DEVELOPMENT) console.warn('No accordion items found.');
      return;
    }
    if (IS_DEVELOPMENT) console.log(`Initializing ${accordionItems.length} accordion items`);

    accordionItems.forEach((item, index) => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');

      if (!header || !content) {
        if (IS_DEVELOPMENT) console.warn('Accordion item missing header or content', item);
        return;
      }

      const baseId = header.id || `accordion-${Math.random().toString(36).substring(2, 9)}`;
      if (!header.id) header.id = `${baseId}-header`;
      if (!content.id) content.id = `${baseId}-content`;

      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-controls', content.id);

      const isActive = item.classList.contains('active');
      header.setAttribute('aria-expanded', String(isActive));
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', header.id);
      content.setAttribute('aria-hidden', String(!isActive));

      if (!isActive) {
        content.style.display = 'none';
      } else {
        content.style.display = 'block';
      }


      header.addEventListener('click', function (e) {
        e.preventDefault();
        const currentItem = this.closest('.accordion-item');
        if (!currentItem) return;

        const isActiveAfterToggle = currentItem.classList.toggle('active');
        this.setAttribute('aria-expanded', String(isActiveAfterToggle));

        const currentContent = currentItem.querySelector('.accordion-content');
        if (currentContent) {
          currentContent.style.display = isActiveAfterToggle ? 'block' : 'none';
          currentContent.setAttribute('aria-hidden', String(!isActiveAfterToggle));
        }

        if (IS_DEVELOPMENT) {
          console.log(
            `Toggled accordion: ${this.querySelector('span')?.textContent || 'FAQ Item'
            } - active: ${isActiveAfterToggle}`
          );
        }
        logUserAction('FAQ Accordion Toggle', {
          question: this.querySelector('span')?.textContent || 'FAQ Item',
          state: isActiveAfterToggle ? 'expanded' : 'collapsed'
        });
      });

      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  function setupContactForm() {
    if (!contactForm) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (IS_DEVELOPMENT) console.log('Contact form intersected, attaching listener.');
          attachFormListener();
          observer.unobserve(contactForm);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(contactForm);

    function attachFormListener() {
      contactForm.addEventListener('submit', function (e) {
        logUserAction('Form Submission Attempt', { formId: 'contact-form' });
      });
    }
  }



  function setupMapInteractionLogging() {
    if (!mapContainer) return;
    const mapPlaceholder = mapContainer.querySelector('.map-placeholder');

    if (!mapPlaceholder) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (IS_DEVELOPMENT) console.log('Map container intersected, setting up logging.');
          logUserAction('Map Visible', { action: 'map-view' });

          const loadMapAction = () => {
            logUserAction('Map Interaction', { action: 'map-click-or-enter' });
          };

          mapPlaceholder.addEventListener('click', loadMapAction, { once: true });
          mapPlaceholder.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              mapPlaceholder.click(); // Trigger the click event which mapLoader also listens to
            }
          }, { once: true }); // Ensure keydown also only triggers once for loading

          observer.unobserve(mapContainer);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(mapContainer);
  }

  /**
   * FIX: Correctly identifies the active navigation link by comparing absolute URLs.
   * This is more robust than the previous string-based comparison.
   */
  function setupActiveNavLinks() {
    if (!navMenu) return;

    const navLinks = Array.from(navMenu.querySelectorAll('.nav-link'));

    // Current cleaned path
    const currentPageUrl = new URL(window.location.href);
    const currentPath = currentPageUrl.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');

    // Reset all states first
    navLinks.forEach((link) => {
      const item = link.closest('.nav-item');
      if (item) item.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    // Set active for matching link(s)
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkUrl = new URL(href, window.location.origin);
      const linkPath = linkUrl.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');
      if (linkPath === currentPath) {
        const item = link.closest('.nav-item');
        if (item) item.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function setupLinkClickLogging() {
    if (!IS_DEVELOPMENT) return;

    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link || !link.href) return;

      const isNavLink = link.closest('.nav-menu');
      const isFooterLink = link.closest('footer');
      // const isPortalButton = link.classList.contains('portal-button');
      const hrefAttr = link.getAttribute('href') || '';
      const isPageAnchor = hrefAttr.startsWith('#') && hrefAttr.length > 1;
      const isHealowRelated = link.href.includes('healow.html') || link.href.includes('healow.com');


      if (isNavLink && !isPageAnchor && !isHealowRelated) {
        logUserAction('Navigation Click', {
          linkText: link.textContent?.trim(),
          href: link.getAttribute('href'),
        });
      } else if (isFooterLink && !isPageAnchor && !isHealowRelated) {
        logUserAction('Footer Link Click', {
          href: link.getAttribute('href'),
          linkText: link.textContent?.trim(),
        });
      }
    });
  }

  function setupHealowLinkNavigation() {
    document.body.addEventListener('click', (e) => {
      const healowLink = e.target.closest('a[href*="healow.html"], a[href*="healow.com"], .healow-portal-link');

      if (healowLink) {
        e.preventDefault();
        e.stopPropagation();

        const href = healowLink.href;
        const isExternal = href.includes('healow.com');

        if (IS_DEVELOPMENT) console.log(`Healow link clicked: ${href}`);
        logUserAction('Healow Link Navigation', { href: href });

        const menuWasClosed = closeMenuIfOpen();

        setTimeout(() => {
          if (isExternal) {
            window.open(href, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = href;
          }
        }, menuWasClosed ? 100 : 0);
      }
    });
  }

  /**
   * FIX: Adds functionality for the new resources page mobile navigation toggle.
   */
  function setupResourcesNavToggle() {
    const toggleButton = document.querySelector('.resources-nav-toggle');
    const resourcesNav = document.querySelector('.resources-nav');

    if (!toggleButton || !resourcesNav) {
      return; // Only run on the resources page
    }

    // Initial state setup for mobile
    if (window.innerWidth <= 768) {
      resourcesNav.classList.add('collapsed');
      toggleButton.setAttribute('aria-expanded', 'false');
    }

    toggleButton.addEventListener('click', () => {
      const isCollapsed = resourcesNav.classList.toggle('collapsed');
      toggleButton.setAttribute('aria-expanded', String(!isCollapsed));

      // Update button text/icon for clarity
      const icon = toggleButton.querySelector('i');
      const text = toggleButton.querySelector('span');
      if (isCollapsed) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        text.textContent = 'Page Sections';
      } else {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        text.textContent = 'Close Sections';
      }
    });

    // Respond to viewport changes
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && !resourcesNav.classList.contains('collapsed')) {
        resourcesNav.classList.add('collapsed');
        toggleButton.setAttribute('aria-expanded', 'false');
      } else if (!isMobile && resourcesNav.classList.contains('collapsed')) {
        resourcesNav.classList.remove('collapsed');
        toggleButton.setAttribute('aria-expanded', 'true');
      }
    }, { passive: true });
  }


  function setupSectionAnimations() {
    if (!sections.length) return;

    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in-visible');
              sectionObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -20px 0px'
        }
      );

      sections.forEach(section => {
        section.classList.add('fade-in-section');
        sectionObserver.observe(section);
      });
    } else {
      sections.forEach(section => {
        section.classList.add('fade-in-visible');
      });
    }
  }


  function getBasePath() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const isFile = segments.length > 0 && segments[segments.length - 1].includes('.');
    const dirDepth = isFile ? (segments.length - 1) : segments.length;
    return dirDepth > 0 ? '../'.repeat(dirDepth) : '';
  }


  function logPerformance(label, value, details = '') {
    if (IS_DEVELOPMENT) {
      console.debug(`Performance: ${label} - ${Math.round(value)}ms`, details);
    }
  }

  function logUserAction(action, data) {
    if (IS_DEVELOPMENT) {
      console.info(`User Action: ${action}`, data);
    }
  }


  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, { passive: true });

  setupMobileMenu();
  setupFixedHeader();
  setupSmoothScrolling();
  preloadImages();
  setupImageHandling();
  setupAccordion();
  setupContactForm();
  setupMapInteractionLogging();
  setupActiveNavLinks();
  setupLinkClickLogging();
  setupHealowLinkNavigation();
  setupSectionAnimations();
  setupResourcesNavToggle(); // Initialize resources page navigation toggle


  if (IS_DEVELOPMENT) {
    console.log('Khatib Family Practice JS initialized.');
  }
  logPerformance('JS Initialization Complete', performance.now());

}); // End DOMContentLoaded