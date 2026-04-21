window.api.auth = {
  // Observador de estado
  onAuthStateChanged(callback) {
    if(window.auth) window.auth.onAuthStateChanged(callback);
  },
  
  async login(email, password) {
    if(!window.auth) throw new Error("Firebase Auth no inicializado");
    const cred = await window.auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  },

  async register(email, password, name) {
    if(!window.auth) throw new Error("Firebase Auth no inicializado");
    const cred = await window.auth.createUserWithEmailAndPassword(email, password);
    
    // Create profile in Firestore
    await window.api.db.collection('users').doc(cred.user.uid).set({
      email: cred.user.email,
      name: name || email.split('@')[0],
      role: 'user', // user o admin
      active: true,
      createdAt: new Date().toISOString()
    });
    
    return cred.user;
  },

  async logout() {
    if(window.auth) await window.auth.signOut();
  },

  async getCurrentUserProfile(uid) {
    if(!window.api.db) return null;
    try {
      const doc = await window.api.db.collection('users').doc(uid).get();
      return doc.exists ? { uid: doc.id, ...doc.data() } : null;
    } catch (err) {
      console.error("Error obteniendo perfil:", err);
      return null;
    }
  }
};
