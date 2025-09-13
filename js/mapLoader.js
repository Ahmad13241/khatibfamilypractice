/**
 * Map Loader Utility
 * Provides lazy loading functionality for Google Maps iframes
 * to improve initial page load performance - CORRECTED VERSION
 */

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        // Select the placeholders directly
        const mapPlaceholders = document.querySelectorAll('.map-placeholder');

        if (!mapPlaceholders.length) {
            // console.log("MapLoader: No map placeholders found.");
            return;
        }
        // console.log(`MapLoader: Found ${mapPlaceholders.length} map placeholders.`);

        mapPlaceholders.forEach(function (placeholder) {
            const container = placeholder.closest('.map-container');

            if (!container) {
                console.warn('MapLoader: Found a placeholder without a .map-container parent.', placeholder);
                return;
            }

            // Check if this container has already been processed (e.g., if script runs twice)
            if (container.classList.contains('map-loading-setup')) {
                // console.log("MapLoader: Skipping already processed container.", container);
                return;
            }

            // --- REMOVED: Code block that looked for an existing iframe ---
            // --- This block was incorrect for the current HTML structure ---

            // Directly set up the loading mechanism for the container
            setupMapLoading(container, placeholder);
            container.classList.add('map-loading-setup'); // Mark as processed
        });
    });

    // Setup map loading either by intersection observer or click
    function setupMapLoading(container, placeholder) {
        // Check if required data attributes exist on the placeholder
        if (!placeholder.dataset.mapSrc) {
            console.warn('MapLoader: Placeholder is missing data-map-src attribute.', placeholder);
            return;
        }

        if ('IntersectionObserver' in window) {
            // Use intersection observer for modern browsers
            const observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            // console.log("MapLoader: Map container intersecting, loading map.", container);
                            loadMap(container, placeholder);
                            observer.unobserve(container); // Stop observing once loaded
                        }
                    });
                },
                { threshold: 0.1 } // Load when 10% of the map is visible
            );

            observer.observe(container);
            // console.log("MapLoader: IntersectionObserver attached to container.", container);
        } else {
            // Fallback for browsers that don't support IntersectionObserver: Load on click
            // console.log("MapLoader: IntersectionObserver not supported, using click fallback.", placeholder);
            placeholder.addEventListener('click', function () {
                // console.log("MapLoader: Placeholder clicked, loading map.", container);
                loadMap(container, placeholder);
            }, { once: true }); // Remove listener after first click
        }
    }

    // Load the map
    function loadMap(container, placeholder) {
        // Get the map data from the placeholder's data attributes
        const mapSrc = placeholder.dataset.mapSrc;
        const mapHeight = placeholder.dataset.mapHeight || '450'; // Default height
        const mapWidth = placeholder.dataset.mapWidth || '100%'; // Default width
        const mapTitle = placeholder.dataset.mapTitle || 'Google Map';
        const mapAriaLabel = placeholder.dataset.mapAriaLabel || mapTitle; // Use title as fallback
        const mapSandbox = placeholder.dataset.mapSandbox || 'allow-scripts allow-same-origin allow-popups'; // Default sandbox

        if (!mapSrc) {
            console.error('MapLoader: Cannot load map, data-map-src is missing.', placeholder);
            return;
        }

        // console.log("MapLoader: Creating iframe with src:", mapSrc);

        // Create and insert the iframe
        const iframe = document.createElement('iframe');
        iframe.src = mapSrc;
        iframe.width = mapWidth;
        iframe.height = mapHeight;
        iframe.style.border = '0';
        iframe.loading = 'lazy'; // Still good practice
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.title = mapTitle;
        iframe.setAttribute('aria-label', mapAriaLabel);
        iframe.sandbox = mapSandbox;

        // Replace the placeholder content within the container
        container.innerHTML = ''; // Clear the container (removes placeholder)
        container.appendChild(iframe);
        container.classList.add('map-loaded'); // Add class to indicate map is loaded

        // Log map interaction if the logging function exists
        try {
            if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
                window.KLogger.logUserAction('Map Interaction', { action: 'map-load-triggered' });
            } else if (typeof window.logUserAction === 'function') {
                window.logUserAction('Map Interaction', { action: 'map-load-triggered' });
            }
        } catch (err) {
            // Swallow logging errors silently in production
        }
    }
})(); 