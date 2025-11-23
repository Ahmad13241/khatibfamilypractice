import './style.css';

// Header Template
const headerTemplate = `
  <div class="container header-container">
    <a href="/" class="logo">
      <img src="/images/LOGO.webp" alt="Khatib Family Practice Logo">
      <span>Khatib Family Practice</span>
    </a>
    <button class="mobile-toggle" aria-label="Toggle Menu">
      <span class="hamburger">☰</span>
    </button>
    <nav class="nav-menu">
      <a href="/" class="nav-link">Home</a>
      <a href="/src/pages/about.html" class="nav-link">About Dr. Khatib</a>
      <a href="/src/pages/services.html" class="nav-link">Services</a>
      <a href="/src/pages/resources.html" class="nav-link">Patient Resources</a>
      <a href="/src/pages/contact.html" class="nav-link">Contact</a>
      <a href="/src/pages/contact.html" class="btn btn-primary">Book Appointment</a>
    </nav>
  </div>
`;

// Footer Template
const footerTemplate = `
  <div class="container">
    <div class="footer-grid">
      <div class="footer-col">
        <h3>Khatib Family Practice</h3>
        <p>Personalized Adult Primary Care (21+) serving Bullhead City and the Tri-State area since 1998.</p>
      </div>
      <div class="footer-col">
        <h3>Quick Links</h3>
        <a href="/">Home</a>
        <a href="/src/pages/about.html">About Us</a>
        <a href="/src/pages/services.html">Services</a>
        <a href="/src/pages/resources.html">Patient Resources</a>
        <a href="/src/pages/contact.html">Contact</a>
      </div>
      <div class="footer-col">
        <h3>Contact Us</h3>
        <p>2755 Silver Creek Road, Suite 109<br>Bullhead City, AZ 86442</p>
        <p><a href="tel:+19287639009">(928) 763-9009</a></p>
        <p>Fax: (928) 758-7538</p>
      </div>
      <div class="footer-col">
        <h3>Office Hours</h3>
        <p>Mon - Fri: 8:00 AM - 5:00 PM</p>
        <p>Lunch: 12:00 PM - 1:00 PM</p>
        <p>Sat - Sun: Closed</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Khatib Family Practice. All rights reserved. | <a href="/src/pages/privacy.html" style="display:inline; color: inherit; text-decoration: underline;">Privacy Policy</a></p>
    </div>
  </div>
`;

document.addEventListener('DOMContentLoaded', () => {
  // Inject Header
  const headerElement = document.getElementById('main-header');
  if (headerElement) {
    headerElement.innerHTML = headerTemplate;

    // Highlight active link
    const currentPath = window.location.pathname;
    const navLinks = headerElement.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });
  }

  // Inject Footer
  const footerElement = document.getElementById('main-footer');
  if (footerElement) {
    footerElement.innerHTML = footerTemplate;
  }

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('is-open');

      // Update aria-expanded
      const isExpanded = navMenu.classList.contains('is-open');
      mobileToggle.setAttribute('aria-expanded', isExpanded);

      // Change icon
      const icon = mobileToggle.querySelector('.hamburger');
      if (icon) {
        icon.textContent = isExpanded ? '✕' : '☰';
      }
    });
  }
});
