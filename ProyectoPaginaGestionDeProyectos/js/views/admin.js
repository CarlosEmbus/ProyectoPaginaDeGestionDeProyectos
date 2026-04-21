window.adminView = {
  async renderAdminPanel() {
    // Protección de Ruta: Validar rol
    if (!window.internalState.userProfile || window.internalState.userProfile.role !== 'admin') {
      alert("Acceso Denegado. Solo administradores pueden ver esta ruta.");
      document.querySelector('.nav-link[data-view="projects"]').click();
      return;
    }

    const tbody = document.getElementById('admin-users-body');
    if(!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando usuarios...</td></tr>';
    
    const users = await window.api.users.getAll();
    
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.name || 'Sin Nombre'}</td>
        <td>${u.email}</td>
        <td>
          <select class="form-control" style="width: auto; padding: 0.2rem;" onchange="window.adminView.changeRole('${u.uid}', this.value)" ${u.uid === window.internalState.userProfile.uid ? 'disabled' : ''}>
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>Usuario</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrador</option>
          </select>
        </td>
        <td>
          <span class="badge" style="background:${u.active ? 'var(--success-color)' : 'var(--danger-color)'}; color:white;">
            ${u.active ? 'Activo' : 'Revocado'}
          </span>
        </td>
        <td style="text-align: right;">
          ${u.uid !== window.internalState.userProfile.uid ? `
            <button class="btn btn-sm ${u.active ? 'btn-danger' : 'btn-primary'}" onclick="window.adminView.toggleAccess('${u.uid}', ${!u.active})">
              ${u.active ? 'Revocar Acceso' : 'Permitir Acceso'}
            </button>
          ` : '<span style="font-size:0.8rem;color:var(--text-tertiary);">Tú (Admin)</span>'}
        </td>
      </tr>
    `).join('');
    window.utils.refreshIcons();
  },

  async changeRole(uid, newRole) {
    try {
      await window.api.users.updateRole(uid, newRole);
      this.renderAdminPanel();
    } catch(err) {
      alert("Error al cambiar rol: " + err.message);
    }
  },

  async toggleAccess(uid, newStatus) {
    if(confirm(`¿Estás seguro de ${newStatus ? 'conceder' : 'revocar'} el acceso a este usuario?`)) {
      try {
        await window.api.users.toggleAccess(uid, newStatus);
        this.renderAdminPanel();
      } catch(err) {
        alert("Error al cambiar estado: " + err.message);
      }
    }
  }
};
