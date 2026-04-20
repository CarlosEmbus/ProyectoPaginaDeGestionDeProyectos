// Configuración Nube Firebase Nivel Producción
const firebaseConfig = {
  apiKey: "AIzaSyCELf-lR22g5vhGeycXYY3s3lB9hEQd7BI",
  authDomain: "paginagestionproyectos.firebaseapp.com",
  projectId: "paginagestionproyectos",
  storageBucket: "paginagestionproyectos.firebasestorage.app",
  messagingSenderId: "313355631787",
  appId: "1:313355631787:web:ecb9dd58696cf526990bee",
  measurementId: "G-41M14C3WM8"
};

// Inicializamos la app Cloud asegurándonos de que cargó el SDK del Index
if(window.firebase) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = window.firebase ? firebase.firestore() : null;

window.internalState = {
  db: { projects: [] },
  activeProjectId: null
};

window.Database = {
  async load() {
    if(!firestore) {
        console.error("Firebase no está cargado");
        return;
    }
    
    try {
      const docRef = firestore.collection('pmi_manager').doc('global_db');
      const doc = await docRef.get();
      
      if (doc.exists) {
        window.internalState.db = doc.data();
      } else {
        // Primera vez corriendo: inicializamos DB vacía
        window.internalState.db = { projects: [] };
        await docRef.set(window.internalState.db);
      }
    } catch(err) {
      console.error("Error Leyendo en Firebase Nube:", err);
      // Alerta amigable si olvidaron ajustar las reglas Firestore a "Test Mode"
      if(err.message && err.message.includes("Missing or insufficient permissions")) {
        alert("¡Casi listo! Ve a la consola de Firebase > Firestore Database > Securtity Rules (Reglas) y asegurate de permitir lectura/escritura poniendo 'allow read, write: if true;' para desarrollo.");
      }
      
      // Fallback a vacio en caso extremo de internet
      window.internalState.db = { projects: [] };
    }
  },
  
  async save() {
    if(!firestore) return;
    try {
      await firestore.collection('pmi_manager').doc('global_db').set(window.internalState.db);
    } catch(err) {
      console.error("Error Guardando en Nube Firebase:", err);
      if(err.message && err.message.includes("Missing or insufficient permissions")) {
        alert("Las reglas de Firebase están bloqueando la guardada de datos. Cambia a Reglas de Prueba (Test Mode).");
      }
    }
  }
};

window.getProject = () => window.internalState.db.projects.find(p => p.id === window.internalState.activeProjectId);

// El Guardado ahora invoca una promesa silenciosa que emite a la Nube (Asíncrono)
window.saveDb = () => window.Database.save();

// Virtual State mimicking previous structure relative to active project
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
