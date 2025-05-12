/**
 * Production Build Script
 * Prepares the Khatib Family Practice website for production deployment
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const glob = require("glob");

// Define paths
const ROOT_DIR = path.join(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const CSS_SRC_DIR = path.join(ROOT_DIR, "css");
const JS_SRC_DIR = path.join(ROOT_DIR, "js");

console.log(chalk.blue("Starting production build process..."));

// --- 1. Clean previous builds ---
console.log("Cleaning previous builds...");
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, "css"), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, "js"), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, "pages"), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, "images"), { recursive: true });
fs.mkdirSync(path.join(DIST_DIR, "forms"), { recursive: true });


// --- 2. Copy static files (HTML, images, forms, etc.) ---
console.log("Copying static files...");
const copyFilesAndDirs = [
    { type: 'dir', src: 'images', dest: 'images' },
    { type: 'dir', src: 'forms', dest: 'forms' },
    { type: 'file', src: 'index.html', dest: 'index.html' },
    { type: 'file', src: 'netlify.toml', dest: 'netlify.toml' },
    { type: 'file', src: 'robots.txt', dest: 'robots.txt' },
    { type: 'file', src: 'sitemap.xml', dest: 'sitemap.xml' },
    // Favicon files from images/favicon
    { type: 'dir', src: 'images/favicon', dest: 'images/favicon' }
];

// Copy HTML files from pages directory
const pageHtmlFiles = glob.sync(path.join(ROOT_DIR, 'pages', '*.html'));
pageHtmlFiles.forEach(htmlFile => {
    copyFilesAndDirs.push({
        type: 'file',
        src: path.join('pages', path.basename(htmlFile)),
        dest: path.join('pages', path.basename(htmlFile))
    });
});


copyFilesAndDirs.forEach(item => {
    const sourcePath = path.join(ROOT_DIR, item.src);
    const destPath = path.join(DIST_DIR, item.dest);
    if (fs.existsSync(sourcePath)) {
        if (item.type === 'dir') {
            fs.cpSync(sourcePath, destPath, { recursive: true });
            console.log(chalk.green(`  ✓ Directory copied: ${item.src} to ${item.dest}`));
        } else {
            fs.copyFileSync(sourcePath, destPath);
            console.log(chalk.green(`  ✓ File copied: ${item.src} to ${item.dest}`));
        }
    } else {
        console.warn(chalk.yellow(`  ! Source not found for copying: ${item.src}`));
    }
});

// --- 3. Copy CSS files individually first ---
console.log("Copying CSS files...");
// Fix: Construct glob pattern with forward slashes explicitly
const cssSearchPattern = `${CSS_SRC_DIR.replace(/\\/g, '/')}/*.css`;
const cssFiles = glob.sync(cssSearchPattern);

if (cssFiles.length > 0) {
    cssFiles.forEach(cssFile => {
        const destPath = path.join(DIST_DIR, "css", path.basename(cssFile));
        fs.copyFileSync(cssFile, destPath);
        console.log(chalk.green(`  ✓ CSS file copied: ${path.basename(cssFile)}`));
    });
} else {
    console.warn(chalk.yellow("  ! No CSS files found in css/ directory."));
}

// --- 4. CSS Minification and Bundling ---
console.log("Optimizing CSS files...");
// Now bundle from the DIST directory where we just copied the files
const cssFilesToBundle = glob.sync(path.join(DIST_DIR, "css", "*.css").replace(/\\/g, '/')); // Ensure forward slashes here too
const cssBundlePath = path.join(DIST_DIR, "css", "main.bundle.css");

if (cssFilesToBundle.length > 0) {
    const cssSources = {};
    cssFilesToBundle.forEach(file => {
        cssSources[file] = { styles: fs.readFileSync(file, 'utf8') };
    });

    const minifiedCssOutput = new CleanCSS({
        level: 2,
        compatibility: 'ie10', // Adjust if needed
        format: 'keep-breaks', // Optional for slight readability in bundled file
        inline: ['none']
    }).minify(cssSources);

    if (minifiedCssOutput.errors && minifiedCssOutput.errors.length > 0) {
        minifiedCssOutput.errors.forEach(err => console.error(chalk.red(`  ✗ CSS Error: ${err}`)));
    }
    if (minifiedCssOutput.warnings && minifiedCssOutput.warnings.length > 0) {
        minifiedCssOutput.warnings.forEach(warn => console.warn(chalk.yellow(`  ! CSS Warning: ${warn}`)));
    }

    fs.writeFileSync(cssBundlePath, minifiedCssOutput.styles);
    const originalCssSize = Object.values(cssSources).reduce((sum, src) => sum + src.styles.length, 0);
    const minifiedCssSize = minifiedCssOutput.styles.length;
    const cssReduction = originalCssSize > 0 ? (((originalCssSize - minifiedCssSize) / originalCssSize) * 100).toFixed(1) : "0.0";
    console.log(chalk.green(`  ✓ CSS bundled and minified to css/main.bundle.css (${cssReduction}% reduction)`));
} else {
    console.warn(chalk.yellow("  ! No CSS files found to bundle."));
    fs.writeFileSync(cssBundlePath, "/* No CSS files found */");
}

// --- 5. JavaScript Minification and Bundling ---
console.log("Optimizing JavaScript files...");
const jsProductionFiles = [ // Explicitly list production JS files
    path.join(JS_SRC_DIR, "main.js"),
    path.join(JS_SRC_DIR, "mapLoader.js"),
    // DO NOT include logger.js, security.js, cssLoader.js here
].filter(fs.existsSync); // Ensure files exist

const jsBundlePath = path.join(DIST_DIR, "js", "main.bundle.js");

async function bundleAndMinifyJs() {
    if (jsProductionFiles.length === 0) {
        console.warn(chalk.yellow("  ! No production JavaScript files specified or found to bundle."));
        fs.writeFileSync(jsBundlePath, "// No JS files bundled");
        return;
    }

    const jsCode = {};
    jsProductionFiles.forEach(file => {
        jsCode[path.basename(file)] = fs.readFileSync(file, 'utf8');
    });

    try {
        const minifiedResult = await minify(jsCode, {
            compress: {
                drop_console: true, // Remove console.* calls
                drop_debugger: true,
                // Define IS_DEVELOPMENT as false for production builds
                // This effectively dead-code eliminates blocks guarded by `if (IS_DEVELOPMENT)`
                global_defs: {
                    "IS_DEVELOPMENT": false
                },
                // Handle the process.env.NODE_ENV check more robustly
                // This attempts to replace the entire conditional check if possible
                // or at least the process.env.NODE_ENV part
                // Note: This might need refinement based on exact usage in main.js
                evaluate: true, // Allow terser to evaluate constant expressions

            },
            mangle: {
                toplevel: true, // Mangle top-level variable and function names
            },
            format: {
                comments: false, // Remove all comments
            },
            sourceMap: false, // No source maps for production bundle
        });

        if (minifiedResult.error) {
            throw minifiedResult.error;
        }

        fs.writeFileSync(jsBundlePath, minifiedResult.code);

        const originalJsSize = Object.values(jsCode).reduce((sum, code) => sum + code.length, 0);
        const minifiedJsSize = minifiedResult.code.length;
        const jsReduction = originalJsSize > 0 ? (((originalJsSize - minifiedJsSize) / originalJsSize) * 100).toFixed(1) : "0.0";
        console.log(chalk.green(`  ✓ JS bundled and minified to js/main.bundle.js (${jsReduction}% reduction)`));

    } catch (error) {
        console.error(chalk.red("  ✗ Error during JavaScript optimization:"), error);
        fs.writeFileSync(jsBundlePath, `// Error during JS optimization: ${error.message}`);
    }
}

// --- 6. Process HTML files to use optimized assets ---
function processHtmlFiles(directory) {
    const htmlFiles = glob.sync(path.join(directory, "**/*.html").replace(/\\/g, '/')); // Ensure forward slashes

    htmlFiles.forEach(htmlFile => {
        console.log(chalk.cyan(`  Processing HTML: ${path.relative(DIST_DIR, htmlFile)}`));
        let content = fs.readFileSync(htmlFile, "utf-8");

        // Determine asset prefix (e.g., '../' for files in pages/)
        const relativePath = path.relative(path.dirname(htmlFile), DIST_DIR);
        let prefix = relativePath ? (relativePath.replace(/\\/g, '/') + '/').replace(/^\.\//, '') : '';
        if (prefix === '/') prefix = ''; // For root files like index.html

        // Remove development-only scripts marked with data-env="development"
        content = content.replace(/<script[^>]+data-env="development"[^>]*><\/script>\s*/gi, '');
        console.log(chalk.gray(`    Removed dev-only scripts.`));

        // Remove individual CSS <link> tags (excluding critical inline <style>)
        // Updated regex to handle potential ../ prefix and query strings
        content = content.replace(/<link\s+rel="stylesheet"\s+href="(?:\.\.\/)?css\/[^"?]+\.css(?:\?[^"]*)?"[^>]*>\s*/gi, '');
        // Remove preload links for CSS
        content = content.replace(/<link\s+rel="preload"\s+href="(?:\.\.\/)?css\/[^"?]+\.css(?:\?[^"]*)?"[^>]*as="style"[^>]*>\s*/gi, '');
        console.log(chalk.gray(`    Removed individual CSS links.`));

        // Add the bundled CSS link inside <head> if not already (idempotent)
        const bundleCssLinkTag = `<link rel="stylesheet" href="${prefix}css/main.bundle.css">`;
        if (!content.includes(bundleCssLinkTag.replace('>', '')) && content.includes("</head>")) {
            content = content.replace("</head>", `    ${bundleCssLinkTag}\n</head>`);
            console.log(chalk.gray(`    Added bundled CSS link.`));
        }

        // Remove individual JS <script> tags for files that are now bundled
        const bundledJsFilesRegex = /(?:main|mapLoader)\.js/i; // Add other bundled JS filenames here
        content = content.replace(new RegExp(`<script\\s+src="(\\.\\.\\/)?js\\/(${bundledJsFilesRegex.source})"[^>]*><\\/script>\\s*`, "gi"), (match, p1, p2) => {
            console.log(chalk.gray(`    Removed individual JS script: js/${p2}`));
            return '';
        });

        // Add the bundled JS link before </body> if not already (idempotent)
        const bundleJsLinkTag = `<script src="${prefix}js/main.bundle.js" defer></script>`;
        if (!content.includes(bundleJsLinkTag.replace(' defer></script>', '')) && content.includes("</body>")) {
            content = content.replace("</body>", `    ${bundleJsLinkTag}\n</body>`);
            console.log(chalk.gray(`    Added bundled JS link.`));
        }

        fs.writeFileSync(htmlFile, content);
    });
}


// --- Main Build Execution ---
(async () => {
    try {
        await bundleAndMinifyJs();
        console.log("Processing HTML files...");
        processHtmlFiles(DIST_DIR); // Process root and pages/ HTML files

        console.log(chalk.green("\nBuild completed successfully! ✓"));
        console.log("Production files are in the dist/ directory.");

    } catch (error) {
        console.error(chalk.red("\nBuild process failed:"), error);
        process.exit(1);
    }
})();