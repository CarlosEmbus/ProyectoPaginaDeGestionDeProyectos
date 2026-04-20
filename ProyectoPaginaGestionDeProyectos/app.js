window.app = {
  async init() {
    this.bindNavigation();
    
    // Pre-loading state
    const grid = document.getElementById('projects-grid');
    if(grid) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; font-weight:600; color: var(--primary-color);">Conectando con Google Firebase Nube ☁️...</div>';
    }
    
    // Wait for cloud persistence
    await window.Database.load();
    window.projectsView.renderProjects();
    
    // Auto Select first project if exists
    if(window.internalState.db.projects && window.internalState.db.projects.length > 0) {
      // Terminado
    }
  },

  // ----- Navigation -----
  bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    const views = document.querySelectorAll('.view-section');
    const viewTitle = document.getElementById('view-title');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        
        // Prevent going to project sections if no active project
        if(targetView !== 'projects' && !window.internalState.activeProjectId) {
          alert('Por favor selecciona o crea un proyecto primero.');
          return;
        }
        
        navLinks.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        views.forEach(view => {
          view.classList.add('hidden');
        });
        
        const viewEl = document.getElementById(`view-${targetView}`);
        if(viewEl) {
          viewEl.classList.remove('hidden');
          viewTitle.textContent = e.currentTarget.innerText.trim();
        }
      });
    });
  },

  // ----- Master Render -----
  renderAll() {
    window.wbsView.renderWbs();
    window.risksView.renderRisks();
    window.commsView.renderComms();
    window.dashboardView.updateDashboard();
  }
};

// Boot App
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
