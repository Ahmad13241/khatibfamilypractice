/**
 * CSS Loader Utility
 * Provides functionality for deferring non-critical CSS loading
 */

(function () {
  // Load CSS asynchronously to prevent render blocking
  function loadCSS(href, media = "all") {
    // Add cache busting parameter for development
    if (href.indexOf("?") === -1) {
      href = href + "?v=" + new Date().getTime();
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.media = media;

    // Insert before first script
    const ref = document.getElementsByTagName("script")[0];
    ref.parentNode.insertBefore(link, ref);

    return link;
  }

  // Handle the 'onload' fallback for browsers that don't support it
  function onloadCSS(link, callback) {
    let called = false;

    function handleLoad() {
      if (!called && (!link.readyState || link.readyState === "complete")) {
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
      setTimeout(function () {
        if (!called) handleLoad();
      }, 2000);
    }
  }

  // Make functions available globally
  window.loadCSS = loadCSS;
  window.onloadCSS = onloadCSS;

  // Polyfill for rel=preload
  // From: https://github.com/filamentgroup/loadCSS
  (function (w) {
    if (!w.loadCSS) {
      return;
    }

    const rp = (loadCSS.relpreload = {});
    rp.support = (function () {
      try {
        return w.document.createElement("link").relList.supports("preload");
      } catch (e) {
        return false;
      }
    })();

    // Loop preload links and apply to full stylesheets
    rp.poly = function () {
      if (rp.support) {
        return;
      }
      const links = w.document.getElementsByTagName("link");
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (link.rel === "preload" && link.getAttribute("as") === "style") {
          w.loadCSS(link.href, link.media);
          link.rel = "finished-loading";
        }
      }
    };

    // Start the operation
    rp.poly();

    // If things load before DOMContentLoaded, we'll need to run again
    const run = w.setInterval(rp.poly, 300);

    // Stop polling after DOMContentLoaded
    if (w.addEventListener) {
      w.addEventListener("load", function () {
        rp.poly();
        w.clearInterval(run);
      });

      // Also run on DOMContentLoaded
      w.addEventListener("DOMContentLoaded", function () {
        rp.poly();
      });
    }

    if (w.attachEvent) {
      w.attachEvent("onload", function () {
        w.clearInterval(run);
      });
    }
  })(window);

  // Handle CSS preloads by finding preload links and loading them properly
  const preloads = document.querySelectorAll("link[rel=preload][as=style]");
  preloads.forEach(function (link) {
    // Extract the actual CSS URL
    const href = link.getAttribute("href");

    // Create a new non-blocking stylesheet link
    const cssLink = loadCSS(href);

    // Apply onload handler to switch rel attribute
    onloadCSS(cssLink, function () {
      // Remove the delegated link tag once loaded
      link.parentNode.removeChild(link);
    });
  });
})();
