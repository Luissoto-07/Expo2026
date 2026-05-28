/* ============================================
   ADMIN-TAREAS.JS - CRUD de tareas
   ============================================ */

const AdminTareas = (() => {
  let tasks     = [...ADMIN_TASKS];
  let editingId = null;

  const statusLabel = { completado:'Completado', 'en-progreso':'En Progreso', pendiente:'Pendiente' };
  const statusBadge = { completado:'badge-success', 'en-progreso':'badge-info', pendiente:'badge-warning' };
  const priorBadge  = { Alta:'prioridad-alta', Media:'prioridad-media', Baja:'prioridad-baja' };

  function render() {
    const tbody = document.getElementById('tareas-tbody');
    if (!tbody) return;

    tbody.innerHTML = tasks.length ? tasks.map(t => `
      <tr>
        <td>
          <div class="task-cell">
            <div class="task-icon ${t.iconColor}">${t.icon}</div>
            <div class="task-cell-info">
              <div class="t-name">${t.name}</div>
              <div class="t-desc">${t.desc}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-dot ${statusBadge[t.status]}">
            ${statusLabel[t.status]}
          </span>
        </td>
        <td><span class="nivel-badge ${priorBadge[t.prioridad]}">${t.prioridad}</span></td>
        <td><span class="date-badge">📅 ${t.fecha}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-a btn-sm btn-info"      onclick="AdminTareas.verTarea(${t.id})">Ver</button>
            <button class="btn-a btn-sm btn-secondary" onclick="AdminTareas.editTarea(${t.id})">Editar</button>
          </div>
        </td>
      </tr>
    `).join('') : `<tr><td colspan="5"><div class="empty-state"><span class="empty-state-icon">✅</span><p class="empty-state-text">No hay tareas.</p></div></td></tr>`;
  }

  function verTarea(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    document.getElementById('ver-tarea-body').innerHTML = `
      <div class="task-modal-icon ${t.iconColor}">${t.icon}</div>
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:18px;font-weight:800;color:var(--a-text)">${t.name}</div>
        <div style="font-size:13px;color:var(--a-text-3);margin-top:4px">${t.desc}</div>
      </div>
      ${[
        ['Estado',    `<span class="badge badge-dot ${statusBadge[t.status]}">${statusLabel[t.status]}</span>`],
        ['Prioridad', `<span class="nivel-badge ${priorBadge[t.prioridad]}">${t.prioridad}</span>`],
        ['Fecha',     t.fecha],
        ['Puntos',    `${t.puntos} pts`],
      ].map(([l,v]) => `<div class="task-detail-row"><span>${l}</span><span>${v}</span></div>`).join('')}`;
    AdminModal.open('modal-ver-tarea');
  }

  function editTarea(id) {
    const t = tasks.find(x => x.id === id);
    editingId = id;
    if (!t) return;
    document.getElementById('et-name').value    = t.name;
    document.getElementById('et-desc').value    = t.desc;
    document.getElementById('et-status').value  = t.status;
    document.getElementById('et-prioridad').value = t.prioridad;
    document.getElementById('et-fecha').value   = t.fecha;
    document.getElementById('et-puntos').value  = t.puntos;
    document.getElementById('modal-et-title').textContent = 'Editar Tarea';
    AdminModal.open('modal-editar-tarea');
  }

  function nuevaTarea() {
    editingId = null;
    document.getElementById('et-form').reset();
    document.getElementById('modal-et-title').textContent = '+ Nueva Tarea';
    AdminModal.open('modal-editar-tarea');
  }

  function guardarTarea() {
    const name     = document.getElementById('et-name').value.trim();
    const desc     = document.getElementById('et-desc').value.trim();
    const status   = document.getElementById('et-status').value;
    const prioridad= document.getElementById('et-prioridad').value;
    const fecha    = document.getElementById('et-fecha').value;
    const puntos   = parseInt(document.getElementById('et-puntos').value) || 0;

    if (!name) { AdminToast.show('El nombre es obligatorio.', 'warning'); return; }

    if (editingId) {
      const t = tasks.find(x => x.id === editingId);
      if (t) Object.assign(t, { name, desc, status, prioridad, fecha, puntos });
      AdminToast.show('Tarea actualizada.', 'success');
    } else {
      tasks.push({
        id: Date.now(), name, desc, status, prioridad, fecha, puntos,
        icon: '📋', iconColor: 'ti-blue',
      });
      AdminToast.show('Tarea creada.', 'success');
    }

    render();
    AdminModal.close('modal-editar-tarea');
    editingId = null;
  }

  function init() {
    render();
    document.getElementById('btn-nueva-tarea')?.addEventListener('click', nuevaTarea);
    document.getElementById('btn-guardar-tarea')?.addEventListener('click', guardarTarea);
    document.getElementById('btn-exportar-tareas')?.addEventListener('click', () => {
      exportCSV(tasks.map(t => ({
        Nombre: t.name, Descripción: t.desc,
        Estado: t.status, Prioridad: t.prioridad,
        Fecha: t.fecha, Puntos: t.puntos,
      })), 'tareas_agropuntos');
    });
  }

  return { init, verTarea, editTarea };
})();