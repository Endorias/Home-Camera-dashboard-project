/**
 * API Client - Handles all HTTP requests to the backend
 */
const API = {
  BASE_URL: '/api',
  
  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Camera API endpoints
   */
  cameras: {
    // Get all cameras
    getAll: async () => {
      return await API.request('/cameras');
    },
    
    // Get camera by ID
    getById: async (id) => {
      return await API.request(`/cameras/${id}`);
    },
    
    // Create new camera
    create: async (cameraData) => {
      return await API.request('/cameras', {
        method: 'POST',
        body: JSON.stringify(cameraData)
      });
    },
    
    // Update camera
    update: async (id, cameraData) => {
      return await API.request(`/cameras/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cameraData)
      });
    },
    
    // Delete camera
    delete: async (id) => {
      return await API.request(`/cameras/${id}`, {
        method: 'DELETE'
      });
    }
  },
  
  /**
   * Stream API endpoints
   */
  stream: {
    // Get stream info
    getInfo: async (id) => {
      return await API.request(`/stream/info/${id}`);
    },
    
    // Get proxy URL for camera stream
    getProxyUrl: (id) => {
      return `${API.BASE_URL}/stream/proxy/${id}`;
    }
  }
};
