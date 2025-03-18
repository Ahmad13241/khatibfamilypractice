/**
 * Khatib Family Practice Production Server
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic production logging - much simpler than development
app.use(morgan('combined'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Simple form submission endpoint
app.post('/api/contact', (req, res) => {
  // In production this would send an email or connect to a CRM
  // For now just log minimally and return success
  console.log('Contact form submission received');
  res.status(200).json({ success: true, message: 'Form submitted successfully' });
});

// Basic error handling for production
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).send('An error occurred. Please try again later.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Khatib Family Practice server running on port ${PORT}`);
});