# Comprehensive Terminal Logging for Khatib Family Practice Website

This project includes a powerful development logging system that provides real-time insights into website behavior directly in your terminal.

## Features

- 🔍 **HTTP Request Logging**: See all HTTP requests with status codes, response times, and sizes
- 🐞 **JavaScript Error Tracking**: Automatic capture of all JavaScript errors and unhandled promise rejections
- 📊 **Performance Metrics**: Timing for page loads and critical rendering paths
- 🖱️ **User Interaction Logging**: Track clicks, form submissions, and other user interactions
- 📱 **Responsive Testing**: Browser-sync integration for multi-device testing with shared logging
- 🔄 **Live Reload**: Changes to files automatically refresh the browser

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server with comprehensive logging:
   ```bash
   npm run dev:sync
   ```

3. Open your browser to `http://localhost:3000`

## Using the Logging System

### Terminal Output

The terminal will display:
- HTTP requests with color-coded status codes
- File access tracking
- JavaScript console logs from the browser
- Error messages and stack traces
- Performance metrics

### Custom Logging in JavaScript

Add these to your JavaScript files to use enhanced logging:

```javascript
// Standard console methods are automatically captured
console.log('This will appear in terminal');
console.info('Information message');
console.warn('Warning message');
console.error('Error message');

// Enhanced logging with the KLogger object
KLogger.logUserAction('Button Click', { id: 'submit-btn', time: Date.now() });
KLogger.logPerformance('Image Load Time', 350, 'ms');
```

### Available Scripts

- `npm run dev`: Start the development server with nodemon
- `npm run bs`: Start browser-sync for live reload
- `npm run dev:sync`: Run both the server and browser-sync concurrently
- `npm run logs:clear`: Clear terminal logs and start fresh
- `npm start`: Run production server without development features

## Filtering Logs

Terminal log output uses color coding for easy scanning:
- 🟢 **Green**: Successful responses (2xx)
- 🔵 **Blue**: Information and redirects (3xx)
- 🟡 **Yellow**: Warnings and client errors (4xx)
- 🔴 **Red**: Server errors (5xx) and JavaScript exceptions

Use your terminal's search functionality to filter logs:
- `[INFO]` - Information messages
- `[ERROR]` - Error messages
- `[DEBUG]` - Debug information
- `File accessed:` - Track file access patterns
- `Performance:` - Performance metrics

## Troubleshooting

If logging isn't working:

1. Ensure you're running on `localhost` or `127.0.0.1`, not an IP address
2. Check that the logger.js script is properly loaded (should be auto-injected)
3. Verify your terminal supports color output
4. Try clearing logs with `npm run logs:clear`

## Extending the Logger

The logging system is designed to be extensible. To add custom logging:

1. Edit `js/logger.js` to add custom logging methods
2. Update `server.js` to handle and format new log types
3. Restart the development server

## Security Note

This logging system is for development purposes only. It should not be used in production as it:
1. Exposes detailed information about your application
2. Could impact performance
3. Might leak sensitive data

Always disable or remove this logging capability before deploying to production. 