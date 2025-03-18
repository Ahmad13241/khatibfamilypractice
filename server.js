/**
 * Khatib Family Practice Server
 * Supports both development and production environments
 * Enhanced with security features
 */

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Environment detection
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// =====================================
// SECURITY CONFIGURATION
// =====================================

// Remove X-Powered-By header first thing
app.disable('x-powered-by');

// Use Helmet for basic security headers - disable contentSecurityPolicy as we'll set it manually
app.use(helmet({
  contentSecurityPolicy: false, // We'll define a more specific CSP below
  xFrameOptions: { action: 'deny' }, // Prevent your page from being framed
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  noSniff: true, // Prevent MIME sniffing
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Custom security headers middleware with hardened setup
const securityHeadersMiddleware = (req, res, next) => {
  // Fixed Content Security Policy to address unsafe-inline, unsafe-eval, and wildcard issues
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://ajax.googleapis.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https://maps.google.com https://maps.gstatic.com; " +
    "frame-src https://www.google.com https://healow.com; " +
    "connect-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'"
  );
  
  // Prevent clickjacking - being explicit even though helmet sets this
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing - being explicit even though helmet sets this
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable HSTS (HTTP Strict Transport Security)
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Apply security headers middleware early in the chain
app.use(securityHeadersMiddleware);

// Cookie parser middleware (required for session)
app.use(cookieParser());

// Session configuration - enhanced security
app.use(session({
  genid: () => uuidv4(), // Generate unique session IDs
  secret: process.env.SESSION_SECRET || 'khatib-practice-secure-session',
  resave: false,
  saveUninitialized: false, // Prevent session creation until needed
  cookie: {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: isProduction, // Secure in production only
    sameSite: 'strict', // Prevent CSRF
    maxAge: 3600000, // 1 hour
    path: '/', // Restrict to root path
    domain: isProduction ? 'khatibfamilypractice.com' : undefined // Restrict to domain in production
  }
}));

// CSRF Protection - updated implementation
const csrfProtection = csrf({ 
  cookie: {
    key: '_csrf',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/'
  }
});

// Apply CSRF protection to all routes except some specific API endpoints
app.use((req, res, next) => {
  // Skip CSRF for certain routes if needed
  if (req.path === '/api/logs' && !isProduction) {
    return next();
  }
  
  // Apply CSRF protection
  csrfProtection(req, res, next);
});

// Parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS settings - more restrictive
const corsOptions = {
  origin: isProduction ? 'https://khatibfamilypractice.com' : 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
};
app.use(cors(corsOptions));

// Add debugging endpoint for headers (development only)
if (!isProduction) {
  app.get('/debug-headers', (req, res) => {
    const responseHeaders = {};
    
    // Get headers that will be sent in the response
    Object.keys(res._headers || {}).forEach(key => {
      responseHeaders[key] = res.getHeader(key);
    });
    
    res.json({
      headers: responseHeaders,
      environment: NODE_ENV
    });
  });
  
  // =====================================
  // DEVELOPMENT-ONLY CONFIGURATION
  // =====================================
  
  // Custom logging format for Morgan
  morgan.token('coloredMethod', (req) => {
    const method = req.method;
    switch (method) {
      case 'GET':
        return chalk.green(method);
      case 'POST':
        return chalk.yellow(method);
      case 'PUT':
        return chalk.blue(method);
      case 'DELETE':
        return chalk.red(method);
      default:
        return chalk.gray(method);
    }
  });

  morgan.token('coloredStatus', (req, res) => {
    const status = res.statusCode;
    if (status < 300) return chalk.green(status);
    if (status < 400) return chalk.cyan(status);
    if (status < 500) return chalk.yellow(status);
    return chalk.red(status);
  });

  morgan.token('timestamp', () => {
    return chalk.gray(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`);
  });

  // Custom middleware for detailed logging
  app.use(morgan((tokens, req, res) => {
    return [
      tokens.timestamp(req, res),
      tokens.coloredMethod(req, res),
      tokens.url(req, res),
      tokens.coloredStatus(req, res),
      tokens.res(req, res, 'content-length') || '0', 'bytes',
      '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ');
  }));
  
  // Development endpoint for client-side logs
  app.post('/api/logs', (req, res) => {
    const { level, message, details, timestamp } = req.body;
    
    // Format the log output
    let logMessage = `${chalk.gray(`[${timestamp}]`)} `;
    
    switch (level) {
      case 'info':
        logMessage += `${chalk.blue('INFO')} `;
        break;
      case 'warn':
        logMessage += `${chalk.yellow('WARN')} `;
        break;
      case 'error':
        logMessage += `${chalk.red('ERROR')} `;
        break;
      case 'debug':
        logMessage += `${chalk.magenta('DEBUG')} `;
        break;
      default:
        logMessage += `${chalk.white('LOG')} `;
    }
    
    logMessage += `${message}`;
    
    if (details) {
      logMessage += `\n${chalk.gray('Details:')} ${JSON.stringify(details, null, 2)}`;
    }
    
    console.log(logMessage);
    
    res.status(200).send('Log received');
  });
  
  // Track file access for detailed debugging
  app.get('*', (req, res, next) => {
    // Only track HTML, CSS, and JS files
    const ext = path.extname(req.path);
    if (['.html', '.css', '.js'].includes(ext)) {
      console.log(chalk.cyan('File accessed:'), chalk.white(req.path));
    }
    next();
  });
} else {
  // =====================================
  // PRODUCTION-ONLY CONFIGURATION
  // =====================================
  
  // Simple production logging
  app.use(morgan('combined'));
}

// =====================================
// SHARED CONFIGURATION (BOTH ENVIRONMENTS)
// =====================================

// Add explicit robots.txt handler before static files to ensure proper headers
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`
# Robots.txt for Khatib Family Practice
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /debug-headers
  `);
});

// Serve static files with security options
app.use(express.static(path.join(__dirname), {
  etag: true, // Enable ETag for caching
  lastModified: true, // Enable Last-Modified for caching
  maxAge: '1d', // Cache static assets for 1 day
  setHeaders: (res, path) => {
    // Add additional security headers for static files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Add Cache-Control header for specific file types
    if (path.endsWith('.html')) {
      // Don't cache HTML files
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      // Cache assets for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Middleware to provide CSRF token to templates
app.use((req, res, next) => {
  // For API routes, we'll apply CSRF protection selectively
  req.isApiRoute = req.path.startsWith('/api/');
  next();
});

// API endpoint to get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  return res.json({ csrfToken: req.csrfToken() });
});

// Form submission endpoint - works in both environments
app.post('/api/contact', csrfProtection, (req, res) => {
  // Validate the request
  if (!req.body.name || !req.body.email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }
  
  // Sanitize inputs (basic implementation)
  const sanitizedData = {
    name: req.body.name.replace(/[<>]/g, ''),
    email: req.body.email.replace(/[<>]/g, ''),
    message: req.body.message ? req.body.message.replace(/[<>]/g, '') : ''
  };
  
  if (isProduction) {
    // In production, this would send an email or connect to a CRM
    console.log('Contact form submission received');
    // Log sanitized data only
    res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } else {
    // In development, provide more detailed logging
    console.log(chalk.green('Contact form submission received:'));
    console.log(chalk.cyan('Form data:'), sanitizedData);
    res.status(200).json({ success: true, message: 'Form submitted successfully (development)' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error internally
  const errorId = uuidv4();
  
  if (isProduction) {
    // Simple generic error for production - no details exposed
    console.error(`Server Error [${errorId}]:`, err.message);
    // Don't expose error details to client
    res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.',
      errorId: errorId // Reference ID for support
    });
  } else {
    // Detailed error for development
    console.error(chalk.red(`Server Error [${errorId}]:`), err.stack);
    res.status(500).json({
      success: false,
      message: 'Something broke! Check the server logs for details.',
      errorId: errorId,
      error: err.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  if (isProduction) {
    console.log(`Khatib Family Practice server running in production mode on port ${PORT}`);
  } else {
    console.log('\n' + '-'.repeat(50));
    console.log(`${chalk.green('✓')} ${chalk.bold('Khatib Family Practice Development Server')}`);
    console.log(`${chalk.green('✓')} ${chalk.white('Server running at:')} ${chalk.cyan(`http://localhost:${PORT}`)}`);
    console.log(`${chalk.green('✓')} ${chalk.white('Comprehensive logging enabled')}`);
    console.log(`${chalk.green('✓')} ${chalk.white('Security measures enabled')}`);
    console.log('-'.repeat(50) + '\n');
  }
}); 