/**
 * Khatib Family Practice Website
 * Main JavaScript functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  // Performance logging for page initialization
  const domLoadTime = Date.now() - performance.timing.navigationStart;
  // Use conditional logging to avoid console statement warnings
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV !== "production"
  ) {
    console.info(`DOM loaded in ${domLoadTime}ms`);
  }

  // Mobile menu toggle - Universal implementation
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const body = document.body;

  // Remove any 'mobile-style' class as we're using CSS media queries instead
  if (navMenu && navMenu.classList.contains("mobile-style")) {
    navMenu.classList.remove("mobile-style");
  }

  // Remove any dynamically added mobile styles
  const existingMobileStyles = document.getElementById("mobile-menu-styles");
  if (existingMobileStyles) {
    existingMobileStyles.remove();
  }

  // Set header height CSS variable for proper mobile navigation
  function updateHeaderHeight() {
    const header = document.querySelector("header");
    if (header) {
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty(
        "--header-height",
        `${headerHeight}px`
      );
    }
  }

  // Run on load and resize
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);

  // Create menu backdrop for better UX
  const menuBackdrop = document.createElement("div");
  menuBackdrop.className = "menu-backdrop";
  document.body.appendChild(menuBackdrop);

  if (mobileToggle) {
    // Use simplified event handling that works across all devices
    mobileToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      toggleMobileMenu();
    });

    // Also handle touch events for better mobile compatibility
    mobileToggle.addEventListener(
      "touchend",
      function (e) {
        // Prevent default only if this is a tap (not a scroll or other gesture)
        if (!this.touchMoved) {
          e.preventDefault();
          e.stopPropagation();

          toggleMobileMenu();
          return false;
        }
      },
      { passive: false }
    );

    // Track touch movement to distinguish taps from scrolls
    mobileToggle.addEventListener(
      "touchstart",
      function () {
        this.touchMoved = false;
      },
      { passive: true }
    );

    mobileToggle.addEventListener(
      "touchmove",
      function () {
        this.touchMoved = true;
      },
      { passive: true }
    );

    // Helper function for toggling the menu
    function toggleMobileMenu() {
      const isOpening = !navMenu.classList.contains("active");

      // Before making any changes, ensure we have a clean state
      if (isOpening) {
        // Save the current scroll position before locking
        window.menuScrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;

        // Add classes in sequence
        menuBackdrop.classList.add("active");
        navMenu.classList.add("active");
        mobileToggle.classList.add("active");

        // Add body class last to trigger fixed positioning
        requestAnimationFrame(() => {
          body.classList.add("menu-open");
        });
      } else {
        // Save position for restoration
        const savedPosition = window.menuScrollPosition || 0;

        // Remove body class first to restore scrolling
        body.classList.remove("menu-open");

        // Then remove other classes
        navMenu.classList.remove("active");
        mobileToggle.classList.remove("active");
        menuBackdrop.classList.remove("active");

        // Restore scroll position with a delay to ensure rendering
        setTimeout(() => {
          window.scrollTo({
            top: savedPosition,
            behavior: "auto", // Use 'auto' instead of 'smooth' for more reliable restoration
          });
        }, 20);
      }

      // Update aria-expanded attribute
      mobileToggle.setAttribute(
        "aria-expanded",
        navMenu.classList.contains("active")
      );

      // Update header height after toggle
      setTimeout(updateHeaderHeight, 50);
    }
  }

  // Close mobile menu when clicking outside
  document.addEventListener(
    "click",
    function (e) {
      if (
        navMenu &&
        navMenu.classList.contains("active") &&
        !e.target.closest(".nav-menu") &&
        !e.target.closest(".mobile-toggle")
      ) {
        // Save the scroll position before removing classes
        const savedPosition = window.menuScrollPosition || 0;

        navMenu.classList.remove("active");
        mobileToggle.classList.remove("active");
        body.classList.remove("menu-open");
        menuBackdrop.classList.remove("active");

        // Update aria-expanded attribute
        mobileToggle.setAttribute("aria-expanded", "false");

        // Restore scroll position
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 10);
      }
    },
    { passive: true }
  );

  // Close menu when backdrop is clicked
  menuBackdrop.addEventListener(
    "click",
    function () {
      // Save the scroll position before removing classes
      const savedPosition = window.menuScrollPosition || 0;

      navMenu.classList.remove("active");
      mobileToggle.classList.remove("active");
      body.classList.remove("menu-open");
      this.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
      }, 10);
    },
    { passive: true }
  );

  // Handle smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener(
      "click",
      function (e) {
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
          e.preventDefault();

          // Close mobile menu if open before scrolling
          if (navMenu && navMenu.classList.contains("active")) {
            navMenu.classList.remove("active");
            mobileToggle.classList.remove("active");
            body.classList.remove("menu-open");
            menuBackdrop.classList.remove("active");
            mobileToggle.setAttribute("aria-expanded", "false");
          }

          // Allow a moment for menu cleanup before scrolling
          setTimeout(() => {
            const headerOffset = header.classList.contains("fixed")
              ? header.offsetHeight
              : 100;
            const targetPosition =
              target.getBoundingClientRect().top +
              window.pageYOffset -
              headerOffset;

            window.scrollTo({
              top: targetPosition,
              behavior: "smooth",
            });
          }, 50);
        }
      },
      { passive: false }
    );
  });

  // Add fixed header class on scroll
  const header = document.querySelector("header");
  const headerHeight = header.offsetHeight;

  // Set the CSS variable for header height
  document.documentElement.style.setProperty(
    "--header-height",
    `${headerHeight}px`
  );

  window.addEventListener("scroll", function () {
    if (window.scrollY > headerHeight) {
      header.classList.add("fixed");
      document.body.classList.add("has-fixed-header");
    } else {
      header.classList.remove("fixed");
      document.body.classList.remove("has-fixed-header");
    }
  });

  // Handle form submissions if form exists
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Log form submission attempt
      if (
        window.KLogger &&
        typeof window.KLogger.logUserAction === "function"
      ) {
        KLogger.logUserAction("Form Submission", {
          formId: "contact-form",
          fields: Object.fromEntries(new FormData(contactForm)),
        });
      }

      // Normally would submit the form data to a server
      // For now, just show a success message
      const formContainer = document.querySelector(".form-container");
      formContainer.innerHTML =
        '<div class="success-message"><i class="fas fa-check-circle"></i><h3>Thank you for your message!</h3><p>We will get back to you shortly.</p></div>';

      // Log successful form submission
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV !== "production"
      ) {
        console.info("Contact form submitted successfully");
      }
    });
  }

  // Handle all images for error fallback
  const images = document.querySelectorAll("img");

  // Determine base path for assets
  const getBasePath = () => {
    // Check if we're in the site root or in a subdirectory
    const path = window.location.pathname;
    // If we're in a subdirectory (pages/), we need to go up one level
    return path.includes("/pages/") ? "../" : "";
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

  images.forEach((img) => {
    // Add performance tracking for image loading
    img.addEventListener("load", function () {
      if (
        window.KLogger &&
        typeof window.KLogger.logPerformance === "function"
      ) {
        KLogger.logPerformance(
          "Image Loaded",
          Math.round(performance.now() - performance.timing.navigationStart),
          "ms"
        );
      }

      // Store the original width and height
      if (!this.dataset.originalWidth) {
        this.dataset.originalWidth = this.offsetWidth;
        this.dataset.originalHeight = this.offsetHeight;
      }
    });

    img.addEventListener("error", async function () {
      // Log image error
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Failed to load image: ${this.src}`);
      }

      // Special handling for known problematic images
      const imagePath = this.src.split("/").pop();
      if (
        imagePath === "reception-room-2.jpeg" ||
        imagePath === "courtyard.jpeg"
      ) {
        // Try the WebP version directly as we know JPEG is missing
        const basePath = getBasePath();

        // Map to correct filenames
        let webpPath;
        if (imagePath === "reception-room-2.jpeg") {
          webpPath = `${basePath}images/reception-room-2.webp`;
        } else if (imagePath === "courtyard.jpeg") {
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
        const absolutePathPlaceholder = "/images/placeholder.jpg";
        this.src = absolutePathPlaceholder;
      }

      this.alt = "Image currently unavailable";
      this.classList.add("placeholder-fallback");

      // Log the fallback
      if (process.env.NODE_ENV !== "production") {
        console.info(`Image replaced with placeholder: ${this.src}`);
      }
    });
  });

  // Update on window resize
  window.addEventListener("resize", function () {
    // Also update image handling on resize
    handleImageResize();
  });

  // Handle image resizing when window size changes - IMPROVED VERSION
  function handleImageResize() {
    // Handle all types of images that need responsive behavior
    const serviceImages = document.querySelectorAll(".service-img");
    const doctorImages = document.querySelectorAll(".doctor-img");
    const galleryImages = document.querySelectorAll(".gallery-image");

    // Log the resize event for debugging
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `Window resized: ${window.innerWidth}px × ${window.innerHeight}px`
      );
      console.info(
        `Found ${serviceImages.length} service images, ${doctorImages.length} doctor images, ${galleryImages.length} gallery images`
      );
    }

    // Handle service images
    if (serviceImages.length > 0) {
      serviceImages.forEach((img) => {
        // Ensure loaded state for proper display
        if (!img.classList.contains("loaded")) {
          img.classList.add("loaded");
        }

        // Remove any inline opacity styling that might be causing the disappearing effect
        if (img.style.opacity !== "1") {
          img.style.opacity = "1";
        }

        // Get parent container dimensions
        const container = img.closest(".service-image");
        if (container) {
          // For mobile responsive layout, let CSS handle dimensions
          if (window.innerWidth <= 992) {
            // Remove fixed height to let padding-bottom control aspect ratio
            container.style.height = "";
          } else {
            // For desktop, maintain the original fixed height
            container.style.height = "400px";
            // Reset any absolute positioning used for mobile
            img.style.position = "";
            img.style.top = "";
            img.style.left = "";
          }
        }
      });
    }

    // Handle doctor images - these need specific handling for doctor profile
    if (doctorImages.length > 0) {
      doctorImages.forEach((img) => {
        // Mark as loaded to avoid any fade-in issues
        if (!img.classList.contains("loaded")) {
          img.classList.add("loaded");
        }

        // Ensure proper display
        if (img.style.opacity !== "1") {
          img.style.opacity = "1";
        }

        // Handle containing element's responsive behavior
        const container = img.closest(".doctor-image");
        if (container) {
          // Set appropriate height based on viewport
          if (window.innerWidth <= 576) {
            container.style.height = "350px";
          } else if (window.innerWidth <= 992) {
            container.style.height = "400px";
          } else {
            container.style.height = "450px";
          }
        }
      });
    }

    // Handle gallery images with improved aspect ratio preservation
    if (galleryImages.length > 0) {
      galleryImages.forEach((img) => {
        // Ensure loaded state
        if (!img.classList.contains("loaded")) {
          img.classList.add("loaded");
        }

        // Make sure they're visible
        if (img.style.opacity !== "1") {
          img.style.opacity = "1";
        }

        // Set object-fit property to preserve aspect ratio
        img.style.objectFit = "cover";

        // Remove any inline height that might be causing stretching
        if (img.style.height) {
          img.style.height = "";
        }

        // Apply consistent width instead
        img.style.width = "100%";

        // Set the container height instead of the image height
        const galleryItem = img.closest(".gallery-item");
        if (galleryItem) {
          // Adjust container height based on viewport
          if (window.innerWidth <= 576) {
            galleryItem.style.height = "200px";
          } else if (window.innerWidth <= 768) {
            galleryItem.style.height = "220px";
          } else {
            galleryItem.style.height = "250px";
          }
        }
      });
    }
  }

  // Initialize image handling on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function () {
    // Preload important images
    preloadImages();

    // Initialize all images with proper attributes
    initializeAllImages();
  });

  // Initialize image handling on complete page load
  window.addEventListener("load", function () {
    // Apply resize handling to ensure correct dimensions
    handleImageResize();

    // Mark all successfully loaded images
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add("loaded");
        // Ensure proper display
        img.style.opacity = "1";
      }
    });
  });

  // Preload important images
  function preloadImages() {
    const criticalImages = [
      // JPEG/JPG versions
      "family-medicine.jpg",
      "preventative-care.jpg",
      "chronic-care.jpg",
      "outside-office.jpeg",
      "reception-room.jpeg",
      "examination-office.jpeg",
      // Updated names to match actual files
      "reception-room-2.webp", // Using webp as fallback since jpeg doesn't exist
      "courtyard-of-the-building.webp", // Updated from courtyard.jpeg
      "dr-khatib-professional.jpg",

      // WebP versions
      "family-medicine.webp",
      "preventative-care.webp",
      "chronic-care.jpg.webp",
      "outside-office.webp",
      "reception-room.webp",
      "examination-office.webp",
      "reception-room-2.webp",
      "courtyard-of-the-building.webp", // Updated from courtyard.webp
      "dr-khatib-professional.webp",

      // Placeholder
      "placeholder.jpg",
    ];

    const basePath = getBasePath();

    // Preload each critical image
    criticalImages.forEach((img) => {
      const preloadLink = document.createElement("link");
      preloadLink.rel = "preload";
      preloadLink.as = "image";
      preloadLink.href = `${basePath}images/${img}`;
      document.head.appendChild(preloadLink);

      // Log preloading
      console.info(`Preloading image: ${preloadLink.href}`);
    });
  }

  // Consolidated function to initialize all images with consistent behavior
  function initializeAllImages() {
    // Target all relevant image types in one pass
    const allContentImages = document.querySelectorAll(
      ".service-img, .card-img, .doctor-img, .gallery-image"
    );

    allContentImages.forEach((img) => {
      // Add lazy loading attribute for performance
      img.setAttribute("loading", "lazy");

      // Set consistent transition for all images
      img.style.transition = "opacity 0.3s ease, transform 0.3s ease";

      // Start with opacity 1 to prevent disappearing
      img.style.opacity = "1";

      // Add object-fit cover property to all images
      img.style.objectFit = "cover";

      // For service images specifically on mobile
      if (img.classList.contains("service-img") && window.innerWidth <= 992) {
        const serviceImage = img.closest(".service-image");
        if (serviceImage) {
          // Let CSS handle the sizing via padding-bottom
          serviceImage.style.height = "";
        }
      }

      // For gallery images specifically, add higher quality settings
      if (img.classList.contains("gallery-image")) {
        img.style.objectFit = "cover";
        img.style.width = "100%";
        img.style.height = "100%";

        // Remove any potential inline styles causing quality issues
        img.style.imageRendering = "auto";

        // Set appropriate parent container styles
        const container = img.closest(".gallery-item");
        if (container) {
          container.style.overflow = "hidden";
        }
      }

      // Listen for load event to ensure visibility
      img.addEventListener("load", function () {
        this.classList.add("loaded");
        this.style.opacity = "1";
        if (process.env.NODE_ENV !== "production") {
          console.info(`Image loaded successfully: ${this.src}`);
        }
      });

      // Add specific error handling for service images
      img.addEventListener("error", function () {
        if (this.classList.contains("service-img")) {
          const serviceImage = this.closest(".service-image");
          if (serviceImage) {
            // Apply a colored background if image fails to load
            serviceImage.style.backgroundColor = "var(--accent-color)";
          }
        }
      });
    });
  }

  // Add active class to current page in navigation
  const currentLocation = window.location.pathname;
  const navItems = document.querySelectorAll(".nav-menu li");

  navItems.forEach((item) => {
    const link = item.querySelector("a");
    const href = link.getAttribute("href");

    if (
      currentLocation.endsWith(href) ||
      (href === "index.html" &&
        (currentLocation === "/" || currentLocation.endsWith("/")))
    ) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Smooth scroll to anchors for service items
  const serviceLinks = document.querySelectorAll('.read-more, a[href^="#"]');

  serviceLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      // Only process internal links
      if (
        this.getAttribute("href").indexOf("#") === 0 ||
        this.getAttribute("href").indexOf("#") > 0
      ) {
        const targetId = this.getAttribute("href").split("#").pop();
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          event.preventDefault();

          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Expandable sections toggle for mobile
  const expandDetails = document.querySelectorAll(".service-expand details");

  expandDetails.forEach((detail) => {
    detail.addEventListener("toggle", function () {
      // Smooth scroll to expanded content if it opens
      if (this.open) {
        const rect = this.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        // If not fully visible, scroll it into view
        if (!isVisible) {
          this.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    });
  });

  // Initialize accordion functionality for FAQs
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  if (accordionHeaders.length > 0) {
    console.log(`Found ${accordionHeaders.length} accordion headers`);

    accordionHeaders.forEach((header) => {
      // Initialize - ensure all accordions are closed by default
      const accordionItem = header.closest(".accordion-item");
      if (accordionItem) {
        accordionItem.classList.remove("active");
      }

      header.addEventListener("click", function (e) {
        e.preventDefault();
        const accordionItem = this.closest(".accordion-item");

        if (accordionItem) {
          // Close all other accordions (optional - for accordion-style behavior)
          // document.querySelectorAll(".accordion-item.active").forEach(item => {
          //   if (item !== accordionItem) item.classList.remove("active");
          // });

          // Toggle the clicked accordion
          accordionItem.classList.toggle("active");

          // Update aria-expanded attribute
          const isExpanded = accordionItem.classList.contains("active");
          this.setAttribute("aria-expanded", isExpanded);

          // Log accordion state for debugging
          console.log(
            `Toggled accordion: ${
              this.querySelector("span")?.textContent || "FAQ Item"
            } - active: ${accordionItem.classList.contains("active")}`
          );

          // Scroll into view if needed when opening
          if (accordionItem.classList.contains("active")) {
            setTimeout(() => {
              const rect = accordionItem.getBoundingClientRect();
              const isFullyVisible =
                rect.top >= 0 && rect.bottom <= window.innerHeight;

              if (!isFullyVisible) {
                accordionItem.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }, 300); // Short delay to allow animation to start
          }

          // Log interaction if KLogger is available
          if (
            window.KLogger &&
            typeof window.KLogger.logUserAction === "function"
          ) {
            window.KLogger.logUserAction("FAQ Accordion", {
              action: accordionItem.classList.contains("active")
                ? "expand"
                : "collapse",
              question: this.querySelector("span")?.textContent || "FAQ Item",
            });
          }
        }
      });

      // Add keyboard accessibility
      header.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Mark as initialized to prevent double initialization from fallback
    window.accordionInitialized = true;
  } else {
    console.warn("No accordion headers found on page");
  }

  // Feature item hover effect
  const featureItems = document.querySelectorAll(".feature-item");

  featureItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)";
      this.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";
    });

    item.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });

  // Add event listeners with logging for all navigation links
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", function () {
      if (
        window.KLogger &&
        typeof window.KLogger.logUserAction === "function"
      ) {
        window.KLogger.logUserAction("Navigation", {
          linkText: this.textContent.trim(),
          href: this.getAttribute("href"),
        });
      }
    });
  });

  // Add event listeners to all links in the footer
  const footerLinks = document.querySelectorAll("footer a");
  footerLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Log the click with specific info
      if (
        window.KLogger &&
        typeof window.KLogger.logUserAction === "function"
      ) {
        KLogger.logUserAction("Footer Link Click", {
          href: this.getAttribute("href"),
        });
      }
    });
  });

  // Map interaction logging
  function initMapLogging() {
    console.log("Initializing map logging");
    const mapIframe = document.querySelector(".map-container iframe");

    if (mapIframe) {
      console.log("Map iframe found, logging interaction");

      // Log that the map was viewed
      if (
        window.KLogger &&
        typeof window.KLogger.logUserAction === "function"
      ) {
        KLogger.logUserAction("Map", { action: "map-view" });
      }

      // Add a click event listener to the map container to log interaction
      const mapContainer = document.querySelector(".map-container");
      if (mapContainer) {
        mapContainer.addEventListener("click", function () {
          if (
            window.KLogger &&
            typeof window.KLogger.logUserAction === "function"
          ) {
            KLogger.logUserAction("Map", { action: "map-click" });
          }
        });
      }
    } else {
      console.warn("Map iframe not found in the DOM");
    }
  }

  // Initialize map logging with a slight delay to ensure DOM is fully loaded
  setTimeout(function () {
    initMapLogging();
  }, 500);

  // Update event handlers for mobile menu close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      mobileToggle.classList.remove("active");
      body.classList.remove("menu-open");
      menuBackdrop.classList.remove("active");
      mobileToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Ensure accordion functionality is always initialized
  function initAccordion() {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    if (accordionHeaders.length > 0) {
      console.log(
        `Main.js initializing ${accordionHeaders.length} accordion headers`
      );

      // First make sure all accordions are properly closed
      document.querySelectorAll(".accordion-item").forEach((item) => {
        item.classList.remove("active");
      });

      // Then add click listeners to each header
      accordionHeaders.forEach((header) => {
        // Remove any existing listeners to avoid duplicates
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        newHeader.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          const accordionItem = this.closest(".accordion-item");

          if (accordionItem) {
            // Toggle the clicked accordion
            accordionItem.classList.toggle("active");

            // Update aria attributes
            const isExpanded = accordionItem.classList.contains("active");
            this.setAttribute("aria-expanded", isExpanded);

            console.log(
              `Main.js toggled accordion: ${
                this.querySelector("span")?.textContent || "FAQ Item"
              }`
            );
          }
        });
      });

      // Set the initialization flag
      window.accordionInitialized = true;
    }
  }

  // Call accordion initialization
  initAccordion();

  // Add specific handling for resource navigation items to ensure they navigate correctly
  const resourceNavItems = document.querySelectorAll(".resource-nav-item");
  resourceNavItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      // Only process if this is a link to another page (not an anchor)
      const href = this.getAttribute("href");
      if (href && !href.startsWith("#")) {
        // This is a navigation to another page, ensure normal link behavior
        // Don't prevent default, just ensure we're removing any menu classes
        if (body.classList.contains("menu-open")) {
          body.classList.remove("menu-open");
          navMenu.classList.remove("active");
          mobileToggle.classList.remove("active");
          menuBackdrop.classList.remove("active");
        }
      }
    });
  });

  // Document ready function - run immediately when DOM is ready
  (function () {
    // Special handling for resource navigation links, especially the healow portal link
    const healowLinks = document.querySelectorAll(
      '.healow-portal-link, a[href="healow.html"]'
    );

    if (healowLinks.length > 0) {
      healowLinks.forEach((link) => {
        ["click", "keydown", "touchend"].forEach((eventType) => {
          link.addEventListener(
            eventType,
            function (e) {
              // For keyboard navigation, only proceed on Enter or Space
              if (
                eventType === "keydown" &&
                !(e.key === "Enter" || e.key === " ")
              ) {
                return;
              }

              e.preventDefault(); // Prevent default to handle navigation manually
              e.stopPropagation(); // Stop event bubbling

              // Close mobile menu if open
              if (body.classList.contains("menu-open")) {
                body.classList.remove("menu-open");
                if (navMenu) navMenu.classList.remove("active");
                if (mobileToggle) mobileToggle.classList.remove("active");
                if (menuBackdrop) menuBackdrop.classList.remove("active");
              }

              // Force navigation to healow.html
              console.log("Navigating to healow.html");
              window.location.href = "healow.html";
            },
            { passive: false }
          );
        });
      });
    }
  })();

  // Add debounced scroll handler for smoother transitions
  let scrollTimeout;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
      }

      scrollTimeout = window.requestAnimationFrame(function () {
        // Only apply scroll-related changes if menu is not open
        if (!body.classList.contains("menu-open")) {
          // Handle fixed header
          if (window.scrollY > headerHeight) {
            if (!header.classList.contains("fixed")) {
              header.classList.add("fixed");
              document.body.classList.add("has-fixed-header");
            }
          } else {
            if (header.classList.contains("fixed")) {
              header.classList.remove("fixed");
              document.body.classList.remove("has-fixed-header");
            }
          }

          // Add a subtle class when user has scrolled past hero for better transitions
          const scrolledPastHero = window.scrollY > window.innerHeight * 0.5;
          document.body.classList.toggle(
            "scrolled-past-hero",
            scrolledPastHero
          );
        }
      });
    },
    { passive: true }
  );

  // Final check to ensure healow link functionality - runs after all other scripts
  document.addEventListener("DOMContentLoaded", function () {
    // Direct binding to healow links as a fallback
    const healowLinks = document.querySelectorAll(
      '.healow-portal-link, a[href="healow.html"]'
    );
    if (healowLinks.length > 0) {
      healowLinks.forEach((link) => {
        // Completely replace the existing element with a fresh one
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        // Add multiple event handlers to the new element
        newLink.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Direct healow navigation triggered");
          window.location.href = "healow.html";
        });

        // Make it keyboard accessible
        newLink.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = "healow.html";
          }
        });
      });
    }

    // Improve scrolling behavior on mobile devices
    if (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // Get all sections for scroll improvements
      const sections = document.querySelectorAll("section");

      // Improve touch scrolling
      let touchStartY = 0;
      let touchEndY = 0;

      document.addEventListener(
        "touchstart",
        function (e) {
          touchStartY = e.changedTouches[0].screenY;
        },
        { passive: true }
      );

      document.addEventListener(
        "touchend",
        function (e) {
          touchEndY = e.changedTouches[0].screenY;
          const touchDiff = touchStartY - touchEndY;

          // Only handle significant swipes
          if (Math.abs(touchDiff) > 50) {
            // Add a class to improve transitions during touch scrolling
            document.body.classList.add("touch-scrolling");

            // Remove the class after the scroll animation would complete
            setTimeout(() => {
              document.body.classList.remove("touch-scrolling");
            }, 500);
          }
        },
        { passive: true }
      );
    }
  });
});
