const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');
const { URL } = require('url');
const db = require('../database');

// go2rtc API configuration
const GO2RTC_API = 'http://localhost:1984';
const GO2RTC_ENABLED = process.env.GO2RTC_ENABLED !== 'false';

/**
 * Check if go2rtc is running
 */
async function checkGo2rtc() {
  if (!GO2RTC_ENABLED) return false;
  
  try {
    const response = await fetch(`${GO2RTC_API}/api/streams`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Add stream to go2rtc
 */
async function addStreamToGo2rtc(camera) {
  if (!GO2RTC_ENABLED) return false;
  
  try {
    const streamName = `camera_${camera.id}`;
    
    // Use PATCH method to add/update stream (go2rtc API requirement)
    const response = await fetch(`${GO2RTC_API}/api/streams`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [streamName]: camera.stream_url
      })
    });
    
    console.log(`Registered stream ${streamName} with go2rtc:`, camera.stream_url);
    return response.ok;
  } catch (error) {
    console.error('Failed to add stream to go2rtc:', error.message);
    return false;
  }
}

/**
 * Remove stream from go2rtc
 */
async function removeStreamFromGo2rtc(cameraId) {
  if (!GO2RTC_ENABLED) return false;
  
  try {
    const streamName = `camera_${cameraId}`;
    await fetch(`${GO2RTC_API}/api/streams?src=${streamName}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Failed to remove stream from go2rtc:', error.message);
    return false;
  }
}

/**
 * GET /api/stream/proxy/:id - Proxy MJPEG stream from camera
 * This endpoint acts as a proxy for MJPEG streams to avoid CORS issues
 * and provide authentication if needed
 */
router.get('/proxy/:id', async (req, res) => {
  try {
    const camera = await db.getCameraById(req.params.id);
    
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    
    if (!camera.enabled) {
      return res.status(403).json({ success: false, error: 'Camera is disabled' });
    }
    
    // Parse the stream URL
    const streamUrl = camera.stream_url;
    const parsedUrl = new URL(streamUrl);
    
    // Prepare request options
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {}
    };
    
    // Add basic auth if credentials provided
    if (camera.username && camera.password) {
      const auth = Buffer.from(`${camera.username}:${camera.password}`).toString('base64');
      options.headers['Authorization'] = `Basic ${auth}`;
    }
    
    // Select http or https module
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    // Make request to camera
    const proxyReq = protocol.request(options, (proxyRes) => {
      // Set response headers
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'multipart/x-mixed-replace',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // Pipe camera stream to response
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (error) => {
      console.error(`Proxy error for camera ${camera.name}:`, error.message);
      if (!res.headersSent) {
        res.status(502).json({ 
          success: false, 
          error: 'Failed to connect to camera stream' 
        });
      }
    });
    
    // Handle client disconnect
    req.on('close', () => {
      proxyReq.destroy();
    });
    
    proxyReq.end();
    
  } catch (error) {
    console.error('Stream proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Stream proxy failed' });
    }
  }
});

/**
 * GET /api/stream/info/:id - Get stream information
 */
router.get('/info/:id', async (req, res) => {
  try {
    const camera = await db.getCameraById(req.params.id);
    
    if (!camera) {
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    
    const go2rtcRunning = await checkGo2rtc();
    
    res.json({
      success: true,
      data: {
        id: camera.id,
        name: camera.name,
        stream_type: camera.stream_type,
        stream_url: camera.stream_url,
        enabled: camera.enabled,
        has_auth: !!(camera.username && camera.password),
        go2rtc_available: go2rtcRunning,
        webrtc_url: go2rtcRunning ? `${GO2RTC_API}/api/ws?src=camera_${camera.id}` : null,
        hls_url: go2rtcRunning ? `${GO2RTC_API}/api/stream.m3u8?src=camera_${camera.id}` : null
      }
    });
  } catch (error) {
    console.error('Error fetching stream info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stream info' });
  }
});

/**
 * POST /api/stream/register/:id - Register camera stream with go2rtc
 */
router.post('/register/:id', async (req, res) => {
  try {
    console.log(`\n=== Stream Registration Request for camera ${req.params.id} ===`);
    const camera = await db.getCameraById(req.params.id);
    
    if (!camera) {
      console.log('❌ Camera not found');
      return res.status(404).json({ success: false, error: 'Camera not found' });
    }
    
    console.log(`Camera: ${camera.name}`);
    console.log(`Stream URL: ${camera.stream_url}`);
    
    const go2rtcRunning = await checkGo2rtc();
    console.log(`go2rtc running: ${go2rtcRunning}`);
    
    if (!go2rtcRunning) {
      console.log('❌ go2rtc is not running');
      return res.status(503).json({ 
        success: false, 
        error: 'go2rtc is not running. Please start go2rtc first.' 
      });
    }
    
    console.log('Calling addStreamToGo2rtc...');
    const success = await addStreamToGo2rtc(camera);
    console.log(`Registration result: ${success}`);
    
    if (success) {
      console.log('✅ Stream registered successfully\n');
      res.json({ 
        success: true, 
        message: 'Stream registered with go2rtc',
        webrtc_url: `${GO2RTC_API}/api/ws?src=camera_${camera.id}`
      });
    } else {
      console.log('❌ Failed to register stream\n');
      res.status(500).json({ 
        success: false, 
        error: 'Failed to register stream with go2rtc' 
      });
    }
  } catch (error) {
    console.error('❌ Error registering stream:', error);
    res.status(500).json({ success: false, error: 'Failed to register stream' });
  }
});

/**
 * DELETE /api/stream/unregister/:id - Unregister camera stream from go2rtc
 */
router.delete('/unregister/:id', async (req, res) => {
  try {
    await removeStreamFromGo2rtc(req.params.id);
    res.json({ success: true, message: 'Stream unregistered from go2rtc' });
  } catch (error) {
    console.error('Error unregistering stream:', error);
    res.status(500).json({ success: false, error: 'Failed to unregister stream' });
  }
});

/**
 * GET /api/stream/go2rtc/status - Check go2rtc status
 */
router.get('/go2rtc/status', async (req, res) => {
  const running = await checkGo2rtc();
  res.json({
    success: true,
    data: {
      running,
      api_url: running ? GO2RTC_API : null,
      web_ui: running ? `${GO2RTC_API}/` : null
    }
  });
});

module.exports = router;
