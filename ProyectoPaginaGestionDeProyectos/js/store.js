const DB_KEY = 'pmi_manager_db';

window.Database = {
  load() {
    const data = localStorage.getItem(DB_KEY);
    if(data) return JSON.parse(data);
    return { projects: [] };
  },
  save(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }
};

window.internalState = {
  db: window.Database.load(),
  activeProjectId: null
};

window.getProject = () => window.internalState.db.projects.find(p => p.id === window.internalState.activeProjectId);
window.saveDb = () => window.Database.save(window.internalState.db);

window.state = Object.defineProperty({}, 'wbs', {
  get: () => window.getProject() ? window.getProject().wbs : [],
  set: (v) => { if(window.getProject()) window.getProject().wbs = v; }
});
Object.defineProperty(window.state, 'risks', {
  get: () => window.getProject() ? window.getProject().risks : [],
  set: (v) => { if(window.getProject()) window.getProject().risks = v; }
});
Object.defineProperty(window.state, 'comms', {
  get: () => window.getProject() ? window.getProject().comms : [],
  set: (v) => { if(window.getProject()) window.getProject().comms = v; }
});
