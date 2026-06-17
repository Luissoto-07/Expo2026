/* ============================================
   THEME.JS - Toggle modo claro / oscuro
   ============================================ */

const ThemeManager = (() => {
  const KEY   = 'agropuntos-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';

  function getInitialTheme() {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored;
    // Preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: light)').matches ? LIGHT : DARK;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    _updateIcons(theme);
  }

  function _updateIcons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === LIGHT ? '🌙' : '☀️';
      btn.title = theme === LIGHT ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
    });
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme') || DARK;
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  function init() {
    applyTheme(getInitialTheme());

    // Detectar cambio de preferencia del sistema
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
      if (!localStorage.getItem(KEY)) applyTheme(e.matches ? LIGHT : DARK);
    });

    // Enlazar todos los botones toggle
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggle);
    });
  }

  return { init, toggle, applyTheme };
})();

// Aplicar tema inmediatamente (evita flash)
(function () {
  const saved = localStorage.getItem('agropuntos-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();