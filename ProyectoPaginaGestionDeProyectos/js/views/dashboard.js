window.dashboardView = {
  updateDashboard() {
    if(!window.getProject()) return;
    
    window.saveDb(); // Auto-save trigger
    
    const totalBudget = window.state.wbs.reduce((sum, task) => sum + parseFloat(task.budget || 0), 0);
    document.getElementById('dashboard-budget').innerText = window.utils.formatCurrency(totalBudget);
    document.getElementById('dashboard-risks').innerText = window.state.risks.length;
    document.getElementById('dashboard-deliverables').innerText = window.state.wbs.length;
  }
};
