window.api.wbs = {
  collection: (projectId) => window.api.db.collection('projects').doc(projectId).collection('wbs'),

  async getAll(projectId) {
    if (!window.api.db) return [];
    try {
      const snapshot = await this.collection(projectId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("API Error - getWbs:", error);
      return [];
    }
  },

  async save(projectId, wbsNode) {
    if (!window.api.db) return wbsNode;
    await this.collection(projectId).doc(wbsNode.id).set(wbsNode);
    return wbsNode;
  },

  async delete(projectId, nodeId) {
    if (!window.api.db) return;
    await this.collection(projectId).doc(nodeId).delete();
  }
};
