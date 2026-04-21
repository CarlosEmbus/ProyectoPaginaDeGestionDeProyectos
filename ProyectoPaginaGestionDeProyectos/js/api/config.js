const firebaseConfig = {
  apiKey: "AIzaSyCELf-lR22g5vhGeycXYY3s3lB9hEQd7BI",
  authDomain: "paginagestionproyectos.firebaseapp.com",
  projectId: "paginagestionproyectos",
  storageBucket: "paginagestionproyectos.firebasestorage.app",
  messagingSenderId: "313355631787",
  appId: "1:313355631787:web:ecb9dd58696cf526990bee",
  measurementId: "G-41M14C3WM8"
};

// Initialize Firebase if not already initialized
if (window.firebase && !window.firebase.apps.length) {
  window.firebase.initializeApp(firebaseConfig);
}

window.api = {
  db: window.firebase ? window.firebase.firestore() : null
};
window.auth = window.firebase ? window.firebase.auth() : null;
