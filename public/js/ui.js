/**
 * UI Utility Functions
 */
const UI = {
  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },
  
  /**
   * Show confirmation modal
   */
  showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-danger" data-action="confirm">Confirm</button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(overlay);
    
    // Handle clicks
    overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });
    
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      overlay.remove();
    });
    
    overlay.querySelector('.modal-close').addEventListener('click', () => {
      overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  },
  
  /**
   * Show camera form modal
   */
  showCameraForm(camera = null, onSave) {
    const isEdit = !!camera;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${isEdit ? 'Edit Camera' : 'Add New Camera'}</h2>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <form id="camera-form">
            <div class="form-group">
              <label class="form-label required">Camera Name</label>
              <input type="text" class="form-input" name="name" 
                     value="${camera?.name || ''}" 
                     placeholder="e.g., Front Door Camera" required>
              <span class="form-error" data-field="name"></span>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">IP Address</label>
                <input type="text" class="form-input" name="ip_address" 
                       value="${camera?.ip_address || ''}" 
                       placeholder="192.168.1.100" required>
                <span class="form-error" data-field="ip_address"></span>
              </div>
              
              <div class="form-group">
                <label class="form-label">Port</label>
                <input type="number" class="form-input" name="port" 
                       value="${camera?.port || 554}" 
                       placeholder="554" min="1" max="65535">
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label required">Stream URL</label>
              <input type="text" class="form-input" name="stream_url" 
                     value="${camera?.stream_url || ''}" 
                     placeholder="rtsp://192.168.1.100:554/stream1" required>
              <span class="form-help">Full stream URL (RTSP, HTTP, or MJPEG)</span>
              <span class="form-error" data-field="stream_url"></span>
            </div>
            
            <div class="form-group">
              <label class="form-label">Stream Type</label>
              <select class="form-select" name="stream_type">
                <option value="mjpeg" ${camera?.stream_type === 'mjpeg' ? 'selected' : ''}>MJPEG (HTTP)</option>
                <option value="rtsp" ${camera?.stream_type === 'rtsp' ? 'selected' : ''}>RTSP</option>
                <option value="hls" ${camera?.stream_type === 'hls' ? 'selected' : ''}>HLS</option>
              </select>
              <span class="form-help">MJPEG works best for direct browser viewing</span>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" name="username" 
                       value="${camera?.username || ''}" 
                       placeholder="Optional">
              </div>
              
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" name="password" 
                       value="${camera?.password || ''}" 
                       placeholder="Optional">
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" class="form-input" name="location" 
                     value="${camera?.location || ''}" 
                     placeholder="e.g., Front Door, Backyard">
            </div>
            
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-textarea" name="notes" 
                        placeholder="Additional notes about this camera">${camera?.notes || ''}</textarea>
            </div>
            
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" name="enabled" ${camera?.enabled !== 0 ? 'checked' : ''}>
                <span>Camera Enabled</span>
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-primary" data-action="save">
            ${isEdit ? 'Save Changes' : 'Add Camera'}
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(overlay);
    
    const form = overlay.querySelector('#camera-form');
    
    // Clear errors
    const clearErrors = () => {
      form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
      form.querySelectorAll('.form-input, .form-select').forEach(el => {
        el.classList.remove('error');
      });
    };
    
    // Show errors
    const showErrors = (errors) => {
      clearErrors();
      if (Array.isArray(errors)) {
        errors.forEach(err => {
          UI.showToast(err, 'error');
        });
      }
    };
    
    // Handle save
    overlay.querySelector('[data-action="save"]').addEventListener('click', async () => {
      clearErrors();
      
      const formData = new FormData(form);
      const cameraData = {
        name: formData.get('name'),
        ip_address: formData.get('ip_address'),
        port: parseInt(formData.get('port')) || 554,
        stream_url: formData.get('stream_url'),
        stream_type: formData.get('stream_type'),
        username: formData.get('username') || null,
        password: formData.get('password') || null,
        location: formData.get('location') || null,
        notes: formData.get('notes') || null,
        enabled: formData.get('enabled') ? 1 : 0
      };
      
      try {
        overlay.remove();
        await onSave(cameraData);
      } catch (error) {
        showErrors([error.message]);
      }
    });
    
    // Handle cancel
    overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      overlay.remove();
    });
    
    overlay.querySelector('.modal-close').addEventListener('click', () => {
      overlay.remove();
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  },
  
  /**
   * Format date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  },
  
  /**
   * Format stream type badge
   */
  getStreamTypeBadge(type) {
    const badges = {
      mjpeg: '<span class="badge badge-success">MJPEG</span>',
      rtsp: '<span class="badge badge-secondary">RTSP</span>',
      hls: '<span class="badge badge-secondary">HLS</span>'
    };
    return badges[type] || '<span class="badge badge-secondary">Unknown</span>';
  },
  
  /**
   * Get status badge
   */
  getStatusBadge(enabled) {
    return enabled 
      ? '<span class="badge badge-success">Enabled</span>'
      : '<span class="badge badge-danger">Disabled</span>';
  }
};
