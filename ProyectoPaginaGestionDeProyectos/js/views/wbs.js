window.wbsView = {
  renderWbs() {
    if(!window.getProject()) return;
    const container = document.getElementById('wbs-tree-container');
    if(!container) return;

    const getChildren = (parentId) => window.state.wbs.filter(t => t.parentId === parentId);

    const buildTree = (parentId, prefixText) => {
      const children = getChildren(parentId);
      if(children.length === 0) return '';
      
      let html = '<ul>';
      children.forEach((child, index) => {
        let currentNum = prefixText ? `${prefixText}.${index + 1}` : `${index + 1}`;
        if (!parentId) currentNum = "Proyecto"; // root visual ignore
        
        const isRoot = !parentId;
        const displayNum = isRoot ? '1' : currentNum;
        const nextPrefix = isRoot ? '1' : currentNum;

        html += `
          <li>
            <div class="tree-node">
              <div class="node-num">${displayNum}</div>
              <textarea class="node-name" rows="2" onchange="window.wbsView.updateWbsName('${child.id}', this.value)" placeholder="Nombre Tarea">${child.name}</textarea>
              <div style="width: 100%; border-bottom: 1px dashed var(--border-color); margin: 0.2rem 0;"></div>
              <input type="text" style="font-size:0.75rem; width:100%; text-align:center; border:none; outline:none; background:transparent; color:var(--primary-color); font-weight: 600;" placeholder="Responsable..." value="${child.owner || ''}" onchange="window.wbsView.updateWbsOwner('${child.id}', this.value)" />
              <div class="node-budget-container" style="margin-top:0.4rem;">
                $ <input type="number" class="node-budget" value="${child.budget}" onchange="window.wbsView.updateWbsBudget('${child.id}', this.value)" />
              </div>
              <div class="node-actions">
                <button class="btn-icon btn-sm" onclick="window.wbsView.addChildWbs('${child.id}')" title="Agregar sub-tarea"><i data-lucide="plus"></i></button>
                ${!isRoot ? `<button class="btn-icon btn-sm btn-danger-text" onclick="window.wbsView.deleteWbs('${child.id}')" title="Eliminar"><i data-lucide="trash-2"></i></button>` : ''}
              </div>
            </div>
            ${buildTree(child.id, nextPrefix)}
          </li>
        `;
      });
      html += '</ul>';
      return html;
    };

    container.innerHTML = `<div class="tree">${buildTree(null, '')}</div>`;
    window.utils.refreshIcons();
    window.dashboardView.updateDashboard();
  },

  updateWbsName(id, val) {
    const node = window.state.wbs.find(t => t.id === id);
    if(node) node.name = val;
    window.dashboardView.updateDashboard();
  },

  updateWbsOwner(id, val) {
    const node = window.state.wbs.find(t => t.id === id);
    if(node) node.owner = val;
    window.dashboardView.updateDashboard();
  },

  updateWbsBudget(id, val) {
    const node = window.state.wbs.find(t => t.id === id);
    if(node) node.budget = parseFloat(val) || 0;
    window.dashboardView.updateDashboard();
  },

  addChildWbs(parentId) {
    window.state.wbs.push({
      id: 'node-' + Date.now(),
      name: 'Nueva Tarea',
      budget: 0,
      owner: '',
      parentId: parentId
    });
    this.renderWbs();
  },

  deleteWbs(id) {
    if(confirm('¿Eliminar esta tarea y todas sus sub-tareas?')) {
      const deleteRecursive = (nodeId) => {
        const children = window.state.wbs.filter(t => t.parentId === nodeId);
        children.forEach(c => deleteRecursive(c.id));
        window.state.wbs = window.state.wbs.filter(t => t.id !== nodeId);
      };
      deleteRecursive(id);
      this.renderWbs();
    }
  }
};
