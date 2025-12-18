const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * Validate IP address format
 */
function isValidIP(ip) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate camera data
 */
function validateCamera(camera) {
  const errors = [];
  
  if (!camera.name || camera.name.trim() === '') {
    errors.push('Camera name is required');
  }
  
  if (!camera.ip_address || !isValidIP(camera.ip_address)) {
    errors.push('Valid IP address is required');
  }
  
  if (camera.port && (camera.port < 1 || camera.port > 65535)) {
    errors.push('Port must be between 1 and 65535');
  }
  
  if (!camera.stream_url || camera.stream_url.trim() === '') {
    errors.push('Stream URL is required');
  }
  
  return errors;
}

/**
 * GET /api/cameras - Get all cameras
 */
router.get('/', async (req, res) => {
  try {
    const cameras = await db.getAllCameras();
    res.json({ success: true, data: cameras });
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cameras' });
  }
});

/**
 * GET /api/cameras/:id - Get camera by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const camera = await db.getCameraById(req.params.id);
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    res.json({ success: true, data: camera });
  } catch (error) {
    console.error('Error fetching camera:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch camera' });
  }
});

/**
 * POST /api/cameras - Create new camera
 */
router.post('/', async (req, res) => {
  try {
    const errors = validateCamera(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    
    const id = await db.createCamera(req.body);
    const camera = await db.getCameraById(id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Camera added successfully',
      data: camera 
    });
  } catch (error) {
    console.error('Error creating camera:', error);
    res.status(500).json({ success: false, error: 'Failed to create camera' });
  }
});

/**
 * PUT /api/cameras/:id - Update camera
 */
router.put('/:id', async (req, res) => {
  try {
    const errors = validateCamera(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    
    const success = await db.updateCamera(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    
    const camera = await db.getCameraById(req.params.id);
    res.json({ 
      success: true, 
      message: 'Camera updated successfully',
      data: camera 
    });
  } catch (error) {
    console.error('Error updating camera:', error);
    res.status(500).json({ success: false, error: 'Failed to update camera' });
  }
});

/**
 * DELETE /api/cameras/:id - Delete camera
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await db.deleteCamera(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    
    res.json({ success: true, message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Error deleting camera:', error);
    res.status(500).json({ success: false, error: 'Failed to delete camera' });
  }
});

module.exports = router;
