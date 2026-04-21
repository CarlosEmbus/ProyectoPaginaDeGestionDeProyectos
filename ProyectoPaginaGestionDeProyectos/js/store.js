window.internalState = {
  projects: [],
  activeProjectId: null
};

// Local cache for the active project's subcollections
window.state = {
  wbs: [],
  risks: [],
  comms: []
};

window.getProject = () => window.internalState.projects.find(p => p.id === window.internalState.activeProjectId);

// Bootstrapper loading
window.Database = {
  async load() {
    window.internalState.projects = await window.api.projects.getAll();
  }
};
