window.dashboardView = {
  updateDashboard() {
    const proj = window.getProject();
    if(!proj) return;
    
    const totalBudget = window.state.wbs.reduce((sum, task) => sum + parseFloat(task.budget || 0), 0);
    document.getElementById('dashboard-budget').innerText = window.utils.formatCurrency(totalBudget);
    document.getElementById('dashboard-risks').innerText = window.state.risks.length;
    document.getElementById('dashboard-deliverables').innerText = window.state.wbs.length;

    const statusEl = document.getElementById('project-status');
    if(statusEl) statusEl.value = proj.status || 'Planeado';

    const scopeEl = document.getElementById('project-scope');
    if(scopeEl) scopeEl.value = proj.scope || '';
  },

  async updateProjectStatus(val) {
    const proj = window.getProject();
    if(proj) {
      proj.status = val;
      await window.api.projects.update(proj.id, { status: val });
    }
  },

  async saveScope() {
    const proj = window.getProject();
    if(proj) {
      const scopeVal = document.getElementById('project-scope').value;
      proj.scope = scopeVal;
      await window.api.projects.update(proj.id, { scope: scopeVal });
      alert('Alcance guardado correctamente en la Nube.');
    }
  }
};
