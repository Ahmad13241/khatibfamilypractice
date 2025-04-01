/* Add to your styles.css or appropriate CSS file */

/* Base Image Styles */
.content-image {
  display: block; /* Prevent extra space below image */
  width: 100%;
  height: auto; /* Default height */
  object-fit: cover; /* Ensure image covers container */
  transition: opacity 0.4s ease-in-out, filter 0.4s ease-in-out;
  opacity: 1; /* Start visible by default */
  filter: blur(0);
}

/* Loading State */
.content-image.image-loading {
  opacity: 0.5; /* Indicate loading */
  /* Optional: Add a subtle blur while loading */
  /* filter: blur(5px); */
}

/* Loaded State */
.content-image.image-loaded {
  opacity: 1;
  filter: blur(0);
}

/* Placeholder Fallback */
.content-image.placeholder-fallback {
  object-fit: contain; /* Show the whole placeholder */
  background-color: var(--accent-color); /* Example background */
  border: 1px dashed var(--primary-color); /* Example border */
  padding: 5px;
}

/* Specific Container Styling (Examples - adjust as needed) */
.service-image,
.doctor-image,
.gallery-item {
  overflow: hidden; /* Clip the image within the container */
  position: relative; /* Needed for absolute positioning of img if using padding trick */
  /* Define aspect ratio or height via CSS */
  /* Example: aspect-ratio: 16 / 9; */
  /* Example: height: 400px; */
}

.service-image .content-image,
.doctor-image .content-image,
.gallery-item .content-image {
  height: 100%; /* Make image fill container height */
}

/* Responsive Image Container Heights (Example) */
@media (max-width: 992px) {
  .service-image { /* Example */
    height: 300px;
  }
  .doctor-image {
     height: 400px;
  }
}
@media (max-width: 768px) {
  .gallery-item { /* Example */
     height: 250px;
  }
}
@media (max-width: 576px) {
  .service-image {
     height: 250px;
  }
   .doctor-image {
     height: 350px;
  }
}


/* Accordion Animation */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  padding-top: 0;
  padding-bottom: 0;
  visibility: hidden; /* Hide content until expanded */
}

.accordion-item.active .accordion-content {
  max-height: 500px; /* Adjust max-height as needed */
  padding-top: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  visibility: visible;
}

/* Mobile Menu Body Lock */
body.menu-open {
  overflow: hidden;
  /* Add position: fixed; width: 100%; height: 100%; if overflow alone isn't sufficient on iOS */
  /* position: fixed; */
  /* width: 100%; */
  /* height: 100%; */
}

/* Feature Item Hover (Example) */
.feature-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}