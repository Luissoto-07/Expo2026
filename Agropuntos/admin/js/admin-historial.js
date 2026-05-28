/* ============================================
   ADMIN-HISTORIAL.JS - Historial de actividad
   ============================================ */

const AdminHistorial = (() => {

  function render(list) {
    const container = document.getElementById('historial-list');
    if (!container) return;

    container.innerHTML = list.map((h, i) => `
      <div class="historial-item" style="animation-delay:${i*0.05}s">
        <div class="historial-dot ${h.dot}"></div>
        <div class="historial-body">
          <div class="historial-title">${h.title}</div>
          <div class="historial-desc">${h.desc}</div>
        </div>
        <div class="historial-time">
          <div class="historial-time-relative">${h.time}</div>
          <div class="historial-time-date">${h.date}</div>
        </div>
      </div>
    `).join('');
  }

  function init() {
    render(ADMIN_HISTORY);

    // Filtros
    document.getElementById('historial-filter')?.addEventListener('change', e => {
      const val = e.target.value;
      const filtered = val === 'all'
        ? ADMIN_HISTORY
        : ADMIN_HISTORY.filter(h => h.dot === `dot-${val}`);
      render(filtered);
    });

    // Exportar
    document.getElementById('btn-exportar-historial')?.addEventListener('click', () => {
      exportCSV(ADMIN_HISTORY.map(h => ({
        Título: h.title, Descripción: h.desc,
        Tiempo: h.time, Fecha: h.date,
      })), 'historial_agropuntos');
    });
  }

  return { init };
})();