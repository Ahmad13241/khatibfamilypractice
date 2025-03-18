/**
 * Khatib Family Practice
 * Client-side logging utility for development debugging
 */

(function() {
  // Only initialize the logger in development environment
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isLocalhost) return;
  
  const API_URL = '/api/logs';
  
  // Store original console methods
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  
  // Helper function to get formatted timestamp
  function getTimestamp() {
    const now = new Date();
    return now.toISOString();
  }
  
  // Helper function to send logs to server
  function sendToServer(level, message, details) {
    try {
      const logData = {
        level,
        message: typeof message === 'object' ? JSON.stringify(message) : String(message),
        details: details || null,
        timestamp: getTimestamp(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      }).catch(err => {
        // Silent fail to avoid infinite loops
        originalConsole.error('Logger failed to send log:', err);
      });
    } catch (e) {
      // Silent fail
      originalConsole.error('Logger error:', e);
    }
  }
  
  // Override console methods
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
    sendToServer('log', args[0], args.slice(1));
  };
  
  console.info = function(...args) {
    originalConsole.info.apply(console, args);
    sendToServer('info', args[0], args.slice(1));
  };
  
  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    sendToServer('warn', args[0], args.slice(1));
  };
  
  console.error = function(...args) {
    originalConsole.error.apply(console, args);
    sendToServer('error', args[0], args.slice(1));
  };
  
  console.debug = function(...args) {
    originalConsole.debug.apply(console, args);
    sendToServer('debug', args[0], args.slice(1));
  };
  
  // Add custom logger methods
  window.KLogger = {
    /**
     * Log an event with the specified level
     * @param {string} level - Log level (log, info, warn, error, debug)
     * @param {string} message - Main log message
     * @param {object} details - Additional details to log
     */
    log: function(level, message, details) {
      originalConsole[level] ? originalConsole[level](message, details) : originalConsole.log(message, details);
      sendToServer(level, message, details);
    },
    
    /**
     * Log user interaction events
     * @param {string} action - The action performed
     * @param {object} data - Related data
     */
    logUserAction: function(action, data) {
      originalConsole.info(`User Action: ${action}`, data);
      sendToServer('info', `User Action: ${action}`, data);
    },
    
    /**
     * Log performance metrics
     * @param {string} label - Metric label
     * @param {number} value - Metric value
     * @param {string} unit - Unit of measurement
     */
    logPerformance: function(label, value, unit) {
      originalConsole.debug(`Performance: ${label} - ${value}${unit ? ' ' + unit : ''}`);
      sendToServer('debug', `Performance: ${label}`, { value, unit });
    }
  };
  
  // Capture global errors
  window.addEventListener('error', function(event) {
    sendToServer('error', 'Uncaught Error: ' + event.message, {
      lineNo: event.lineno,
      colNo: event.colno,
      filename: event.filename,
      stack: event.error ? event.error.stack : null
    });
  });
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    sendToServer('error', 'Unhandled Promise Rejection', {
      reason: event.reason ? event.reason.toString() : 'Unknown reason'
    });
  });
  
  // Log page load time
  window.addEventListener('load', function() {
    setTimeout(function() {
      const pageLoadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      if (window.KLogger && typeof window.KLogger.logPerformance === 'function') {
        window.KLogger.logPerformance('Page Load Time', pageLoadTime, 'ms');
      }
    }, 0);
  });
  
  // Test log to confirm the logger is working - use originalConsole to avoid warnings
  originalConsole.info('Client-side logger initialized for development environment');
})(); 