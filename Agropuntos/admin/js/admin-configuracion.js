/* ============================================
   ADMIN-CONFIGURACION.JS
   ============================================ */

const AdminConfiguracion = (() => {

  function init() {
    // Selector de tema (ya manejado por AdminTheme)
    // Sincronizar opciones al abrir configuración
    document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
      if (item.dataset.page === 'configuracion') {
        item.addEventListener('click', () => {
          setTimeout(() => {
            const current = AdminTheme.get();
            document.querySelectorAll('.theme-option').forEach(el => {
              el.classList.toggle('selected', el.dataset.theme === current);
            });
          }, 50);
        });
      }
    });

    // Actualizar información de contacto
    document.getElementById('btn-actualizar-contacto')?.addEventListener('click', () => {
      const tel  = document.getElementById('cfg-telefono').value.trim();
      const mail = document.getElementById('cfg-email').value.trim();
      const dir  = document.getElementById('cfg-direccion').value.trim();
      if (!tel || !mail) { AdminToast.show('Teléfono y email son obligatorios.', 'warning'); return; }
      AdminToast.show('Información de contacto actualizada.', 'success');
    });

    // Guardar perfil admin
    document.getElementById('btn-guardar-perfil')?.addEventListener('click', () => {
      AdminToast.show('Perfil actualizado correctamente.', 'success');
    });

    // Cambiar contraseña
    document.getElementById('btn-cambiar-pass')?.addEventListener('click', () => {
      const n = document.getElementById('cfg-new-pass').value;
      const c = document.getElementById('cfg-confirm-pass').value;
      if (!n || n.length < 6) { AdminToast.show('La contraseña debe tener al menos 6 caracteres.', 'warning'); return; }
      if (n !== c) { AdminToast.show('Las contraseñas no coinciden.', 'error'); return; }
      AdminToast.show('Contraseña actualizada.', 'success');
      document.getElementById('cfg-new-pass').value     = '';
      document.getElementById('cfg-confirm-pass').value = '';
    });

    // Exportar todos los datos
    document.getElementById('btn-exportar-todo')?.addEventListener('click', () => {
      exportCSV(ADMIN_USERS.map(u => ({
        Nombre: u.name, Email: u.email, Puntos: u.points,
        Canjeados: u.redeemed, Nivel: u.nivel, Estado: u.status,
      })), 'agropuntos_datos_completos');
    });

    // Limpiar historial
    document.getElementById('btn-limpiar-historial')?.addEventListener('click', () => {
      AdminModal.confirm('¿Limpiar todo el historial de actividad?', () => {
        AdminToast.show('Historial limpiado.', 'success');
      });
    });
  }

  return { init };
})();