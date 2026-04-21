window.authView = {
  toggleForm() {
    const isLogin = document.getElementById('form-login').classList.contains('hidden');
    if(isLogin) {
      document.getElementById('form-login').classList.remove('hidden');
      document.getElementById('form-register').classList.add('hidden');
      document.getElementById('auth-title').innerText = "Iniciar Sesión";
    } else {
      document.getElementById('form-login').classList.add('hidden');
      document.getElementById('form-register').classList.remove('hidden');
      document.getElementById('auth-title').innerText = "Crear Cuenta";
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    
    try {
      await window.api.auth.login(email, pass);
      // Auth observer in app.js will handle redirect
    } catch(err) {
      alert("Error al iniciar sesión: " + err.message);
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    
    try {
      await window.api.auth.register(email, pass, name);
      // Auth observer will handle redirect
    } catch(err) {
      alert("Error al registrar: " + err.message);
    }
  },
  
  async handleLogout() {
    if(confirm("¿Seguro que deseas cerrar sesión?")) {
      await window.api.auth.logout();
    }
  }
};
