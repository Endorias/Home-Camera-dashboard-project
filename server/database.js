const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cameras.json');

// In-memory data store
let cameras = [];
let nextId = 1;

/**
 * Load cameras from JSON file
 */
function loadData() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      cameras = data.cameras || [];
      nextId = data.nextId || 1;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    cameras = [];
    nextId = 1;
  }
}

/**
 * Save cameras to JSON file
 */
function saveData() {
  try {
    const data = {
      cameras,
      nextId,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

/**
 * Initialize database schema
 */
function init() {
  loadData();
  console.log('Database initialized successfully');
  
  // Add sample data if no cameras exist
  if (cameras.length === 0) {
    console.log('Adding sample camera data...');
    addSampleData();
  }
}

/**
 * Add sample camera data for demonstration
 */
function addSampleData() {
  const samples = [
    {
      name: 'Front Door Camera',
      ip_address: '192.168.1.100',
      port: 554,
      stream_url: 'rtsp://192.168.1.100:554/stream1',
      stream_type: 'rtsp',
      location: 'Front Door',
      notes: 'Main entrance monitoring',
      enabled: 1
    },
    {
      name: 'Backyard Camera',
      ip_address: '192.168.1.101',
      port: 8080,
      stream_url: 'http://192.168.1.101:8080/video',
      stream_type: 'mjpeg',
      location: 'Backyard',
      notes: 'Garden and pool area',
      enabled: 1
    }
  ];
  
  samples.forEach(cam => {
    createCamera(cam);
  });
  
  console.log('Sample camera data added');
}

/**
 * Get all cameras
 */
function getAllCameras() {
  return Promise.resolve([...cameras]);
}

/**
 * Get camera by ID
 */
function getCameraById(id) {
  const camera = cameras.find(c => c.id === parseInt(id));
  return Promise.resolve(camera);
}

/**
 * Create new camera
 */
function createCamera(camera) {
  const now = new Date().toISOString();
  const newCamera = {
    id: nextId++,
    name: camera.name,
    ip_address: camera.ip_address,
    port: camera.port || 554,
    stream_url: camera.stream_url,
    stream_type: camera.stream_type || 'mjpeg',
    username: camera.username || null,
    password: camera.password || null,
    location: camera.location || null,
    notes: camera.notes || null,
    enabled: camera.enabled !== undefined ? camera.enabled : 1,
    created_at: now,
    updated_at: now
  };
  
  cameras.push(newCamera);
  saveData();
  return Promise.resolve(newCamera.id);
}

/**
 * Update camera
 */
function updateCamera(id, camera) {
  const index = cameras.findIndex(c => c.id === parseInt(id));
  if (index === -1) {
    return Promise.resolve(false);
  }
  
  cameras[index] = {
    ...cameras[index],
    name: camera.name,
    ip_address: camera.ip_address,
    port: camera.port || 554,
    stream_url: camera.stream_url,
    stream_type: camera.stream_type || 'mjpeg',
    username: camera.username || null,
    password: camera.password || null,
    location: camera.location || null,
    notes: camera.notes || null,
    enabled: camera.enabled !== undefined ? camera.enabled : 1,
    updated_at: new Date().toISOString()
  };
  
  saveData();
  return Promise.resolve(true);
}

/**
 * Delete camera
 */
function deleteCamera(id) {
  const index = cameras.findIndex(c => c.id === parseInt(id));
  if (index === -1) {
    return Promise.resolve(false);
  }
  
  cameras.splice(index, 1);
  saveData();
  return Promise.resolve(true);
}

module.exports = {
  init,
  getAllCameras,
  getCameraById,
  createCamera,
  updateCamera,
  deleteCamera
};
