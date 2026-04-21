window.api.risks = {
  collection: (projectId) => window.api.db.collection('projects').doc(projectId).collection('risks'),

  async getAll(projectId) {
    if (!window.api.db) return [];
    try {
      const snapshot = await this.collection(projectId).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("API Error - getRisks:", error);
      return [];
    }
  },

  async save(projectId, risk) {
    if (!window.api.db) return risk;
    // Firebase requires string IDs usually, ensure ID is string
    const docId = risk.id.toString(); 
    await this.collection(projectId).doc(docId).set(risk);
    return risk;
  },

  async delete(projectId, riskId) {
    if (!window.api.db) return;
    await this.collection(projectId).doc(riskId.toString()).delete();
  }
};
