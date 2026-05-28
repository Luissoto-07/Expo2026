/* ============================================
   NAVBAR.JS - Lógica del navbar
   ============================================ */

const NavbarManager = (() => {

  // Marcar enlace activo según la página actual
  function _setActiveLink() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav a, .navbar-mobile a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === page);
    });
  }

  // Menú hamburguesa (móvil)
  function _setupMobile() {
    const burger = document.querySelector('.navbar-hamburger');
    const menu   = document.querySelector('.navbar-mobile');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => menu.classList.toggle('open'));

    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => menu.classList.remove('open'))
    );

    document.addEventListener('click', e => {
      if (!burger.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
  }

  // Sincronizar badge de puntos
  function _syncPoints() {
    const update = pts => {
      document.querySelectorAll('.user-points-display').forEach(el => {
        el.textContent = Number(pts).toLocaleString() + ' pts';
      });
    };
    update(AppState.currentUser.points);
    AppState.onPointsChange(update);
  }

  function init() {
    _setActiveLink();
    _setupMobile();
    _syncPoints();
  }

  return { init };
})();