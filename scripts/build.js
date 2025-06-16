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
const { marked } = require("marked");
const matter = require("gray-matter");

// Define paths
const ROOT_DIR = path.join(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const CSS_SRC_DIR = path.join(ROOT_DIR, "css");
const JS_SRC_DIR = path.join(ROOT_DIR, "js");
const POSTS_DIR = path.join(ROOT_DIR, "_posts");
const PAGES_DIR = path.join(ROOT_DIR, "pages");
const BLOG_TEMPLATE_PATH = path.join(PAGES_DIR, "blog", "blog-post-template.html");
const BLOG_LIST_TEMPLATE_PATH = path.join(PAGES_DIR, "blog.html");
const BLOG_OUTPUT_DIR = path.join(DIST_DIR, "pages", "blog");

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
fs.mkdirSync(BLOG_OUTPUT_DIR, { recursive: true }); // Ensure blog output directory exists

// --- Blog Generation Function ---
async function generateBlogPages() {
    console.log(chalk.cyan("Starting blog generation..."));

    if (!fs.existsSync(POSTS_DIR)) {
        console.warn(chalk.yellow("  ! _posts directory not found. Skipping blog generation."));
        return;
    }

    const postFiles = glob.sync(path.join(POSTS_DIR, "*.md").replace(/\\/g, "/"));
    if (postFiles.length === 0) {
        console.warn(chalk.yellow("  ! No markdown posts found in _posts. Skipping blog generation."));
        return;
    }

    // Read templates
    const postTemplate = fs.readFileSync(BLOG_TEMPLATE_PATH, "utf8");
    const listTemplate = fs.readFileSync(BLOG_LIST_TEMPLATE_PATH, "utf8");

    // Process all posts
    const posts = postFiles.map(file => {
        const fileContent = fs.readFileSync(file, "utf8");
        const { data, content } = matter(fileContent);
        const slug = path.basename(file, ".md").substring(11); // Remove YYYY-MM-DD-

        return {
            ...data,
            slug: slug,
            url: `/pages/blog/${slug}.html`,
            body: marked(content),
            date: new Date(data.date)
        };
    }).sort((a, b) => b.date - a.date);

    console.log(chalk.green(`  ✓ Found and processed ${posts.length} blog posts.`));

    // Generate recent posts list (HTML)
    const recentPostsList = posts.slice(0, 5).map(post =>
        `<li><a href="${post.slug}.html">${post.title}</a></li>`
    ).join("");

    // Generate individual blog post pages
    posts.forEach(post => {
        let output = postTemplate;

        const canonicalUrl = `https://khatibfamilypractice.com${post.url}`;

        // --- FIX START ---
        // Correctly construct image paths regardless of input
        const imageName = path.basename(post.image.src); // Ensures we only have the filename
        const absoluteImageUrl = `/images/blog/${imageName}`;
        const canonicalImageUrl = `https://khatibfamilypractice.com${absoluteImageUrl}`;
        // Path from /pages/blog/post.html to /images/blog/image.webp is ../../images/blog/image.webp
        const featuredImageSrc = `../../images/blog/${imageName}`;
        // --- FIX END ---

        const articleSchema = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
            "headline": post.title,
            "description": post.meta_description,
            "image": canonicalImageUrl, // Use corrected canonical URL
            "author": { "@type": "Person", "name": post.author },
            "publisher": {
                "@type": "Organization",
                "name": "Khatib Family Practice",
                "logo": { "@type": "ImageObject", "url": "https://khatibfamilypractice.com/images/LOGO.webp" }
            },
            "datePublished": post.date.toISOString().split('T')[0],
            "dateModified": post.date.toISOString().split('T')[0]
        };

        const tagsListHtml = post.tags ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

        output = output
            .replace(/{{POST_TITLE}}/g, post.title)
            .replace(/{{CANONICAL_URL}}/g, canonicalUrl)
            .replace(/{{META_DESCRIPTION}}/g, post.meta_description)
            .replace(/{{OG_TITLE}}/g, post.title)
            .replace(/{{OG_DESCRIPTION}}/g, post.excerpt)
            .replace(/{{OG_IMAGE}}/g, canonicalImageUrl) // Use corrected URL
            .replace(/{{OG_URL}}/g, canonicalUrl)
            .replace(/{{ARTICLE_SCHEMA}}/g, JSON.stringify(articleSchema, null, 2))
            .replace(/{{POST_PUBLISH_DATE}}/g, post.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
            .replace(/{{POST_AUTHOR}}/g, post.author)
            .replace(/{{FEATURED_IMAGE_SRC}}/g, featuredImageSrc) // Use corrected relative path
            .replace(/{{FEATURED_IMAGE_ALT}}/g, post.image.alt)
            .replace(/{{POST_BODY}}/g, post.body)
            .replace(/{{TAGS_LIST}}/g, tagsListHtml)
            .replace(/{{RECENT_POSTS_LIST}}/g, recentPostsList);

        fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, `${post.slug}.html`), output);
    });
    console.log(chalk.green(`  ✓ Generated ${posts.length} individual blog pages.`));

    // Generate blog listing page
    const blogGrid = posts.map(post => {
        // --- FIX START ---
        // Correctly construct image paths for the blog listing page
        const imageName = path.basename(post.image.src);
        // Path from /pages/blog.html to /images/blog/image.webp is ../images/blog/image.webp
        const cardImageSrc = `../images/blog/${imageName}`;
        // --- FIX END ---
        return `
        <article class="blog-card">
            <a href="blog/${post.slug}.html" class="blog-card-link-wrapper">
                <img src="${cardImageSrc}" alt="${post.image.alt}" class="blog-card-img" loading="lazy">
                <div class="blog-card-content">
                    <h3>${post.title}</h3>
                    <div class="blog-card-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${post.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span><i class="fas fa-user"></i> ${post.author}</span>
                    </div>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <span class="btn btn-primary">Read More</span>
                </div>
            </a>
        </article>
    `}).join("");

    const collectionPageSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Health & Wellness Blog | Khatib Family Practice",
        "description": "Expert insights from Dr. Nadim Khatib to help you stay healthy in Bullhead City and the Tri-State area.",
        "url": "https://khatibfamilypractice.com/pages/blog.html",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": posts.map((post, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://khatibfamilypractice.com${post.url}`,
                "name": post.title
            }))
        }
    };

    const listOutput = listTemplate
        .replace('{{BLOG_POSTS_GRID}}', blogGrid)
        .replace('{{COLLECTION_PAGE_SCHEMA}}', JSON.stringify(collectionPageSchema, null, 2));

    fs.writeFileSync(path.join(DIST_DIR, "pages", "blog.html"), listOutput);
    console.log(chalk.green("  ✓ Generated blog listing page."));
}


// --- 2. Copy static files (HTML, images, forms, etc.) ---
console.log("Copying static files...");
const copyFilesAndDirs = [
    { type: 'dir', src: 'images', dest: 'images' },
    { type: 'dir', src: 'forms', dest: 'forms' },
    { type: 'dir', src: 'admin', dest: 'admin' },
    { type: 'file', src: 'index.html', dest: 'index.html' },
    { type: 'file', src: 'netlify.toml', dest: 'netlify.toml' },
    { type: 'file', src: 'robots.txt', dest: 'robots.txt' },
    { type: 'file', src: 'sitemap.xml', dest: 'sitemap.xml' },
];

const pageHtmlFiles = glob.sync(path.join(PAGES_DIR, '*.html'));
pageHtmlFiles.forEach(htmlFile => {
    // Exclude blog.html as it will be generated dynamically
    if (path.basename(htmlFile) !== 'blog.html') {
        copyFilesAndDirs.push({
            type: 'file',
            src: path.join('pages', path.basename(htmlFile)),
            dest: path.join('pages', path.basename(htmlFile))
        });
    }
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
const cssFilesToBundle = glob.sync(path.join(DIST_DIR, "css", "*.css").replace(/\\/g, '/'));
const cssBundlePath = path.join(DIST_DIR, "css", "main.bundle.css");

if (cssFilesToBundle.length > 0) {
    const cssSources = {};
    cssFilesToBundle.forEach(file => {
        cssSources[file] = { styles: fs.readFileSync(file, 'utf8') };
    });

    const minifiedCssOutput = new CleanCSS({
        level: 2,
        compatibility: 'ie10',
        format: 'keep-breaks',
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
const jsProductionFiles = [
    path.join(JS_SRC_DIR, "main.js"),
    path.join(JS_SRC_DIR, "mapLoader.js"),
].filter(fs.existsSync);

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
                drop_console: true,
                drop_debugger: true,
                global_defs: {
                    "IS_DEVELOPMENT": false
                },
                evaluate: true,
            },
            mangle: {
                toplevel: true,
            },
            format: {
                comments: false,
            },
            sourceMap: false,
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
    const htmlFiles = glob.sync(path.join(directory, "**/*.html").replace(/\\/g, '/'));

    htmlFiles.forEach(htmlFile => {
        console.log(chalk.cyan(`  Processing HTML: ${path.relative(DIST_DIR, htmlFile)}`));
        let content = fs.readFileSync(htmlFile, "utf-8");

        const relativePath = path.relative(path.dirname(htmlFile), DIST_DIR);
        let prefix = relativePath ? (relativePath.replace(/\\/g, '/') + '/').replace(/^\.\//, '') : '';
        if (prefix === '/') prefix = '';

        content = content.replace(/<script[^>]+data-env="development"[^>]*><\/script>\s*/gi, '');

        content = content.replace(/<link\s+rel="stylesheet"\s+href="(?:\.\.\/)?css\/[^"?]+\.css(?:\?[^"]*)?"[^>]*>\s*/gi, '');
        content = content.replace(/<link\s+rel="preload"\s+href="(?:\.\.\/)?css\/[^"?]+\.css(?:\?[^"]*)?"[^>]*as="style"[^>]*>\s*/gi, '');

        const bundleCssLinkTag = `<link rel="stylesheet" href="${prefix}css/main.bundle.css">`;
        if (!content.includes(bundleCssLinkTag.replace('>', '')) && content.includes("</head>")) {
            content = content.replace("</head>", `    ${bundleCssLinkTag}\n</head>`);
        }

        const bundledJsFilesRegex = /(?:main|mapLoader)\.js/i;
        content = content.replace(new RegExp(`<script\\s+src="(\\.\\.\\/)?js\\/(${bundledJsFilesRegex.source})"[^>]*><\\/script>\\s*`, "gi"), '');

        const bundleJsLinkTag = `<script src="${prefix}js/main.bundle.js" defer></script>`;
        if (!content.includes(bundleJsLinkTag.replace(' defer></script>', '')) && content.includes("</body>")) {
            content = content.replace("</body>", `    ${bundleJsLinkTag}\n</body>`);
        }

        fs.writeFileSync(htmlFile, content);
    });
}

// --- Main Build Execution ---
(async () => {
    try {
        await generateBlogPages();
        await bundleAndMinifyJs();
        console.log("Processing HTML files...");
        processHtmlFiles(DIST_DIR);

        console.log(chalk.green("\nBuild completed successfully! ✓"));
        console.log("Production files are in the dist/ directory.");

    } catch (error) {
        console.error(chalk.red("\nBuild process failed:"), error);
        process.exit(1);
    }
})();