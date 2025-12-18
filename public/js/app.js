/**
 * Application Pages
 */
const Pages = {
  /**
   * Dashboard Page
   */
  async dashboard() {
    const container = document.getElementById('app-container');
    
    try {
      const response = await API.cameras.getAll();
      const cameras = response.data || [];
      
      const enabledCount = cameras.filter(c => c.enabled).length;
      const disabledCount = cameras.length - enabledCount;
      
      container.innerHTML = `
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Overview of your IP camera network</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${cameras.length}</div>
            <div class="stat-label">Total Cameras</div>
          </div>
          
          <div class="stat-card success">
            <div class="stat-value">${enabledCount}</div>
            <div class="stat-label">Active Cameras</div>
          </div>
          
          <div class="stat-card warning">
            <div class="stat-value">${disabledCount}</div>
            <div class="stat-label">Disabled Cameras</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Quick Actions</h2>
          </div>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/cameras" class="btn btn-primary">
                Manage Cameras
            </a>
            <a href="/live" class="btn btn-success">
                View Live Streams
            </a>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Recent Cameras</h2>
          </div>
          ${cameras.length > 0 ? `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${cameras.slice(0, 5).map(camera => `
                    <tr>
                      <td><strong>${camera.name}</strong></td>
                      <td>${camera.location || '-'}</td>
                      <td>${camera.ip_address}:${camera.port}</td>
                      <td>${UI.getStatusBadge(camera.enabled)}</td>
                      <td>
                        <a href="/live?camera=${camera.id}" class="btn btn-sm btn-primary">View</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">📷</div>
              <h3 class="empty-state-title">No Cameras Yet</h3>
              <p class="empty-state-text">Add your first camera to get started</p>
              <a href="/cameras" class="btn btn-primary">Add Camera</a>
            </div>
          `}
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="card">
          <div class="empty-state">
            <div class="empty-state-icon">❌</div>
            <h3 class="empty-state-title">Error Loading Dashboard</h3>
            <p class="empty-state-text">${error.message}</p>
          </div>
        </div>
      `;
    }
  },
  
  /**
   * Cameras Management Page
   */
  async cameras() {
    const container = document.getElementById('app-container');
    
    try {
      const response = await API.cameras.getAll();
      const cameras = response.data || [];
      
      container.innerHTML = `
        <div class="page-header">
          <h1>Camera Management</h1>
          <p>Add, edit, or remove cameras from your network</p>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Cameras (${cameras.length})</h2>
            <button class="btn btn-primary" id="add-camera-btn">
              ➕ Add Camera
            </button>
          </div>
          
          ${cameras.length > 0 ? `
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>IP Address</th>
                    <th>Stream Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${cameras.map(camera => `
                    <tr>
                      <td><strong>${camera.name}</strong></td>
                      <td>${camera.location || '-'}</td>
                      <td>${camera.ip_address}:${camera.port}</td>
                      <td>${UI.getStreamTypeBadge(camera.stream_type)}</td>
                      <td>${UI.getStatusBadge(camera.enabled)}</td>
                      <td>
                        <div class="table-actions">
                          <button class="btn btn-sm btn-primary" 
                                  onclick="Pages.editCamera(${camera.id})">
                            Edit
                          </button>
                          <button class="btn btn-sm btn-danger" 
                                  onclick="Pages.deleteCamera(${camera.id}, '${camera.name.replace(/'/g, "\\'")}')">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state-icon">📷</div>
              <h3 class="empty-state-title">No Cameras Configured</h3>
              <p class="empty-state-text">Click the button above to add your first camera</p>
            </div>
          `}
        </div>
      `;
      
      // Add camera button handler
      document.getElementById('add-camera-btn').addEventListener('click', () => {
        Pages.addCamera();
      });
      
    } catch (error) {
      UI.showToast(`Failed to load cameras: ${error.message}`, 'error');
    }
  },
  
  /**
   * Add camera
   */
  addCamera() {
    UI.showCameraForm(null, async (cameraData) => {
      try {
        await API.cameras.create(cameraData);
        UI.showToast('Camera added successfully', 'success');
        Router.reload();
      } catch (error) {
        UI.showToast(`Failed to add camera: ${error.message}`, 'error');
      }
    });
  },
  
  /**
   * Edit camera
   */
  async editCamera(id) {
    try {
      const response = await API.cameras.getById(id);
      const camera = response.data;
      
      UI.showCameraForm(camera, async (cameraData) => {
        try {
          await API.cameras.update(id, cameraData);
          UI.showToast('Camera updated successfully', 'success');
          Router.reload();
        } catch (error) {
          UI.showToast(`Failed to update camera: ${error.message}`, 'error');
        }
      });
    } catch (error) {
      UI.showToast(`Failed to load camera: ${error.message}`, 'error');
    }
  },
  
  /**
   * Delete camera
   */
  deleteCamera(id, name) {
    UI.showConfirm(
      'Delete Camera',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      async () => {
        try {
          await API.cameras.delete(id);
          UI.showToast('Camera deleted successfully', 'success');
          Router.reload();
        } catch (error) {
          UI.showToast(`Failed to delete camera: ${error.message}`, 'error');
        }
      }
    );
  },
  
  /**
   * Live View Page
   */
  async live() {
    const container = document.getElementById('app-container');
    const urlParams = new URLSearchParams(window.location.search);
    const cameraId = urlParams.get('camera');
    
    try {
      const response = await API.cameras.getAll();
      const cameras = response.data.filter(c => c.enabled);
      
      if (cameras.length === 0) {
        container.innerHTML = `
          <div class="page-header">
            <h1>Live View</h1>
            <p>View live streams from your cameras</p>
          </div>
          <div class="card">
            <div class="empty-state">
              <div class="empty-state-icon">📷</div>
              <h3 class="empty-state-title">No Active Cameras</h3>
              <p class="empty-state-text">Enable cameras in the Camera Management page to view streams</p>
              <a href="/cameras" class="btn btn-primary">Go to Cameras</a>
            </div>
          </div>
        `;
        return;
      }
      
      // Single camera view
      if (cameraId) {
        const camera = cameras.find(c => c.id == cameraId);
        if (!camera) {
          UI.showToast('Camera not found', 'error');
          Router.navigate('/live');
          return;
        }
        
        container.innerHTML = `
          <div class="page-header">
            <h1>${camera.name}</h1>
            <p>${camera.location || 'Live Stream'}</p>
          </div>
          
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">${camera.name}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                  ${camera.ip_address}:${camera.port} • ${UI.getStreamTypeBadge(camera.stream_type)}
                </div>
              </div>
              <a href="/live" class="btn btn-secondary">← Back to Grid</a>
            </div>
            <div class="video-container" style="padding-top: 56.25%;">
              ${Pages.renderStream(camera)}
            </div>
            <div class="video-footer">
              <span>📍 ${camera.location || 'Unknown Location'}</span>
              <span>Type: ${camera.stream_type.toUpperCase()}</span>
            </div>
          </div>
        `;
      } 
      // Multi-camera grid view
      else {
        container.innerHTML = `
          <div class="page-header">
            <h1>Live View</h1>
            <p>View all active camera streams</p>
          </div>
          
          <div class="video-grid">
            ${cameras.map(camera => `
              <div class="video-card">
                <div class="video-header">
                  <div>
                    <div class="video-title">${camera.name}</div>
                    <div class="video-location">${camera.location || 'Unknown Location'}</div>
                  </div>
                  <a href="http://localhost:1984/stream.html?src=camera=${camera.id}&mode=webrtc" class="btn btn-sm btn-secondary">
                    Fullscreen
                  </a>
                </div>
                <div class="video-container">
                  ${Pages.renderStream(camera)}
                </div>
                <div class="video-footer">
                  <span>${camera.ip_address}:${camera.port}</span>
                  <span>${camera.stream_type.toUpperCase()}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }
    } catch (error) {
      UI.showToast(`Failed to load cameras: ${error.message}`, 'error');
    }
  },
  
  /**
   * Render stream based on type
   */
  renderStream(camera) {
    if (camera.stream_type === 'mjpeg') {
      // Use proxy for MJPEG streams
      return `
        <img src="${API.stream.getProxyUrl(camera.id)}" 
             class="video-stream"
             alt="${camera.name} stream"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div class="video-placeholder" style="display: none;">
          <div>❌</div>
          <div>Stream Unavailable</div>
          <div style="font-size: 0.85rem; margin-top: 0.5rem;">Check camera connection</div>
        </div>
      `;
    } else if (camera.stream_type === 'rtsp') {
      // RTSP streams via go2rtc - use iframe embed for simplicity
      return `
        <iframe 
          id="stream-${camera.id}"
          src="http://localhost:1984/stream.html?src=camera_${camera.id}&mode=webrtc"
          style="width: 100%; height: 100%; border: none;"
          allow="camera;microphone;autoplay">
        </iframe>
      `;
    } else if (camera.stream_type === 'hls') {
      // HLS stream (would need hls.js library for full support)
      return `
        <video class="video-stream" controls autoplay muted>
          <source src="${camera.stream_url}" type="application/x-mpegURL">
        </video>
      `;
    } else {
      return `
        <div class="video-placeholder">
          <div>⚠️</div>
          <div>Unsupported Stream Type</div>
          <div style="font-size: 0.85rem; margin-top: 0.5rem;">${camera.stream_type}</div>
        </div>
      `;
    }
  },
  
  /**
   * Settings Page
   */
  async settings() {
    const container = document.getElementById('app-container');
    
    container.innerHTML = `
      <div class="page-header">
        <h1>Settings</h1>
        <p>Configure application settings</p>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Server Information</h2>
        </div>
        <div>
          <p><strong>Server URL:</strong> ${window.location.origin}</p>
          <p><strong>API Endpoint:</strong> ${window.location.origin}/api</p>
          <p style="margin-top: 1rem; padding: 1rem; background-color: var(--light-bg); border-radius: 4px;">
            <strong>ℹ️ Local Network Only</strong><br>
            This application is designed to run only on your local network. 
            Access it from other devices using your machine's local IP address.
          </p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">⚠️ RTSP Stream Notice</h2>
        </div>
        <div>
          <p style="margin-bottom: 1rem;">
            <strong>Important:</strong> RTSP streams cannot be displayed directly in web browsers due to security restrictions.
          </p>
          
          <div style="background: rgba(231, 76, 60, 0.1); padding: 1rem; border-radius: 4px; border-left: 3px solid var(--danger-color); margin-bottom: 1rem;">
            <strong>What You're Seeing:</strong><br>
            If your camera stream works in VLC but not in the web interface, your camera is using RTSP protocol.
          </div>
          
          <div style="background: rgba(52, 152, 219, 0.1); padding: 1rem; border-radius: 4px; border-left: 3px solid var(--accent-color); margin-bottom: 1rem;">
            <strong>Quick Solutions:</strong>
            <ol style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li><strong>Check for MJPEG Stream:</strong> Most cameras support both RTSP and HTTP/MJPEG. Look in your camera's web interface for an HTTP stream URL (e.g., http://camera-ip/video)</li>
              <li><strong>Use VLC for Viewing:</strong> Open VLC → Media → Open Network Stream → Paste your RTSP URL</li>
              <li><strong>Convert with FFmpeg:</strong> Use FFmpeg to convert RTSP to MJPEG for web viewing</li>
            </ol>
          </div>
          
          <div style="margin-top: 1rem;">
            <strong>Common MJPEG URLs to Try:</strong>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem; font-family: monospace; font-size: 0.9rem;">
              <li>http://camera-ip:80/video</li>
              <li>http://camera-ip:8080/video</li>
              <li>http://camera-ip/mjpeg</li>
              <li>http://camera-ip/videostream.cgi</li>
              <li>http://username:password@camera-ip/video</li>
            </ul>
          </div>
          
          <div style="margin-top: 1rem; padding: 1rem; background: var(--light-bg); border-radius: 4px;">
            <strong>📖 Detailed Guide:</strong><br>
            See <code>RTSP-GUIDE.md</code> in the project folder for complete instructions on:
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
              <li>Finding your camera's MJPEG stream URL</li>
              <li>Using FFmpeg to convert RTSP to web-compatible formats</li>
              <li>Setting up MediaMTX or go2rtc for RTSP to WebRTC conversion</li>
              <li>Brand-specific camera stream URLs (Hikvision, Dahua, Reolink, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">About</h2>
        </div>
        <div>
          <p><strong>Application:</strong> IP Camera Viewer</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Purpose:</strong> Local network IP camera management and viewing</p>
          <p><strong>Supported Formats:</strong> MJPEG, HLS (RTSP requires conversion)</p>
        </div>
      </div>
    `;
  }
};

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
  // Register routes
  Router.register('/', Pages.dashboard);
  Router.register('/cameras', Pages.cameras);
  Router.register('/live', Pages.live);
  Router.register('/settings', Pages.settings);
  
  // Initialize router
  Router.init();
});
