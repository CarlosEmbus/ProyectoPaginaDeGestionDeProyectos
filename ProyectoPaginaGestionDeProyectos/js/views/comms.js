window.commsView = {
  renderComms() {
    if(!window.getProject()) return;
    const tbody = document.getElementById('comms-table-body');
    if(!tbody) return;

    tbody.innerHTML = window.state.comms.map(c => `
      <tr>
        <td style="font-weight: 500;">${c.stakeholder}</td>
        <td>${c.info}</td>
        <td>${c.method}</td>
        <td><span class="badge" style="background:var(--primary-light); color:var(--primary-color);">${c.frequency}</span></td>
        <td style="text-align: right;">
          <button class="btn-icon" onclick="window.commsView.deleteComms(${c.id})" title="Eliminar">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');
    window.utils.refreshIcons();
    window.dashboardView.updateDashboard();
  },

  saveComms(e) {
    e.preventDefault();
    const stakeholder = document.getElementById('comm-stakeholder').value;
    const info = document.getElementById('comm-info').value;
    const method = document.getElementById('comm-method').value;
    const frequency = document.getElementById('comm-frequency').value;
    
    window.state.comms.push({
      id: Date.now(), stakeholder, info, method, frequency
    });
    
    this.renderComms();
    window.utils.closeModals();
  },

  deleteComms(id) {
    if(confirm('¿Eliminar este plan de comunicación?')) {
      window.state.comms = window.state.comms.filter(c => c.id !== id);
      this.renderComms();
    }
  },

  openCommsModal() {
    if(!window.getProject()) return;
    document.getElementById('form-comms').reset();
    document.getElementById('modal-comms').classList.add('active');
  }
};
