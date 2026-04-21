window.api.users = {
  async getAll() {
    if (!window.api.db) return [];
    try {
      const snapshot = await window.api.db.collection('users').get();
      return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("API Error - getUsers:", error);
      return [];
    }
  },

  async updateRole(uid, role) {
    if (!window.api.db) return;
    await window.api.db.collection('users').doc(uid).update({ role });
  },

  async toggleAccess(uid, activeStatus) {
    if (!window.api.db) return;
    await window.api.db.collection('users').doc(uid).update({ active: activeStatus });
  }
};
