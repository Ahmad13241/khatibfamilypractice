/**
 * Map Loader Utility
 * Provides lazy loading functionality for Google Maps iframes
 * to improve initial page load performance
 */

(function() {
    // Only load the map when it scrolls into view
    document.addEventListener('DOMContentLoaded', function() {
        const mapContainers = document.querySelectorAll('.map-container');
        
        if (!mapContainers.length) return;
        
        // Create a placeholder for each map
        mapContainers.forEach(function(container) {
            // Check if this container has already been processed
            if (container.classList.contains('map-processed')) return;
            
            // Store the original iframe if it exists
            const existingIframe = container.querySelector('iframe');
            
            if (existingIframe) {
                // Save the iframe source
                const mapSrc = existingIframe.getAttribute('src');
                const mapHeight = existingIframe.getAttribute('height') || '400';
                const mapWidth = existingIframe.getAttribute('width') || '100%';
                const mapTitle = existingIframe.getAttribute('title') || 'Google Map';
                const mapAriaLabel = existingIframe.getAttribute('aria-label') || '';
                const mapSandbox = existingIframe.getAttribute('sandbox') || '';
                
                // Create placeholder
                const placeholderDiv = document.createElement('div');
                placeholderDiv.className = 'map-placeholder';
                placeholderDiv.style.height = mapHeight + 'px';
                placeholderDiv.style.width = mapWidth;
                placeholderDiv.style.backgroundColor = '#f0f0f0';
                placeholderDiv.style.display = 'flex';
                placeholderDiv.style.alignItems = 'center';
                placeholderDiv.style.justifyContent = 'center';
                placeholderDiv.style.cursor = 'pointer';
                placeholderDiv.style.border = '1px solid #ddd';
                placeholderDiv.style.borderRadius = '4px';
                
                // Add placeholder content
                placeholderDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-map-marker-alt" style="font-size: 2rem; color: #2c5282; margin-bottom: 10px;"></i>
                        <p>Click to load map</p>
                        <p style="font-size: 0.8rem; margin-top: 5px;">Khatib Family Practice<br>2755 Silver Creek Road, Suite 109<br>Bullhead City, AZ 86442</p>
                    </div>
                `;
                
                // Replace the iframe with the placeholder
                existingIframe.remove();
                container.appendChild(placeholderDiv);
                
                // Store the iframe data as attributes on the container
                container.setAttribute('data-map-src', mapSrc);
                container.setAttribute('data-map-height', mapHeight);
                container.setAttribute('data-map-width', mapWidth);
                container.setAttribute('data-map-title', mapTitle);
                container.setAttribute('data-map-aria-label', mapAriaLabel);
                container.setAttribute('data-map-sandbox', mapSandbox);
                
                // Mark as processed
                container.classList.add('map-processed');
                
                // Setup intersection observer or click-to-load
                setupMapLoading(container);
            }
        });
    });
    
    // Setup map loading either by intersection observer or click
    function setupMapLoading(container) {
        if ('IntersectionObserver' in window) {
            // Use intersection observer for modern browsers
            const observer = new IntersectionObserver(
                function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            loadMap(container);
                            observer.unobserve(container);
                        }
                    });
                },
                { threshold: 0.1 } // Load when 10% of the map is visible
            );
            
            observer.observe(container);
        } else {
            // Fallback for browsers that don't support IntersectionObserver
            const placeholder = container.querySelector('.map-placeholder');
            if (placeholder) {
                placeholder.addEventListener('click', function() {
                    loadMap(container);
                });
            }
        }
    }
    
    // Load the map
    function loadMap(container) {
        // Get the stored map data
        const mapSrc = container.getAttribute('data-map-src');
        const mapHeight = container.getAttribute('data-map-height');
        const mapWidth = container.getAttribute('data-map-width');
        const mapTitle = container.getAttribute('data-map-title');
        const mapAriaLabel = container.getAttribute('data-map-aria-label');
        const mapSandbox = container.getAttribute('data-map-sandbox');
        
        if (!mapSrc) return;
        
        // Remove the placeholder
        const placeholder = container.querySelector('.map-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create and insert the iframe
        const iframe = document.createElement('iframe');
        iframe.src = mapSrc;
        iframe.width = mapWidth;
        iframe.height = mapHeight;
        iframe.style.border = '0';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        
        if (mapTitle) iframe.title = mapTitle;
        if (mapAriaLabel) iframe.setAttribute('aria-label', mapAriaLabel);
        if (mapSandbox) iframe.sandbox = mapSandbox;
        
        container.appendChild(iframe);
        
        // Log map interaction if the logging function exists
        if (window.KLogger && typeof window.KLogger.logUserAction === 'function') {
            KLogger.logUserAction('Map', { action: 'map-load' });
        }
    }
})(); 