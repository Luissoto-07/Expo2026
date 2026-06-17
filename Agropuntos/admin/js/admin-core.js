/* ============================================
   ADMIN-CORE.JS - Núcleo: navegación, sidebar,
   tema y toast del dashboard
   ============================================ */

/* ── Toast ── */
const AdminToast = (() => {
  let _c = null;

  function _container() {
    if (!_c) {
      _c = document.createElement('div');
      _c.className = 'toast-a-container';
      document.body.appendChild(_c);
    }
    return _c;
  }

  function show(msg, type = 'info', duration = 3800) {
    const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast-a t-${type}`;
    t.innerHTML = `
      <span style="font-size:18px;flex-shrink:0">${icons[type]}</span>
      <span style="flex:1">${msg}</span>
      <button onclick="this.closest('.toast-a').remove()"
        style="background:none;border:none;color:var(--a-text-3);
               cursor:pointer;font-size:18px;padding:0 4px;line-height:1">×</button>`;
    _container().appendChild(t);
    setTimeout(() => {
      t.style.cssText += 'opacity:0;transform:translateX(24px);transition:all 0.3s ease';
      setTimeout(() => t.remove(), 320);
    }, duration);
  }

  return { show };
})();

/* ── Tema ── */
const AdminTheme = (() => {
  const KEY = 'agropuntos-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
    _syncUI(theme);
  }

  function _syncUI(theme) {
    // Opciones en configuración
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.theme === theme);
    });
  }

  function get() {
    return localStorage.getItem(KEY) ||
      (window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  }

  function init() {
    apply(get());
    document.querySelectorAll('.theme-option').forEach(el => {
      el.addEventListener('click', () => apply(el.dataset.theme));
    });
  }

  return { init, apply, get };
})();

/* ── Sidebar / Navegación ── */
const AdminNav = (() => {
  let currentPage = 'usuarios';

  function navigate(page) {
    currentPage = page;

    // Páginas
    document.querySelectorAll('.admin-page').forEach(p => {
      p.classList.toggle('active', p.id === `page-${page}`);
    });

    // Items del sidebar
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Título del topbar
    const titles = {
      usuarios:      'Gestión de Usuarios',
      puntos:        'Listado de Puntos',
      tareas:        'Gestión de Tareas',
      historial:     'Historial',
      cupones:       'Cupones',
      configuracion: 'Configuración',
    };
    const topbarTitle = document.getElementById('topbar-title');
    if (topbarTitle) topbarTitle.textContent = titles[page] || '';

    // Cerrar sidebar móvil
    document.querySelector('.admin-sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('open');

    // Guardar en URL hash
    window.location.hash = page;
  }

  function init() {
    // Clicks en ítems del menú
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // Sidebar móvil
    const toggle  = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('open');
    });

    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
    });

    // Cerrar sesión
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('ap-admin-auth');
        window.location.href = 'index.html';
      }
    });

    // Restaurar desde hash
    const hash = window.location.hash.replace('#', '');
    navigate(hash && document.getElementById(`page-${hash}`) ? hash : 'usuarios');
  }

  return { init, navigate };
})();

/* ── Modal helper ── */
const AdminModal = (() => {
  function open(id)  { document.getElementById(id)?.classList.add('open'); }
  function close(id) { document.getElementById(id)?.classList.remove('open'); }

  function closeOnOverlay(id) {
    const el = document.getElementById(id);
    el?.addEventListener('click', e => { if (e.target === el) close(id); });
  }

  function confirm(msg, onYes, danger = true) {
    const overlay = document.getElementById('modal-confirm');
    const msgEl   = document.getElementById('confirm-msg');
    const btnYes  = document.getElementById('confirm-yes');

    if (!overlay || !msgEl || !btnYes) { if(onYes) onYes(); return; }

    msgEl.textContent = msg;
    btnYes.className  = `btn-a btn-full ${danger ? 'btn-danger' : 'btn-primary'}`;

    const handler = () => { close('modal-confirm'); onYes?.(); btnYes.removeEventListener('click', handler); };
    btnYes.addEventListener('click', handler);
    open('modal-confirm');
  }

  return { open, close, closeOnOverlay, confirm };
})();

/* ── Exportar CSV helper ── */
function exportCSV(data, filename) {
  if (!data.length) { AdminToast.show('No hay datos para exportar.', 'warning'); return; }
  const keys = Object.keys(data[0]);
  const csv  = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename + '.csv';
  a.click(); URL.revokeObjectURL(url);
  AdminToast.show(`Exportado: ${filename}.csv`, 'success');
}

/* ── Init global ── */
document.addEventListener('DOMContentLoaded', () => {
  AdminTheme.init();
  AdminNav.init();

  // Cerrar modales al hacer clic en overlay
  document.querySelectorAll('.modal-overlay-a').forEach(el => {
    AdminModal.closeOnOverlay(el.id);
  });

  // Inicializar todas las secciones
  AdminUsuarios.init();
  AdminPuntos.init();
  AdminTareas.init();
  AdminHistorial.init();
  AdminCupones.init();
  AdminConfiguracion.init();
});