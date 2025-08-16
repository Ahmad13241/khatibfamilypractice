/**
 * Khatib Family Practice Website
 * Main JavaScript functionality - Refactored
 */

// Define IS_DEVELOPMENT at the top level
const IS_DEVELOPMENT = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));


document.addEventListener("DOMContentLoaded", function () {

  // --- Performance Logging ---
  logPerformance("DOM Content Loaded", performance.now());

  // --- Feature Flags / Config ---
  const SMOOTH_SCROLL_OFFSET_FIXED = 100;
  const SMOOTH_SCROLL_OFFSET_NORMAL = 100;

  // --- Element Selectors ---
  const body = document.body;
  const header = document.querySelector("header");
  const mobileToggle = document.querySelector(".mobile-toggle"); // Should be a <button>
  const navMenu = document.querySelector(".nav-menu"); // Should be a <ul>
  const menuBackdrop = document.querySelector(".menu-backdrop");
  const contactForm = document.getElementById("contact-form");
  const mapContainer = document.querySelector(".map-container");
  const featureItems = document.querySelectorAll(".feature-item");
  const serviceCards = document.querySelectorAll(".service-card");
  const sections = document.querySelectorAll('.services, .career-section, .about-doctor, .testimonials, .location, .hero, .resource-section, .contact-section, .testimonial-hero, .rating-overview-section, .share-reviews-section, .resources-intro');

  // --- Initialization Functions ---

  /**
   * Sets up mobile menu toggle functionality.
   */
  function setupMobileMenu() {
    if (!mobileToggle || !navMenu || !menuBackdrop) {
      if (IS_DEVELOPMENT) console.warn("Mobile menu elements not found.");
      return;
    }

    // Helper function to toggle menu state
    const toggleMenu = (open) => {
      const isActive = typeof open === "boolean" ? open : !navMenu.classList.contains("active");
      navMenu.classList.toggle("active", isActive);
      mobileToggle.classList.toggle("active", isActive);
      menuBackdrop.classList.toggle("active", isActive);
      body.classList.toggle("menu-open", isActive);
      mobileToggle.setAttribute("aria-expanded", String(isActive));
      updateHeaderHeight();
    };

    // Toggle on button click
    mobileToggle.addEventListener("click", (e) => {
      e.preventDefault(); // If it's a button, not strictly necessary but good practice
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking backdrop
    menuBackdrop.addEventListener("click", () => toggleMenu(false));

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        toggleMenu(false);
      }
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        toggleMenu(false);
      }
    });

    navMenu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && navMenu.classList.contains('active')) {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#') || href.includes('healow.html')) {
          toggleMenu(false);
        }
      }
    });
  }

  function updateHeaderHeight() {
    if (header) {
      requestAnimationFrame(() => {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
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
          if (!body.classList.contains("menu-open")) {
            const isFixed = lastScrollY > headerHeightThreshold;
            header.classList.toggle("fixed", isFixed);
            body.classList.toggle("has-fixed-header", isFixed);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  function setupSmoothScrolling() {
    document.body.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href");
      if (href.length <= 1 || href === "#") return;

      let targetElement;
      try {
        targetElement = document.querySelector(href);
      } catch (err) {
        if (IS_DEVELOPMENT) console.warn(`Invalid selector for smooth scroll: ${href}`);
        return;
      }

      if (targetElement) {
        e.preventDefault();

        const menuWasClosed = (() => {
          if (navMenu && navMenu.classList.contains("active")) {
            navMenu.classList.remove("active");
            if (mobileToggle) mobileToggle.classList.remove("active");
            if (menuBackdrop) menuBackdrop.classList.remove("active");
            body.classList.remove("menu-open");
            if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
            return true;
          }
          return false;
        })();

        setTimeout(() => {
          const headerOffset = header && header.classList.contains("fixed")
            ? SMOOTH_SCROLL_OFFSET_FIXED
            : SMOOTH_SCROLL_OFFSET_NORMAL;

          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }
          targetElement.focus({ preventScroll: true });

          logPerformance("Smooth Scroll to", performance.now(), href);
        }, menuWasClosed ? 100 : 0);
      }
    });
  }

  function setupImageHandling() {
    const images = document.querySelectorAll("img:not([data-no-lazy])");
    const placeholderSrc = getBasePath() + "images/LOGO.webp";

    images.forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.classList.add("content-image", "image-loading");

      img.addEventListener("load", function () {
        this.classList.remove("image-loading");
        this.classList.add("loaded");
        logPerformance("Image Loaded", performance.now(), img.src);
      }, { once: true });

      img.addEventListener("error", function () {
        if (IS_DEVELOPMENT) console.warn(`Failed to load image: ${this.src}. Attempting fallback.`);
        this.classList.remove("image-loading");
        this.classList.add("placeholder-fallback");

        const originalSrc = this.src;
        const filenameWithExt = originalSrc.substring(originalSrc.lastIndexOf('/') + 1);
        const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
        let usePlaceholder = true;

        if (/\.(jpg|jpeg)$/i.test(filenameWithExt)) {
          const webpSrc = getBasePath() + `images/${filename}.webp`;
          if (IS_DEVELOPMENT) console.log(`Attempting WebP fallback for ${filenameWithExt}: ${webpSrc}`);
        }

        if (usePlaceholder && this.src !== placeholderSrc) {
          this.src = placeholderSrc;
          this.alt = `${this.alt || 'content image'} (placeholder)`;
        } else if (!usePlaceholder) {
          this.alt = `Alternative image loaded for ${this.alt || 'content image'}`;
        }


        if (this.classList.contains("service-img")) {
          const serviceImageContainer = this.closest(".service-image");
          if (serviceImageContainer) {
            // CSS should style .service-image > img.placeholder-fallback
          }
        }
      }, { once: true });

      if (img.complete && img.naturalHeight > 0) {
        img.dispatchEvent(new Event('load'));
      } else if (img.complete && img.naturalHeight === 0 && img.src) {
        img.dispatchEvent(new Event('error'));
      }
    });
  }

  function preloadImages() {
    const criticalImages = [
      "LOGO.webp",
      "courtyard-of-the-building.webp",
      "dr-khatib-professional.webp",
    ];
    const basePath = getBasePath();

    criticalImages.forEach((imgName) => {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = `${basePath}images/${imgName}`;
      document.head.appendChild(preloadLink);
      if (IS_DEVELOPMENT) console.info(`Preloading image: ${preloadLink.href}`);
    });
  }

  function setupAccordion() {
    const accordionItems = document.querySelectorAll(".accordion-item");

    if (accordionItems.length === 0) {
      if (IS_DEVELOPMENT) console.warn("No accordion items found.");
      return;
    }
    if (IS_DEVELOPMENT) console.log(`Initializing ${accordionItems.length} accordion items`);

    accordionItems.forEach((item, index) => {
      const header = item.querySelector(".accordion-header");
      const content = item.querySelector(".accordion-content");

      if (!header || !content) {
        if (IS_DEVELOPMENT) console.warn("Accordion item missing header or content", item);
        return;
      }

      const baseId = header.id || `accordion-${Math.random().toString(36).substring(2, 9)}`;
      if (!header.id) header.id = `${baseId}-header`;
      if (!content.id) content.id = `${baseId}-content`;

      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.setAttribute("aria-controls", content.id);

      const isActive = item.classList.contains("active");
      header.setAttribute("aria-expanded", String(isActive));
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", header.id);
      content.setAttribute("aria-hidden", String(!isActive));

      if (!isActive) {
        content.style.display = 'none';
      } else {
        content.style.display = 'block';
      }


      header.addEventListener("click", function (e) {
        e.preventDefault();
        const currentItem = this.closest(".accordion-item");
        if (!currentItem) return;

        const isActiveAfterToggle = currentItem.classList.toggle("active");
        this.setAttribute("aria-expanded", String(isActiveAfterToggle));

        const currentContent = currentItem.querySelector('.accordion-content');
        if (currentContent) {
          currentContent.style.display = isActiveAfterToggle ? 'block' : 'none';
          currentContent.setAttribute('aria-hidden', String(!isActiveAfterToggle));
        }

        if (IS_DEVELOPMENT) {
          console.log(
            `Toggled accordion: ${this.querySelector("span")?.textContent || "FAQ Item"
            } - active: ${isActiveAfterToggle}`
          );
        }
        logUserAction("FAQ Accordion Toggle", {
          question: this.querySelector("span")?.textContent || "FAQ Item",
          state: isActiveAfterToggle ? "expanded" : "collapsed"
        });
      });

      header.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
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
          if (IS_DEVELOPMENT) console.log("Contact form intersected, attaching listener.");
          attachFormListener();
          observer.unobserve(contactForm);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(contactForm);

    function attachFormListener() {
      contactForm.addEventListener("submit", function (e) {
        logUserAction("Form Submission Attempt", { formId: "contact-form" });
      });
    }
  }

  function setupFeatureItemHovers() {
    // CSS :hover is sufficient
  }

  function setupMapInteractionLogging() {
    if (!mapContainer) return;
    const mapPlaceholder = mapContainer.querySelector('.map-placeholder');

    if (!mapPlaceholder) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (IS_DEVELOPMENT) console.log("Map container intersected, setting up logging.");
          logUserAction("Map Visible", { action: "map-view" });

          const loadMapAction = () => {
            logUserAction("Map Interaction", { action: "map-click-or-enter" });
          };

          mapPlaceholder.addEventListener("click", loadMapAction, { once: true });
          mapPlaceholder.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
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

    const navLinks = navMenu.querySelectorAll(".nav-link");
    // Get the current page's absolute URL and clean it up.
    const currentPageUrl = new URL(window.location.href);
    const currentPath = currentPageUrl.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');

    navLinks.forEach((link) => {
      const item = link.closest(".nav-item");
      if (!item) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Create an absolute URL for the link to compare apples to apples.
      const linkUrl = new URL(href, window.location.origin);
      const linkPath = linkUrl.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');

      // Deactivate all first
      item.classList.remove("active");
      link.removeAttribute('aria-current');

      // Check if the cleaned paths match.
      if (linkPath === currentPath) {
        item.classList.add("active");
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function setupLinkClickLogging() {
    if (!IS_DEVELOPMENT && typeof KLogger === 'undefined') return;

    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link || !link.href) return;

      const isNavLink = link.closest('.nav-menu');
      const isFooterLink = link.closest('footer');
      const isPortalButton = link.classList.contains('portal-button');
      const isPageAnchor = link.getAttribute('href').startsWith('#') && link.getAttribute('href').length > 1;
      const isHealowRelated = link.href.includes('healow.html') || link.href.includes('healow.com');


      if (isNavLink && !isPageAnchor && !isHealowRelated) {
        logUserAction("Navigation Click", {
          linkText: link.textContent?.trim(),
          href: link.getAttribute("href"),
        });
      } else if (isFooterLink && !isPageAnchor && !isHealowRelated) {
        logUserAction("Footer Link Click", {
          href: link.getAttribute("href"),
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
        logUserAction("Healow Link Navigation", { href: href });

        let menuWasClosed = false;
        if (navMenu && navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
          if (mobileToggle) mobileToggle.classList.remove("active");
          if (menuBackdrop) menuBackdrop.classList.remove("active");
          body.classList.remove("menu-open");
          if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
          menuWasClosed = true;
        }

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
  }

  function setupServiceCardEnhancements() {
    // CSS :hover is sufficient
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
    return dirDepth > 0 ? "../".repeat(dirDepth) : "";
  }


  function logPerformance(label, value, details = "") {
    if (IS_DEVELOPMENT && typeof KLogger !== 'undefined' && KLogger.logPerformance) {
      KLogger.logPerformance(label, Math.round(value), "ms", details);
    } else if (IS_DEVELOPMENT) {
      console.debug(`Performance: ${label} - ${Math.round(value)}ms`, details);
    }
  }

  function logUserAction(action, data) {
    if (IS_DEVELOPMENT && typeof KLogger !== 'undefined' && KLogger.logUserAction) {
      KLogger.logUserAction(action, data);
    } else if (IS_DEVELOPMENT) {
      console.info(`User Action: ${action}`, data);
    }
  }


  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight, { passive: true });

  setupMobileMenu();
  setupFixedHeader();
  setupSmoothScrolling();
  preloadImages();
  setupImageHandling();
  setupAccordion();
  setupContactForm();
  setupFeatureItemHovers();
  setupMapInteractionLogging();
  setupActiveNavLinks();
  setupLinkClickLogging();
  setupHealowLinkNavigation();
  setupServiceCardEnhancements();
  setupSectionAnimations();
  setupResourcesNavToggle(); // FIX: Initialize the new function


  if (IS_DEVELOPMENT) {
    console.log("Khatib Family Practice JS initialized.");
  }
  logPerformance("JS Initialization Complete", performance.now());

}); // End DOMContentLoaded