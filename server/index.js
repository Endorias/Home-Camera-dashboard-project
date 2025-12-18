const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./database');
const camerasRouter = require('./routes/cameras');
const streamRouter = require('./routes/stream');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/cameras', camerasRouter);
app.use('/api/stream', streamRouter);

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database
db.init();

// Start server
app.listen(PORT, HOST, () => {
  console.log('===========================================');
  console.log('  IP Camera Viewer - Local Network Only');
  console.log('===========================================');
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Access from other devices: http://localhost:${PORT}`);
  console.log('===========================================');
});

module.exports = app;
