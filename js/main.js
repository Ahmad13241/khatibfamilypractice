/**
 * Khatib Family Practice Website
 * Main JavaScript functionality - Refactored
 */

document.addEventListener("DOMContentLoaded", function () {
  const isDevelopment =
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV !== "production";

  // --- Performance Logging ---
  logPerformance("DOM Content Loaded", performance.now());

  // --- Feature Flags / Config ---
  const SMOOTH_SCROLL_OFFSET_FIXED = 100; // Offset when header is fixed
  const SMOOTH_SCROLL_OFFSET_NORMAL = 100; // Offset when header is not fixed

  // --- Element Selectors ---
  const body = document.body;
  const header = document.querySelector("header");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const menuBackdrop = document.querySelector(".menu-backdrop"); // Assuming backdrop is created in HTML or CSS now
  const contactForm = document.getElementById("contact-form");
  const mapContainer = document.querySelector(".map-container");
  const featureItems = document.querySelectorAll(".feature-item");
  const serviceCards = document.querySelectorAll(".service-card");
  const sections = document.querySelectorAll('.services, .career-section, .about-doctor, .testimonials, .location');

  // --- Initialization Functions ---

  /**
   * Sets up mobile menu toggle functionality.
   */
  function setupMobileMenu() {
    if (!mobileToggle || !navMenu || !menuBackdrop) {
      if (isDevelopment) console.warn("Mobile menu elements not found.");
      return;
    }

    // Helper function to toggle menu state
    const toggleMenu = (open) => {
      const isActive = typeof open === "boolean" ? open : !navMenu.classList.contains("active");
      navMenu.classList.toggle("active", isActive);
      mobileToggle.classList.toggle("active", isActive);
      menuBackdrop.classList.toggle("active", isActive);
      body.classList.toggle("menu-open", isActive);
      mobileToggle.setAttribute("aria-expanded", isActive);
      updateHeaderHeight(); // Recalculate in case content shifted
    };

    // Toggle on button click
    mobileToggle.addEventListener("click", (e) => {
      e.preventDefault();
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

     // Close menu when a nav link (that's not just a hash link for the current page) is clicked
     navMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && navMenu.classList.contains('active')) {
            const href = link.getAttribute('href');
            // Close if it's not an anchor link on the same page or if it's the healow link special case
            if (!href || !href.startsWith('#') || href === 'healow.html') {
                 toggleMenu(false);
            }
            // If it *is* an anchor link, the smooth scroll handler will close it
        }
    });

  }

  /**
   * Sets the --header-height CSS variable.
   */
  function updateHeaderHeight() {
    if (header) {
      // Use requestAnimationFrame to read height after layout calculation
      requestAnimationFrame(() => {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );
      });
    }
  }

  /**
   * Sets up fixed header behavior on scroll.
   */
  function setupFixedHeader() {
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    const headerHeightThreshold = 50; // Only trigger if scrolled more than 50px

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only apply scroll-related changes if menu is not open
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
    handleScroll(); // Initial check
  }

  /**
   * Sets up smooth scrolling for anchor links.
   */
  function setupSmoothScrolling() {
    document.body.addEventListener("click", (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute("href");
      // Ensure it's not just a hash (#) or trying to select something invalid
      if (href.length <= 1) return;

      let targetElement;
      try {
        targetElement = document.querySelector(href);
      } catch (err) {
        if (isDevelopment) console.warn(`Invalid selector for smooth scroll: ${href}`);
        return; // Invalid selector
      }


      if (targetElement) {
        e.preventDefault();

        const closeMenuIfNeeded = () => {
            if (navMenu && navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                if (mobileToggle) mobileToggle.classList.remove("active");
                if (menuBackdrop) menuBackdrop.classList.remove("active");
                body.classList.remove("menu-open");
                if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
                return true; // Menu was closed
            }
            return false; // Menu was not open
        };

        const menuWasClosed = closeMenuIfNeeded();

        // Allow time for menu closing animation/layout shift before calculating scroll
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
            logPerformance("Smooth Scroll", performance.now());
        }, menuWasClosed ? 50 : 0); // Add delay only if menu was closed
      }
    });
  }

  /**
   * Initializes lazy loading and error handling for images.
   */
  function setupImageHandling() {
    const images = document.querySelectorAll(
      "img:not([data-no-lazy])" // Select all images unless explicitly excluded
    );
    const placeholderSrc = getBasePath() + "images/placeholder.jpg"; // Define placeholder path

    images.forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.classList.add("content-image", "image-loading"); // Add base classes

      // Load handler
      img.addEventListener("load", function () {
        this.classList.remove("image-loading");
        // *** FIX: Change 'image-loaded' to 'loaded' to match CSS ***
        this.classList.add("loaded");
        logPerformance("Image Loaded", performance.now(), img.src);
      }, { once: true }); // Run only once per image

      // Error handler
      img.addEventListener("error", function () {
        if (isDevelopment) console.warn(`Failed to load image: ${this.src}`);
        this.classList.remove("image-loading");
        this.classList.add("placeholder-fallback");

        // Special handling for known missing JPEGs with WebP alternatives
        const filename = this.src.split("/").pop();
        let usePlaceholder = true;

        if (filename === "reception-room-2.jpeg") {
            this.src = getBasePath() + "images/reception-room-2.webp";
            usePlaceholder = false;
        } else if (filename === "courtyard.jpeg") {
            this.src = getBasePath() + "images/courtyard-of-the-building.webp";
            usePlaceholder = false;
        }

        // Apply placeholder if no specific alternative was found or if the alternative also fails (error handler will run again)
        if (usePlaceholder && this.src !== placeholderSrc) {
            this.src = placeholderSrc;
        }

        this.alt = "Image currently unavailable";

        // Apply specific background for failed service images via CSS if needed
        if (this.classList.contains("service-img")) {
          const serviceImageContainer = this.closest(".service-image");
          if (serviceImageContainer) {
            // CSS should handle styling for .service-image > .placeholder-fallback
            // e.g., .service-image > img.placeholder-fallback { background-color: var(--accent-color); }
          }
        }
      }, { once: true }); // Run only once per image

      // Trigger load check for cached images
      if (img.complete && img.naturalHeight > 0) {
         img.dispatchEvent(new Event('load'));
      } else if (img.complete && img.naturalHeight === 0) {
         img.dispatchEvent(new Event('error'));
      }
    });
  }

  /**
   * Preloads critical images.
   */
  function preloadImages() {
    const criticalImages = [
      "LOGO.webp", // Ensure logo is preloaded
      "family-medicine.webp",
      "preventative-care.webp",
      "chronic-care.jpg.webp", // Assuming this naming convention exists
      "outside-office.webp",
      "reception-room.webp",
      "examination-office.webp",
      "dr-khatib-professional.webp",
      "placeholder.jpg",
      // Add other critical above-the-fold images here
    ];
    const basePath = getBasePath();

    criticalImages.forEach((imgName) => {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = `${basePath}images/${imgName}`;
      // Consider adding media queries for responsive images if applicable
      // preloadLink.media = "(max-width: 600px)";
      document.head.appendChild(preloadLink);
      if (isDevelopment) console.info(`Preloading image: ${preloadLink.href}`);
    });
  }

  /**
   * Sets up accordion functionality for FAQs.
   */
  function setupAccordion() {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    if (accordionHeaders.length === 0) {
        if (isDevelopment) console.warn("No accordion headers found.");
        return;
    }

    if (isDevelopment) console.log(`Initializing ${accordionHeaders.length} accordion headers`);

    // Ensure all are closed initially (via CSS preferably, but double-check here)
    document.querySelectorAll(".accordion-item.active").forEach(item => {
        item.classList.remove("active");
        const header = item.querySelector(".accordion-header");
        if (header) header.setAttribute("aria-expanded", "false");
    });


    accordionHeaders.forEach((header) => {
      header.setAttribute("aria-expanded", "false"); // Set initial state

      // Click listener
      header.addEventListener("click", function (e) {
        e.preventDefault();
        const accordionItem = this.closest(".accordion-item");
        if (!accordionItem) return;

        const isActive = accordionItem.classList.toggle("active");
        this.setAttribute("aria-expanded", isActive);

        if (isDevelopment) {
          console.log(
            `Toggled accordion: ${
              this.querySelector("span")?.textContent || "FAQ Item"
            } - active: ${isActive}`
          );
        }
        logUserAction("FAQ Accordion Toggle", {
            question: this.querySelector("span")?.textContent || "FAQ Item",
            state: isActive ? "expanded" : "collapsed"
        });
      });

      // Keyboard accessibility
      header.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click(); // Trigger the click handler
        }
      });
    });
  }

  /**
   * Sets up the contact form submission handler.
   */
  function setupContactForm() {
    if (!contactForm) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                if (isDevelopment) console.log("Contact form intersected, attaching listener.");
                attachFormListener();
                observer.unobserve(contactForm); // Stop observing once attached
            }
        });
    }, { threshold: 0.1 });

    observer.observe(contactForm);

    function attachFormListener() {
        contactForm.addEventListener("submit", function (e) {
            // e.preventDefault(); // REMOVED: Allow the form to submit naturally for Netlify processing

            logUserAction("Form Submission Attempt", {
                formId: "contact-form",
                // Consider logging only field names or omitting sensitive data
                // fields: Object.fromEntries(new FormData(contactForm)),
            });

            // REMOVED: showSuccessMessage() call
            // Netlify will handle the form submission and redirect the user to a success page
        });
    }

    function showSuccessMessage() {
        const formContainer = contactForm.closest(".form-container") || contactForm.parentNode;
        if (formContainer) {
            formContainer.innerHTML =
            '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you for your message!</h3><p>We will get back to you shortly.</p></div>';
        }
        if (isDevelopment) console.info("Contact form submitted (simulated).");
        logUserAction("Form Submission Success", { formId: "contact-form" });
    }

    // Add showErrorMessage function if implementing actual submission
    // function showErrorMessage(message) { ... }
  }

  /**
   * Sets up simple hover effects for feature items.
   */
  function setupFeatureItemHovers() {
    // Defer this if performance is critical, using IntersectionObserver on the parent section
    featureItems.forEach((item) => {
        // Use CSS for hover effects instead of JS for better performance
        // Add a class like .feature-item-interactive if needed
        // Example CSS:
        // .feature-item:hover {
        //   transform: translateY(-5px);
        //   box-shadow: var(--shadow-lg);
        // }
        // Remove JS-based style manipulation:
        // item.addEventListener("mouseenter", function () { ... });
        // item.addEventListener("mouseleave", function () { ... });
    });
  }

  /**
   * Sets up logging for map interactions.
   */
  function setupMapInteractionLogging() {
    if (!mapContainer) return;

     const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                if (isDevelopment) console.log("Map container intersected, setting up logging.");
                logUserAction("Map Visible", { action: "map-view" });

                // Add click listener only once map is potentially visible
                mapContainer.addEventListener("click", function logMapClick() {
                    logUserAction("Map Interaction", { action: "map-click" });
                    // Optional: Remove listener after first click if desired
                    // mapContainer.removeEventListener('click', logMapClick);
                }, { once: false }); // Set once: true if you only want to log the first click

                observer.unobserve(mapContainer); // Stop observing
            }
        });
    }, { threshold: 0.1 }); // Trigger when 10% is visible

    observer.observe(mapContainer);
  }

  /**
   * Sets up navigation link active state based on current URL.
   */
  function setupActiveNavLinks() {
    if (!navMenu) return;
    const currentLocation = window.location.pathname;
    const navLinks = navMenu.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const item = link.closest(".nav-item");
      if (!item) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Normalize href and location for comparison
      const linkPath = href.startsWith('../') ? href.substring(2) : href; // Handle relative paths
      const isIndex = linkPath === 'index.html';
      const isCurrentIndex = currentLocation.endsWith('/') || currentLocation.endsWith('/index.html');

      // Check if the link's path ends with the current location path
      // Or handle the index page case specifically
      let isActive = false;
      if (isIndex && isCurrentIndex) {
          isActive = true;
      } else if (!isIndex && currentLocation.endsWith(linkPath)) {
          isActive = true;
      }
      // Add more specific checks if needed, e.g., for query params or hashes

      item.classList.toggle("active", isActive);
      if (isActive) {
          link.setAttribute('aria-current', 'page');
      } else {
          link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Sets up event listeners for logging general link clicks.
   */
  function setupLinkClickLogging() {
    if (!isDevelopment && typeof KLogger === 'undefined') return; // Only log if needed

    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const isNavLink = link.closest('.nav-menu');
        const isFooterLink = link.closest('footer');

        if (isNavLink) {
            logUserAction("Navigation Click", {
                linkText: link.textContent?.trim(),
                href: link.getAttribute("href"),
            });
        } else if (isFooterLink) {
            logUserAction("Footer Link Click", {
                href: link.getAttribute("href"),
                linkText: link.textContent?.trim(),
            });
        }
        // Add other specific link types if needed
    });
  }

  /**
   * Handles navigation for Healow links specifically.
   */
   function setupHealowLinkNavigation() {
       document.body.addEventListener('click', (e) => {
           // Use closest to handle clicks on elements inside the link
           const healowLink = e.target.closest('a[href="healow.html"], .healow-portal-link');

           if (healowLink) {
               e.preventDefault();
               e.stopPropagation();

               if (isDevelopment) console.log("Healow link clicked, navigating...");
               logUserAction("Healow Link Navigation", { href: 'healow.html' });

               // Close mobile menu if open
               if (navMenu && navMenu.classList.contains("active")) {
                   navMenu.classList.remove("active");
                   if (mobileToggle) mobileToggle.classList.remove("active");
                   if (menuBackdrop) menuBackdrop.classList.remove("active");
                   body.classList.remove("menu-open");
                   if (mobileToggle) mobileToggle.setAttribute("aria-expanded", "false");
               }

               // Navigate after a short delay to allow potential menu closing animation
               setTimeout(() => {
                   window.location.href = healowLink.href || 'healow.html'; // Use link's href if available
               }, 50);
           }
       });

       // Add keyboard support (Enter/Space) via the delegated click listener
       // No separate keydown listener needed for standard link activation
   }

  /**
   * Initialize service card visual enhancements
   */
  function setupServiceCardEnhancements() {
    if (!serviceCards.length) return;

    serviceCards.forEach(card => {
      const icon = card.querySelector('.service-icon i');
      const title = card.querySelector('h3');
      const paragraph = card.querySelector('p');
      const readMore = card.querySelector('.read-more');

      // Add hover effects for desktop devices
      if (window.matchMedia('(min-width: 768px)').matches) {
        card.addEventListener('mouseenter', function() {
          if (icon) {
            icon.style.transform = 'scale(1.2)';
            icon.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.7)';
          }
          if (title) {
            title.style.transform = 'translateY(-3px)';
            title.style.color = 'var(--primary-dark)';
          }
          if (paragraph) {
            paragraph.style.color = 'var(--dark-color)';
          }

          // Add border highlight with animation
          this.style.borderColor = 'rgba(44, 82, 130, 0.15)';
          this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });

        card.addEventListener('mouseleave', function() {
          if (icon) {
            icon.style.transform = '';
            icon.style.textShadow = '';
          }
          if (title) {
            title.style.transform = '';
            title.style.color = '';
          }
          if (paragraph) {
            paragraph.style.color = '';
          }

          this.style.borderColor = '';
          this.style.boxShadow = '';
        });
      }
    });

    // Add pulse animation to CTA button
    const ctaButton = document.querySelector('.services-cta .btn-primary');
    if (ctaButton) {
      ctaButton.style.animation = 'pulse 2s infinite';

      // Define pulse animation if it doesn't exist
      if (!document.querySelector('style#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(44, 82, 130, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(44, 82, 130, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(44, 82, 130, 0);
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  /**
   * Initialize section animations
   */
  function setupSectionAnimations() {
    if (!sections.length) return;

    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              // Once the animation has played, no need to observe anymore
              sectionObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,  // Show when 15% of the section is visible
          rootMargin: '0px 0px -50px 0px'  // Adjust trigger area
        }
      );

      sections.forEach(section => {
        // Add initial styles
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

        // Observe the section
        sectionObserver.observe(section);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      sections.forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      });
    }
  }

  // --- Helper Functions ---

  /**
   * Gets the base path relative to the current HTML file.
   * Needed for correct asset paths (images, etc.).
   */
  function getBasePath() {
    // Assumes JS is in /js/ and HTML is in / or /pages/
    const path = window.location.pathname;
    return path.includes("/pages/") ? "../" : "";
  }

  /**
   * Logs performance metrics if in development.
   */
  function logPerformance(label, value, details = "") {
    if (isDevelopment && typeof KLogger !== 'undefined' && KLogger.logPerformance) {
      KLogger.logPerformance(label, Math.round(value), "ms", details);
    } else if (isDevelopment) {
      console.debug(`Performance: ${label} - ${Math.round(value)}ms`, details);
    }
  }

   /**
   * Logs user actions if in development or if KLogger is defined.
   */
  function logUserAction(action, data) {
    if (isDevelopment && typeof KLogger !== 'undefined' && KLogger.logUserAction) {
      KLogger.logUserAction(action, data);
    } else if (isDevelopment) {
      console.info(`User Action: ${action}`, data);
    }
  }


  // --- Run Initialization ---
  updateHeaderHeight(); // Initial call
  window.addEventListener("resize", updateHeaderHeight, { passive: true }); // Update on resize

  setupMobileMenu();
  setupFixedHeader();
  setupSmoothScrolling();
  preloadImages(); // Preload critical assets
  setupImageHandling(); // Setup lazy loading and error handling
  setupAccordion();
  setupContactForm();
  setupFeatureItemHovers(); // Consider deferring this if needed
  setupMapInteractionLogging(); // Deferred via IntersectionObserver
  setupActiveNavLinks();
  setupLinkClickLogging(); // General logging for clicks
  setupHealowLinkNavigation(); // Specific handler for healow links
  setupServiceCardEnhancements();
  setupSectionAnimations();


  // --- Final Log ---
  if (isDevelopment) {
    console.log("Khatib Family Practice JS initialized.");
  }
  logPerformance("JS Initialization Complete", performance.now());

}); // End DOMContentLoaded