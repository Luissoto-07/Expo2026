/* ============================================
   ADMIN-AUTH.JS - Login del administrador
   ============================================ */

const AdminAuth = (() => {

  const CREDS = { user: 'admin', pass: 'admin123' }; // Mock

  function init() {
    const form = document.getElementById('login-form');
    if (!form) return;

    // Si ya está autenticado, redirigir
    if (localStorage.getItem('ap-admin-auth') === 'true') {
      window.location.href = 'dashboard.html';
      return;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value;
      const errEl = document.getElementById('login-error');

      if (user === CREDS.user && pass === CREDS.pass) {
        localStorage.setItem('ap-admin-auth', 'true');
        window.location.href = 'dashboard.html';
      } else {
        errEl.textContent = 'Usuario o contraseña incorrectos.';
        errEl.style.display = 'block';
        document.getElementById('login-pass').value = '';
      }
    });

    // Toggle password
    document.getElementById('toggle-pass')?.addEventListener('click', () => {
      const inp = document.getElementById('login-pass');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
  }

  function guard() {
    if (localStorage.getItem('ap-admin-auth') !== 'true') {
      window.location.href = 'index.html';
    }
  }

  return { init, guard };
})();