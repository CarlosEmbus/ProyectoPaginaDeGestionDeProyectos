window.portfolioView = {
  charts: {},
  portfolioData: [],
  sortCol: 'name',
  sortAsc: true,

  async renderPortfolio() {
    document.getElementById('view-title').innerText = "Cargando Portafolio...";
    const projects = await window.api.projects.getAllPortfolio();
    
    // Enrich projects with metrics
    // In a production app, these would be aggregated on the backend (e.g. Cloud Functions)
    // Here we calculate them on the fly or provide realistic mock data for empty projects to demonstrate the UI.
    
    const enrichedProjects = await Promise.all(projects.map(async (p) => {
      try {
        const wbs = await window.api.wbs.getAll(p.id);
        const risks = await window.api.risks.getAll(p.id);
        
        let totalBudget = 0;
        if(wbs && wbs.length > 0) {
          totalBudget = wbs.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0);
        } else {
          // Generate a deterministic fake budget for demo if empty
          totalBudget = (p.name.length * 15000) % 500000 + 50000; 
        }

        // Reading saved KPIs or defaulting
        const progress = p.progress !== undefined ? p.progress : 0;
        const cpi = p.cpi !== undefined ? p.cpi : 1.00;
        const spi = p.spi !== undefined ? p.spi : 1.00;
        const roi = p.roi !== undefined ? p.roi : 0;
        const pmName = p.pmName || 'PM No Asignado';
        
        const hash = p.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
        const depts = ["TI", "Marketing", "Operaciones", "RRHH", "Finanzas"];
        const dept = p.dept || depts[Math.abs(hash % depts.length)];

        let activeRisks = risks || [];
        if (activeRisks.length === 0) {
           // Mock risks
           activeRisks = [
             { prob: 'Alta', impact: 'Alta' },
             { prob: 'Media', impact: 'Alta' },
             { prob: 'Baja', impact: 'Baja' }
           ].slice(0, (Math.abs(hash) % 3) + 1);
        }
        
        return {
          ...p,
          budget: totalBudget,
          progress,
          cpi,
          spi,
          roi,
          pmName,
          dept,
          activeRisks
        };
      } catch (e) {
        console.warn('Error fetching details for project ' + p.id, e);
        return { ...p, budget: 0, progress: 0, cpi: 1, spi: 1, roi: 0, pmName: p.pmName || 'PM', dept: 'TI', activeRisks: [] };
      }
    }));

    this.portfolioData = enrichedProjects;
    
    this.updateKPIs();
    this.renderCharts();
    this.renderTable();
    
    document.getElementById('view-title').innerText = "Portafolio Ejecutivo";
  },

  updateKPIs() {
    const data = this.portfolioData;
    
    let active = 0, closed = 0, proposed = 0;
    let totalBudget = 0, executedBudget = 0;
    let sumCPI = 0, sumSPI = 0, sumROI = 0;

    data.forEach(p => {
      if(p.status === 'Terminado') closed++;
      else if(p.status === 'Planeado') proposed++;
      else active++;

      totalBudget += p.budget;
      executedBudget += p.budget * (p.progress / 100);
      sumCPI += p.cpi;
      sumSPI += p.spi;
      sumROI += p.roi;
    });

    const count = data.length || 1;
    
    document.getElementById('portfolio-total-projects').innerText = data.length;
    document.getElementById('portfolio-project-breakdown').innerText = `${active} Activos / ${closed} Cerrados / ${proposed} Planeados`;
    
    document.getElementById('portfolio-total-budget').innerText = `$${totalBudget.toLocaleString('en-US')}`;
    document.getElementById('portfolio-executed-budget').innerText = `Ejecutado: $${executedBudget.toLocaleString('en-US', {maximumFractionDigits:0})}`;

    document.getElementById('portfolio-avg-cpi').innerText = (sumCPI / count).toFixed(2);
    document.getElementById('portfolio-avg-spi').innerText = (sumSPI / count).toFixed(2);
    document.getElementById('portfolio-avg-roi').innerText = (sumROI / count).toFixed(1) + '%';
  },

  renderCharts() {
    const data = this.portfolioData;

    // Destroy old charts to prevent overlapping
    Object.values(this.charts).forEach(chart => chart && chart.destroy());

    // 1. Status Donut Chart
    const statusCounts = { 'Planeado': 0, 'Ejecución': 0, 'Estabilización': 0, 'Terminado': 0 };
    data.forEach(p => { statusCounts[p.status || 'Planeado']++; });

    const ctxStatus = document.getElementById('portfolio-status-chart').getContext('2d');
    this.charts.status = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#64748b', '#3b82f6', '#f59e0b', '#10b981'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // 2. Department Bar Chart
    const deptBudget = {};
    data.forEach(p => {
      deptBudget[p.dept] = (deptBudget[p.dept] || 0) + p.budget;
    });

    const ctxDept = document.getElementById('portfolio-dept-chart').getContext('2d');
    this.charts.dept = new Chart(ctxDept, {
      type: 'bar',
      data: {
        labels: Object.keys(deptBudget),
        datasets: [{
          label: 'Inversión ($)',
          data: Object.values(deptBudget),
          backgroundColor: '#8b5cf6',
          borderRadius: 4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. EVA S-Curve Chart (Mocked cumulative timeline)
    // We will generate a mock S-curve of Planned Value vs Earned Value for the portfolio
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    let pv = 0; let ev = 0;
    const pvData = [], evData = [];
    const totalPV = data.reduce((sum, p) => sum + p.budget, 0);
    const totalEV = data.reduce((sum, p) => sum + (p.budget * (p.progress/100)), 0);
    
    for(let i=0; i<6; i++) {
       // simple sigmoid approximation for S-Curve
       const t = i / 5; 
       pvData.push(totalPV * (t * t * (3 - 2 * t)));
       evData.push(totalEV * (t * t * (3 - 2 * t)));
    }

    const ctxEva = document.getElementById('portfolio-eva-chart').getContext('2d');
    this.charts.eva = new Chart(ctxEva, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Valor Planeado (PV)', data: pvData, borderColor: '#cbd5e1', tension: 0.4 },
          { label: 'Valor Ganado (EV)', data: evData, borderColor: '#10b981', tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // 4. Risk Scatter Plot
    const probMap = { 'Baja': 1, 'Media': 2, 'Alta': 3 };
    const riskPoints = [];
    data.forEach(p => {
      if(p.activeRisks) {
        p.activeRisks.forEach(r => {
           // Add a small random jitter to avoid overlapping completely
           const jitterX = (Math.random() - 0.5) * 0.4;
           const jitterY = (Math.random() - 0.5) * 0.4;
           riskPoints.push({
             x: probMap[r.prob || 'Media'] + jitterX,
             y: probMap[r.impact || 'Media'] + jitterY,
             project: p.name
           });
        });
      }
    });

    const ctxRisk = document.getElementById('portfolio-risk-chart').getContext('2d');
    this.charts.risk = new Chart(ctxRisk, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Riesgos Identificados',
          data: riskPoints,
          backgroundColor: '#ef4444'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { min: 0.5, max: 3.5, title: { display: true, text: 'Probabilidad (1=Baja, 3=Alta)' } },
          y: { min: 0.5, max: 3.5, title: { display: true, text: 'Impacto (1=Baja, 3=Alta)' } }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `Proyecto: ${ctx.raw.project} | Prob: ${ctx.raw.x.toFixed(1)}, Imp: ${ctx.raw.y.toFixed(1)}`
            }
          }
        }
      }
    });
  },

  sort(col) {
    if(this.sortCol === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortCol = col;
      this.sortAsc = true;
    }
    this.renderTable();
  },

  filterProjects() {
    this.renderTable();
  },

  renderTable() {
    const term = (document.getElementById('portfolio-search').value || '').toLowerCase();
    const tbody = document.getElementById('portfolio-table-body');
    
    let displayData = this.portfolioData.filter(p => 
      p.name.toLowerCase().includes(term) || (p.id.toLowerCase().includes(term))
    );

    displayData.sort((a, b) => {
      let valA = a[this.sortCol];
      let valB = b[this.sortCol];
      if (this.sortCol === 'code') { valA = a.id; valB = b.id; }
      
      if(valA < valB) return this.sortAsc ? -1 : 1;
      if(valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    tbody.innerHTML = displayData.map(p => `
      <tr>
        <td style="font-weight: 500; color: var(--text-primary);">${p.name}</td>
        <td style="font-size: 0.8rem; color: var(--text-tertiary);">${p.id.substring(0, 8)}</td>
        <td>${p.pmName}</td>
        <td><span class="badge" style="background: var(--bg-secondary); color: var(--text-primary); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: var(--radius-md);">${p.status || 'Planeado'}</span></td>
        <td>$${p.budget.toLocaleString('en-US')}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex-grow: 1; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${p.progress}%; background: var(--primary-color);"></div>
            </div>
            <span style="font-size: 0.8rem;">${p.progress}%</span>
          </div>
        </td>
        <td style="color: ${p.cpi < 1 ? 'var(--danger-color)' : 'var(--success-color)'}; font-weight: 600;">${p.cpi.toFixed(2)}</td>
        <td style="color: ${p.spi < 1 ? 'var(--danger-color)' : 'var(--success-color)'}; font-weight: 600;">${p.spi.toFixed(2)}</td>
        <td style="color: ${p.roi < 0 ? 'var(--danger-color)' : 'var(--success-color)'}; font-weight: 600;">${p.roi}%</td>
        <td style="font-size: 0.8rem; color: var(--text-tertiary);">Reciente</td>
      </tr>
    `).join('');
    
    window.utils.refreshIcons();
  }
};
