/**
 * Khatib Family Practice Website
 * Security Functionality
 */

// Security module for Khatib Family Practice - Check if it already exists to avoid duplicate declaration
if (typeof window.KSecurity === 'undefined') {
    // Use a constant instead of variable to prevent redeclaration
    const KSecurity = (function() {
        // Store CSRF token
        let csrfToken = '';
        
        // Check for server-controlled headers
        const verifySecurityHeaders = () => {
            // Only check in development environment
            if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                && window.fetch) {
                
                fetch('/debug-headers')
                  .then(response => response.json())
                  .then(data => {
                    // Check for critical security headers
                    const headers = data.headers || {};
                    const missingHeaders = [];
                    
                    if (!headers['content-security-policy']) missingHeaders.push('Content-Security-Policy');
                    if (!headers['x-frame-options']) missingHeaders.push('X-Frame-Options');
                    if (!headers['x-content-type-options']) missingHeaders.push('X-Content-Type-Options');
                    if (!headers['referrer-policy']) missingHeaders.push('Referrer-Policy');
                    
                    if (missingHeaders.length > 0 && console) {
                      console.warn('Missing security headers:', missingHeaders.join(', '));
                    }
                  })
                  .catch(() => {
                    // Silently fail if endpoint doesn't exist
                  });
            }
        };
        
        // Get CSRF token from the server
        const getCsrfToken = async () => {
            try {
                const response = await fetch('/api/csrf-token', {
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    csrfToken = data.csrfToken;
                    return csrfToken;
                } else {
                    // Silent fail in production
                    if (process.env.NODE_ENV !== 'production' && console) {
                        console.error('Failed to fetch CSRF token');
                    }
                    return null;
                }
            } catch (error) {
                // Silent fail in production
                if (process.env.NODE_ENV !== 'production' && console) {
                    console.error('Error fetching CSRF token:', error);
                }
                return null;
            }
        };
        
        // Add CSRF token to forms
        const protectForms = () => {
            if (!csrfToken) return;
            
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                // Skip forms that already have the token
                if (form.querySelector('input[name="_csrf"]')) return;
                
                // Create and append CSRF token input
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_csrf';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            });
        };
        
        // Protect against clickjacking
        const protectAgainstClickjacking = () => {
            // Rely on server-side X-Frame-Options and CSP frame-ancestors
            if (window.self !== window.top) {
                // If we're in a frame and shouldn't be, break out
                window.top.location = window.self.location;
            }
        };
        
        // Initialize security measures
        const init = async () => {
            protectAgainstClickjacking();
            await getCsrfToken();
            protectForms();
            verifySecurityHeaders();
            
            // Add event listeners for dynamic forms
            document.addEventListener('DOMContentLoaded', () => {
                protectForms();
                
                // Re-apply protections when new content is loaded via AJAX
                const observer = new MutationObserver(() => {
                    protectForms();
                });
                
                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });
            });
        };
        
        // Public API
        return {
            init: init,
            getCsrfToken: getCsrfToken,
            protectForms: protectForms
        };
    })();

    // Initialize security features when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        KSecurity.init();
    });

    // Make security object available globally
    window.KSecurity = KSecurity;
} 