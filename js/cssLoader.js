/**
 * CSS Loader Utility
 * Provides functionality for deferring non-critical CSS loading
 */

(function() {
    // Load CSS asynchronously to prevent render blocking
    function loadCSS(href, media = 'all') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = media;
        
        // Insert before first script
        const ref = document.getElementsByTagName('script')[0];
        ref.parentNode.insertBefore(link, ref);
        
        return link;
    }
    
    // Handle the 'onload' fallback for browsers that don't support it
    function onloadCSS(link, callback) {
        let called = false;
        
        function handleLoad() {
            if (!called && (!link.readyState || link.readyState === 'complete')) {
                called = true;
                callback();
            }
        }
        
        link.onload = handleLoad;
        
        // Fallback for older browsers
        if (link.readyState) {
            link.onreadystatechange = handleLoad;
        } else {
            // Set a timeout as additional fallback
            setTimeout(function() {
                if (!called) handleLoad();
            }, 2000);
        }
    }
    
    // Make functions available globally
    window.loadCSS = loadCSS;
    window.onloadCSS = onloadCSS;
    
    // Handle CSS preloads by finding preload links and loading them properly
    const preloads = document.querySelectorAll('link[rel=preload][as=style]');
    preloads.forEach(function(link) {
        // Extract the actual CSS URL
        const href = link.getAttribute('href');
        
        // Create a new non-blocking stylesheet link
        const cssLink = loadCSS(href);
        
        // Apply onload handler to switch rel attribute
        onloadCSS(cssLink, function() {
            // Remove the delegated link tag once loaded
            link.parentNode.removeChild(link);
        });
    });
})(); 