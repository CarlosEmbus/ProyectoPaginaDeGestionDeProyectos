window.risksView = {
  renderRisks() {
    if(!window.getProject()) return;
    const tbody = document.getElementById('risks-table-body');
    if(!tbody) return;

    tbody.innerHTML = window.state.risks.map(r => `
      <tr>
        <td><strong>${r.desc}</strong></td>
        <td><span class="${window.utils.getBadgeClass(r.prob)}">${r.prob}</span></td>
        <td><span class="${window.utils.getBadgeClass(r.impact)}">${r.impact}</span></td>
        <td>${r.mitigation}</td>
        <td><span class="badge" style="background:var(--bg-tertiary); border:1px solid var(--border-color);">${r.status}</span></td>
        <td style="text-align: right;">
          <button class="btn-icon" onclick="window.risksView.deleteRisk(${r.id})" title="Eliminar">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');
    window.utils.refreshIcons();
    window.dashboardView.updateDashboard();
  },

  saveRisk(e) {
    e.preventDefault();
    const desc = document.getElementById('risk-desc').value;
    const prob = document.getElementById('risk-prob').value;
    const impact = document.getElementById('risk-impact').value;
    const mitigation = document.getElementById('risk-mitigation').value;
    
    window.state.risks.push({
      id: Date.now(), desc, prob, impact, mitigation, status: 'Activo'
    });
    
    this.renderRisks();
    window.utils.closeModals();
  },

  deleteRisk(id) {
    if(confirm('¿Eliminar este riesgo?')) {
      window.state.risks = window.state.risks.filter(r => r.id !== id);
      this.renderRisks();
    }
  },

  openRiskModal() {
    if(!window.getProject()) return;
    document.getElementById('form-risk').reset();
    document.getElementById('modal-risk').classList.add('active');
  }
};
