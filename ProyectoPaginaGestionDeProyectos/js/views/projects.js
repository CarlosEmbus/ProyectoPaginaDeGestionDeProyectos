window.projectsView = {
  async createNewProject() {
    const defaultName = prompt("Ingresa el nombre del nuevo proyecto:");
    if(!defaultName) return;
    
    const newProject = {
      id: 'proj_' + Date.now(),
      name: defaultName,
      status: 'Planeado',
      scope: ''
    };
    
    await window.api.projects.create(newProject);
    await window.api.wbs.save(newProject.id, { id: 'root', name: defaultName, budget: 0, owner: '', parentId: null });
    
    window.internalState.projects.push(newProject);
    this.renderProjects();
    this.openProject(newProject.id);
  },
  
  async openProject(id) {
    window.internalState.activeProjectId = id;
    const project = window.getProject();
    
    // Mostrar loader interno
    document.getElementById('view-title').innerText = "Cargando...";
    
    // Consumir Microservicios / APIs
    window.state.wbs = await window.api.wbs.getAll(id);
    window.state.risks = await window.api.risks.getAll(id);
    window.state.comms = await window.api.comms.getAll(id);
    
    // Update Sidebar
    document.getElementById('project-nav').style.display = 'flex';
    document.getElementById('active-project-label').innerText = project.name;
    document.getElementById('view-title').innerText = "Dashboard";
    
    // Route to Dashboard
    document.querySelector('.nav-link[data-view="dashboard"]').click();
    window.app.renderAll();
  },
  
  closeProject() {
    window.internalState.activeProjectId = null;
    window.state.wbs = [];
    window.state.risks = [];
    window.state.comms = [];
    
    document.getElementById('project-nav').style.display = 'none';
    document.querySelector('.nav-link[data-view="projects"]').click();
    this.renderProjects();
  },

  async deleteProject(id, event) {
    event.stopPropagation();
    if(confirm('¿Eliminar por completo este proyecto y todos sus datos en la Nube?')) {
      await window.api.projects.delete(id);
      window.internalState.projects = window.internalState.projects.filter(p => p.id !== id);
      
      if(window.internalState.activeProjectId === id) {
        this.closeProject();
      } else {
        this.renderProjects();
      }
    }
  },

  renderProjects() {
    const grid = document.getElementById('projects-grid');
    if(!grid) return;
    
    if(window.internalState.projects.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-tertiary); padding: 3rem;">No tienes ningún proyecto. ¡Crea el primero!</div>`;
      return;
    }
    
    grid.innerHTML = window.internalState.projects.map(p => {
      let statusColor = 'var(--text-secondary)';
      if(p.status === 'Ejecución') statusColor = 'var(--primary-color)';
      if(p.status === 'Estabilización') statusColor = 'var(--warning-color)';
      if(p.status === 'Terminado') statusColor = 'var(--success-color)';

      return `
        <div class="card stat-card" style="cursor: pointer; position: relative;" onclick="window.projectsView.openProject('${p.id}')">
          <div style="position: absolute; top: 1rem; right: 1rem;">
             <button class="btn-icon btn-sm btn-danger-text" onclick="window.projectsView.deleteProject('${p.id}', event)"><i data-lucide="trash-2"></i></button>
          </div>
          <span class="stat-title">Proyecto</span>
          <span class="stat-value" style="font-size: 1.25rem;">${p.name}</span>
          <span style="display:inline-block; margin-top: 0.25rem; font-size:0.75rem; font-weight:600; color: ${statusColor}; text-transform: uppercase;">• ${p.status || 'Planeado'}</span>
        </div>
      `;
    }).join('');
    window.utils.refreshIcons();
  }
};
