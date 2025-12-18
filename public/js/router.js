/**
 * Simple Client-Side Router
 */
const Router = {
  routes: {},
  currentPage: null,
  
  /**
   * Initialize router
   */
  init() {
    // Handle navigation
    window.addEventListener('popstate', () => {
      this.loadPage(window.location.pathname);
    });
    
    // Intercept navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        this.navigate(link.pathname);
      }
    });
    
    // Load initial page
    this.loadPage(window.location.pathname);
  },
  
  /**
   * Register a route
   */
  register(path, handler) {
    this.routes[path] = handler;
  },
  
  /**
   * Navigate to a page
   */
  navigate(path) {
    window.history.pushState({}, '', path);
    this.loadPage(path);
  },
  
  /**
   * Load page content
   */
  async loadPage(path) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.pathname === path) {
        item.classList.add('active');
      }
    });
    
    // Find matching route
    const handler = this.routes[path] || this.routes['/'];
    
    if (handler) {
      this.currentPage = path;
      await handler();
    }
  },
  
  /**
   * Reload current page
   */
  reload() {
    if (this.currentPage) {
      this.loadPage(this.currentPage);
    }
  }
};
