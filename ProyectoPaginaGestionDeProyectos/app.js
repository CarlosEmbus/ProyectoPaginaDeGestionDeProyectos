window.app = {
  async init() {
    this.bindNavigation();
    
    // Register Auth Observer
    window.api.auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Logged in
        const profile = await window.api.auth.getCurrentUserProfile(user.uid);
        if(!profile || !profile.active) {
          alert("Tu cuenta ha sido suspendida o no existe el perfil.");
          await window.api.auth.logout();
          return;
        }
        
        window.internalState.userProfile = profile;
        document.getElementById('user-email-label').innerText = profile.email;
        
        if (profile.role === 'admin') {
          document.getElementById('nav-admin-btn').classList.remove('hidden');
          const pBtn = document.getElementById('nav-portfolio-btn');
          if(pBtn) pBtn.classList.remove('hidden');
        } else {
          document.getElementById('nav-admin-btn').classList.add('hidden');
          const pBtn = document.getElementById('nav-portfolio-btn');
          if(pBtn) pBtn.classList.add('hidden');
        }
        
        // Enforce UI
        const grid = document.getElementById('projects-grid');
        if(grid) {
          grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">Cargando tus proyectos...</div>';
        }
        
        // Wait for cloud persistence
        await window.Database.load();
        
        // Route safely to projects view
        const targetViewEl = document.querySelector('.nav-link[data-view="projects"]');
        if(targetViewEl) targetViewEl.click();
        
        window.projectsView.renderProjects();
        
      } else {
        // Logged out
        window.internalState.userProfile = null;
        window.internalState.projects = [];
        window.internalState.activeProjectId = null;
        
        document.getElementById('user-email-label').innerText = "No logueado";
        document.getElementById('nav-admin-btn').classList.add('hidden');
        document.getElementById('project-nav').style.display = 'none';
        
        // Force view to Auth
        document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
        document.getElementById('view-auth').classList.remove('hidden');
        document.getElementById('view-title').innerText = "Autenticación";
        
        // Clear active styles
        document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
      }
    });
  },

  // ----- Navigation -----
  bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    const views = document.querySelectorAll('.view-section');
    const viewTitle = document.getElementById('view-title');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        
        // Evitar navegación si no está logueado
        if (!window.internalState.userProfile && targetView !== 'auth') {
          return;
        }
        
        // Prevent going to project sections if no active project
        if(['dashboard', 'wbs', 'risks', 'communications'].includes(targetView) && !window.internalState.activeProjectId) {
          alert('Por favor selecciona o crea un proyecto primero.');
          return;
        }
        
        if (targetView === 'admin') {
           window.adminView.renderAdminPanel();
        }
        if (targetView === 'portfolio') {
           window.portfolioView.renderPortfolio();
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
