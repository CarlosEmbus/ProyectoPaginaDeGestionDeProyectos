window.projectsView = {
  createNewProject() {
    const defaultName = prompt("Ingresa el nombre del nuevo proyecto:");
    if(!defaultName) return;
    
    const newProject = {
      id: 'proj_' + Date.now(),
      name: defaultName,
      status: 'Planeado',
      scope: '',
      wbs: [
        { id: 'root', name: defaultName, budget: 0, owner: '', parentId: null }
      ],
      risks: [],
      comms: []
    };
    
    window.internalState.db.projects.push(newProject);
    window.saveDb();
    this.renderProjects();
    this.openProject(newProject.id);
  },
  
  openProject(id) {
    window.internalState.activeProjectId = id;
    const project = window.getProject();
    
    // Update Sidebar
    document.getElementById('project-nav').style.display = 'flex';
    document.getElementById('active-project-label').innerText = project.name;
    
    // Route to Dashboard
    document.querySelector('.nav-link[data-view="dashboard"]').click();
    window.app.renderAll();
  },
  
  closeProject() {
    window.internalState.activeProjectId = null;
    document.getElementById('project-nav').style.display = 'none';
    document.querySelector('.nav-link[data-view="projects"]').click();
    this.renderProjects();
  },

  deleteProject(id, event) {
    event.stopPropagation();
    if(confirm('¿Eliminar por completo este proyecto y todos sus datos?')) {
      window.internalState.db.projects = window.internalState.db.projects.filter(p => p.id !== id);
      if(window.internalState.activeProjectId === id) {
        this.closeProject();
      } else {
        window.saveDb();
        this.renderProjects();
      }
    }
  },

  renderProjects() {
    const grid = document.getElementById('projects-grid');
    if(!grid) return;
    
    if(window.internalState.db.projects.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-tertiary); padding: 3rem;">No tienes ningún proyecto. ¡Crea el primero!</div>`;
      return;
    }
    
    grid.innerHTML = window.internalState.db.projects.map(p => {
      const budget = p.wbs.reduce((sum, task) => sum + parseFloat(task.budget || 0), 0);
      
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
          <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
             <span><i data-lucide="network" style="width:14px;height:14px;vertical-align:middle;"></i> Tareas: ${p.wbs.length}</span>
             <span><i data-lucide="dollar-sign" style="width:14px;height:14px;vertical-align:middle;"></i> ${window.utils.formatCurrency(budget)}</span>
          </div>
        </div>
      `;
    }).join('');
    window.utils.refreshIcons();
  }
};
