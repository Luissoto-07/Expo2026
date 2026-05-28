/* ============================================
   TOAST.JS - Sistema de notificaciones
   ============================================ */

const ToastManager = (() => {
  let _container = null;

  function _getContainer() {
    if (!_container) {
      _container = document.createElement('div');
      _container.className = 'toast-container';
      document.body.appendChild(_container);
    }
    return _container;
  }

  function show(message, type = 'info', duration = 4000) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const c = _getContainer();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size:19px;flex-shrink:0">${icons[type]}</span>
      <span style="flex:1">${message}</span>
      <button
        style="margin-left:8px;background:none;border:none;
               color:var(--text-muted);cursor:pointer;font-size:18px;
               line-height:1;padding:0 4px;"
        onclick="this.closest('.toast').remove()"
      >×</button>
    `;

    c.appendChild(toast);

    setTimeout(() => {
      toast.style.cssText += 'opacity:0;transform:translateX(30px);transition:all 0.3s ease';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  }

  return { show };
})();