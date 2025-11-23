/**
 * Khatib Family Practice Server
 * Supports both development and production environments
 * Enhanced with security features
 */

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const moment = require("moment");
const helmet =require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csrf = require("csrf");
const { v4: uuidv4 } = require("uuid");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Environment detection
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// =====================================
// SECURITY CONFIGURATION
// =====================================

// Remove X-Powered-By header first thing
app.disable("x-powered-by");

// Use Helmet for basic security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // We define a more specific CSP below
    xFrameOptions: { action: "deny" },
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// Custom security headers middleware with a Content Security Policy (CSP)
// that matches the production CSP in netlify.toml for consistent behavior.
const securityHeadersMiddleware = (req, res, next) => {
  const inlineScriptSha = "'sha256-4qS6JuvqpYFYHPCBx0q2KwZFYO3xVSZFHgYvKNNS+4Q='"; // gtag inline script
  const inlineStyleSha = "'sha256-4+5YjO1sw32dZp1i9TbrdFvTJk2rTf2nOupWd4h9c2I='"; // critical css inline style

  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      `script-src 'self' https://www.googletagmanager.com ${inlineScriptSha}; ` +
      `style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com ${inlineStyleSha}; ` +
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
      "img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com *.google.com *.gstatic.com; " +
      "frame-src https://www.google.com https://healow.com; " +
      "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'; "
  );

  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
};

// Apply security headers middleware
app.use(securityHeadersMiddleware);

// --- NOTE ON LOCAL DEV vs. PROD ---
// The following session, cookie, and CSRF setup is for local development testing.
// In the Netlify production environment, form submissions are handled by Netlify Forms,
// and this server-side logic is not executed.

// Cookie parser middleware
app.use(cookieParser());

// Session configuration
app.use(
  session({
    genid: () => uuidv4(),
    secret: process.env.SESSION_SECRET || "khatib-practice-secure-session",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 3600000,
      path: "/",
      domain: isProduction ? "khatibfamilypractice.com" : undefined,
    },
  })
);

// CSRF Protection
const csrfTokens = new csrf();
app.use((req, res, next) => {
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = csrfTokens.secretSync();
  }
  next();
});

const csrfProtection = (req, res, next) => {
  if (req.path === "/api/logs" && !isProduction) {
    return next();
  }
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }
  const token = req.body._csrf || req.headers["x-csrf-token"];
  if (!token || !csrfTokens.verify(req.session.csrfSecret, token)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
};

// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS settings
const corsOptions = {
  origin: isProduction ? "https://khatibfamilypractice.com" : ["http://localhost:3000", "http://localhost:3001"], // Add BS proxy
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"],
};
app.use(cors(corsOptions));

// Development-only configurations
if (!isProduction) {
  app.get("/debug-headers", (req, res) => {
    res.json({
      headers: res.getHeaders(),
      environment: NODE_ENV,
    });
  });

  morgan.token("coloredMethod", (req) => chalk[req.method === "GET" ? "green" : "yellow"](req.method));
  morgan.token("coloredStatus", (req, res) => {
    const status = res.statusCode;
    const color = status >= 500 ? "red" : status >= 400 ? "yellow" : status >= 300 ? "cyan" : "green";
    return chalk[color](status);
  });
  morgan.token("timestamp", () => chalk.gray(`[${moment().format("HH:mm:ss")}]`));

  app.use(
    morgan((tokens, req, res) =>
      [
        tokens.timestamp(req, res),
        tokens.coloredMethod(req, res),
        tokens.url(req, res),
        tokens.coloredStatus(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res, 3),
        "ms",
      ].join(" ")
    )
  );

  app.post("/api/logs", (req, res) => {
    const { level, message, details, timestamp } = req.body;
    let color = chalk.white;
    if (level === "error") color = chalk.red;
    if (level === "warn") color = chalk.yellow;
    if (level === "info") color = chalk.blue;
    console.log(`${chalk.gray(`[${timestamp}]`)} ${color(level.toUpperCase())}: ${message}`, details || "");
    res.status(200).send("Log received");
  });
} else {
  app.use(morgan("combined"));
}

// Serve static files
app.use(
  express.static(path.join(__dirname), {
    maxAge: isProduction ? "1d" : 0,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  })
);

// Form submission endpoint (for local dev only)
app.post("/api/contact", csrfProtection, (req, res) => {
  if (!req.body.name || !req.body.email) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sanitizedData = {
    name: DOMPurify.sanitize(req.body.name.trim()),
    email: DOMPurify.sanitize(req.body.email.trim()),
    message: DOMPurify.sanitize(req.body.message.trim()),
  };
  
  console.log(chalk.green("Local contact form submission received:"), sanitizedData);
  res.status(200).json({ success: true, message: "Form submitted (dev)" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorId = uuidv4();
  console.error(chalk.red(`Server Error [${errorId}]:`), err);
  res.status(500).json({
    success: false,
    message: isProduction ? "An error occurred." : err.message,
    errorId: errorId,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log("\n" + "-".repeat(50));
  console.log(chalk.green.bold("Khatib Family Practice Server"));
  console.log(`  ${chalk.white("Status:")} ${chalk.cyan("Running")}`);
  console.log(`  ${chalk.white("Mode:")}   ${chalk.yellow(NODE_ENV)}`);
  console.log(`  ${chalk.white("URL:")}    ${chalk.cyan(`http://localhost:${PORT}`)}`);
  console.log("-".repeat(50) + "\n");
});