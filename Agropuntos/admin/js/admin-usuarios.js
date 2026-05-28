/* ============================================
   ADMIN-USUARIOS.JS - CRUD de usuarios
   ============================================ */

const AdminUsuarios = (() => {
  let users       = [...ADMIN_USERS];
  let searchQ     = '';
  let currentPage = 1;
  const PER_PAGE  = 7;
  let editingId   = null;

  /* ── Render tabla ── */
  function render() {
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQ.toLowerCase()) ||
      u.dept.toLowerCase().includes(searchQ.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    currentPage = Math.min(currentPage, Math.max(1, totalPages));
    const slice = filtered.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

    const tbody = document.getElementById('usuarios-tbody');
    if (!tbody) return;

    tbody.innerHTML = slice.length ? slice.map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="av av-sm" style="background:${getAvColor(u.name)}">${u.initials}</div>
            <div class="user-cell-info">
              <div class="user-name">
                ${u.name}
                ${u.status === 'activo' ? '<span class="user-verified">✔</span>' : ''}
              </div>
              <div class="user-email">${u.email}</div>
            </div>
          </div>
        </td>
        <td style="color:var(--a-text-2)">${u.username}</td>
        <td>
          <span class="badge badge-dot ${u.status==='activo'?'badge-success':'badge-danger'}">
            ${u.status==='activo'?'Activo':'Inactivo'}
          </span>
        </td>
        <td><span class="nivel-badge nivel-${u.nivel.toLowerCase()}">${u.nivel}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-a btn-sm btn-info"    onclick="AdminUsuarios.verUsuario(${u.id})">Ver</button>
            <button class="btn-a btn-sm btn-secondary" onclick="AdminUsuarios.editUsuario(${u.id})">Editar</button>
            <button class="btn-a btn-sm btn-danger"  onclick="AdminUsuarios.eliminarUsuario(${u.id})">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5"><div class="empty-state"><span class="empty-state-icon">👤</span><p class="empty-state-text">No se encontraron usuarios.</p></div></td></tr>`;

    // Paginación
    const info = document.getElementById('pag-info');
    if (info) info.textContent = `Mostrando ${(currentPage-1)*PER_PAGE+1}–${Math.min(currentPage*PER_PAGE, filtered.length)} de ${filtered.length}`;
    _renderPagination(totalPages);
  }

  function _renderPagination(total) {
    const c = document.getElementById('pag-btns');
    if (!c) return;
    c.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'pag-btn'; prev.textContent = '‹';
    prev.disabled = currentPage === 1;
    prev.onclick = () => { currentPage--; render(); };
    c.appendChild(prev);

    for (let i = 1; i <= total; i++) {
      const btn = document.createElement('button');
      btn.className = `pag-btn ${i === currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.onclick = () => { currentPage = i; render(); };
      c.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'pag-btn'; next.textContent = '›';
    next.disabled = currentPage === total;
    next.onclick = () => { currentPage++; render(); };
    c.appendChild(next);
  }

  /* ── Ver usuario ── */
  function verUsuario(id) {
    const u = users.find(x => x.id === id);
    if (!u) return;

    document.getElementById('ver-modal-body').innerHTML = `
      <div class="user-modal-avatar">
        <div class="av av-xl" style="background:${getAvColor(u.name)}">${u.initials}</div>
        <div style="font-size:20px;font-weight:800;color:var(--a-text);margin-top:8px">${u.name}</div>
        <div style="font-size:13px;color:var(--a-text-3)">${u.email}</div>
        <span class="badge badge-dot ${u.status==='activo'?'badge-success':'badge-danger'}">${u.status}</span>
      </div>
      <div class="user-modal-pts">
        <div class="pts-stat">
          <div class="pts-stat-val">${u.points.toLocaleString()}</div>
          <div class="pts-stat-label">Puntos actuales</div>
        </div>
        <div class="pts-stat">
          <div class="pts-stat-val">${u.redeemed.toLocaleString()}</div>
          <div class="pts-stat-label">Puntos canjeados</div>
        </div>
      </div>
      <div style="margin-top:20px">
        ${[
          ['Username', u.username],
          ['Departamento', u.dept],
          ['Teléfono', u.phone],
          ['Nivel', u.nivel],
        ].map(([l,v]) => `
          <div class="task-detail-row">
            <span>${l}</span>
            <span>${v}</span>
          </div>`).join('')}
      </div>`;

    AdminModal.open('modal-ver-usuario');
  }

  /* ── Editar usuario ── */
  function editUsuario(id) {
    const u = users.find(x => x.id === id);
    editingId = id;
    if (!u) return;

    document.getElementById('eu-name').value    = u.name;
    document.getElementById('eu-email').value   = u.email;
    document.getElementById('eu-username').value= u.username;
    document.getElementById('eu-phone').value   = u.phone;
    document.getElementById('eu-dept').value    = u.dept;
    document.getElementById('eu-nivel').value   = u.nivel;
    document.getElementById('eu-status').value  = u.status;
    document.getElementById('eu-points').value  = u.points;

    AdminModal.open('modal-editar-usuario');
  }

  /* ── Guardar edición ── */
  function guardarEdicion() {
    const u = users.find(x => x.id === editingId);
    if (!u) return;

    u.name    = document.getElementById('eu-name').value.trim();
    u.email   = document.getElementById('eu-email').value.trim();
    u.username= document.getElementById('eu-username').value.trim();
    u.phone   = document.getElementById('eu-phone').value.trim();
    u.dept    = document.getElementById('eu-dept').value.trim();
    u.nivel   = document.getElementById('eu-nivel').value;
    u.status  = document.getElementById('eu-status').value;
    u.points  = parseInt(document.getElementById('eu-points').value) || u.points;
    u.initials= u.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();

    render();
    AdminModal.close('modal-editar-usuario');
    AdminToast.show(`Usuario "${u.name}" actualizado.`, 'success');
    editingId = null;
  }

  /* ── Nuevo usuario ── */
  function nuevoUsuario() {
    editingId = null;
    document.getElementById('eu-form').reset();
    AdminModal.open('modal-editar-usuario');
    document.getElementById('modal-eu-title').textContent = 'Agregar Usuario';
  }

  /* ── Eliminar usuario ── */
  function eliminarUsuario(id) {
    const u = users.find(x => x.id === id);
    AdminModal.confirm(
      `¿Eliminar al usuario "${u?.name}"? Esta acción no se puede deshacer.`,
      () => {
        users = users.filter(x => x.id !== id);
        render();
        AdminToast.show('Usuario eliminado.', 'success');
      }
    );
  }

  /* ── Init ── */
  function init() {
    render();

    // Búsqueda
    document.getElementById('buscar-usuario')?.addEventListener('input', e => {
      searchQ = e.target.value;
      currentPage = 1;
      render();
    });

    // Botón nuevo
    document.getElementById('btn-nuevo-usuario')?.addEventListener('click', nuevoUsuario);

    // Guardar edición
    document.getElementById('btn-guardar-usuario')?.addEventListener('click', guardarEdicion);

    // Exportar
    document.getElementById('btn-exportar-usuarios')?.addEventListener('click', () => {
      exportCSV(users.map(u => ({
        Nombre: u.name, Email: u.email, Username: u.username,
        Departamento: u.dept, Nivel: u.nivel, Estado: u.status,
        Puntos: u.points, 'Puntos Canjeados': u.redeemed
      })), 'usuarios_agropuntos');
    });
  }

  return { init, verUsuario, editUsuario, eliminarUsuario };
})();