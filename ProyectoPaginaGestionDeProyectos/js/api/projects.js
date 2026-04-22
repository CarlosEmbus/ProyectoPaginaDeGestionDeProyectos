window.api.projects = {
  collection: () => window.api.db.collection('projects'),

  async getAll() {
    if (!window.api.db || !window.internalState.userProfile) return [];
    try {
      const snapshot = await this.collection().where('userId', '==', window.internalState.userProfile.uid).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("API Error - getProjects:", error);
      return [];
    }
  },

  async getAllPortfolio() {
    if (!window.api.db) return [];
    try {
      const snapshot = await this.collection().get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("API Error - getAllPortfolio:", error);
      return [];
    }
  },

  async create(projectData) {
    if (!window.api.db) return projectData;
    projectData.userId = window.internalState.userProfile.uid;
    await this.collection().doc(projectData.id).set(projectData);
    return projectData;
  },

  async update(projectId, data) {
    if (!window.api.db) return;
    await this.collection().doc(projectId).update(data);
  },

  async delete(projectId) {
    if (!window.api.db) return;
    await this.collection().doc(projectId).delete();
  }
};
