window.app = {
  init() {
    this.bindNavigation();
    window.projectsView.renderProjects();
    
    // Auto Select first project if exists
    if(window.internalState.db.projects.length > 0) {
      // Nothing, just let user pick
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
