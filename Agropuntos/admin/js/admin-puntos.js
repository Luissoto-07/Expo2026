/* ============================================
   ADMIN-PUNTOS.JS - Listado de puntos
   ============================================ */

const AdminPuntos = (() => {

  function renderStats() {
    const ganados     = ADMIN_USERS.reduce((s,u) => s + u.points + u.redeemed, 0);
    const usados      = ADMIN_USERS.reduce((s,u) => s + u.redeemed, 0);
    const perdidos    = 890; // mock
    const disponibles = ADMIN_USERS.reduce((s,u) => s + u.points, 0);

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val.toLocaleString();
    };
    set('pts-ganados', ganados);
    set('pts-usados',  usados);
    set('pts-perdidos',perdidos);
    set('pts-disponibles', disponibles);
  }

  function renderTabla() {
    const tbody = document.getElementById('puntos-tbody');
    if (!tbody) return;

    tbody.innerHTML = ADMIN_USERS.map(u => `
      <tr>
        <td>
          <div class="user-mini">
            <div class="av av-sm" style="background:${getAvColor(u.name)}">${u.initials}</div>
            <div class="user-mini-info">
              <div class="u-name">${u.name}</div>
              <div class="u-phone">${u.phone}</div>
            </div>
          </div>
        </td>
        <td style="color:var(--a-accent);font-weight:700">${u.points.toLocaleString()} pts</td>
        <td style="color:var(--a-text-2)">${u.redeemed.toLocaleString()} pts</td>
        <td>
          <div class="action-btns">
            <button class="icon-btn green" title="Ver perfil"   onclick="AdminUsuarios.verUsuario(${u.id})">👤</button>
            <button class="icon-btn blue"  title="Editar"       onclick="AdminUsuarios.editUsuario(${u.id})">✏️</button>
            <button class="icon-btn yellow" title="Exportar"    onclick="AdminPuntos.exportarUsuario(${u.id})">⬇️</button>
            <button class="icon-btn red"   title="Eliminar"     onclick="AdminUsuarios.eliminarUsuario(${u.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function exportarUsuario(id) {
    const u = ADMIN_USERS.find(x => x.id === id);
    if (!u) return;
    exportCSV([{
      Nombre: u.name, Email: u.email,
      'Puntos Actuales': u.points, 'Puntos Canjeados': u.redeemed,
      Departamento: u.dept, Nivel: u.nivel,
    }], `puntos_${u.username}`);
  }

  function init() {
    renderStats();
    renderTabla();

    document.getElementById('btn-exportar-puntos')?.addEventListener('click', () => {
      exportCSV(ADMIN_USERS.map(u => ({
        Nombre: u.name, Email: u.email,
        'Puntos Actuales': u.points, 'Puntos Canjeados': u.redeemed,
      })), 'puntos_agropuntos');
    });
  }

  return { init, exportarUsuario };
})();