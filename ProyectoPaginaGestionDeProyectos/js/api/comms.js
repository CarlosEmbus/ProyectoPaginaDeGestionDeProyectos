window.api.comms = {
  collection: (projectId) => window.api.db.collection('projects').doc(projectId).collection('comms'),

  async getAll(projectId) {
    if (!window.api.db) return [];
    try {
      const snapshot = await this.collection(projectId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("API Error - getComms:", error);
      return [];
    }
  },

  async save(projectId, comm) {
    if (!window.api.db) return comm;
    const docId = comm.id.toString();
    await this.collection(projectId).doc(docId).set(comm);
    return comm;
  },

  async delete(projectId, commId) {
    if (!window.api.db) return;
    await this.collection(projectId).doc(commId.toString()).delete();
  }
};
