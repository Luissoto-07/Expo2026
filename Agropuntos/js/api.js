/* ============================================
   API.JS - Cliente HTTP para el frontend
   Coloca este archivo en la raíz del frontend
   ============================================ */

const API = (() => {
  const BASE = 'http://localhost:3000/api';

  /* ── Helper base ── */
  async function _fetch(endpoint, options = {}) {
    const token = localStorage.getItem('ap-token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const res  = await fetch(`${BASE}${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || `Error ${res.status}`);
    }

    return data;
  }

  const get    = (url, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return _fetch(`${url}${qs ? '?' + qs : ''}`);
  };
  const post   = (url, body)  => _fetch(url, { method: 'POST',   body });
  const put    = (url, body)  => _fetch(url, { method: 'PUT',    body });
  const del    = (url)        => _fetch(url, { method: 'DELETE' });

  /* ── Auth ── */
  const auth = {
    loginMiembro:  body => post('/auth/miembro/login', body),
    loginAdmin:    body => post('/auth/admin/login', body),
    cambiarPass:   body => put('/auth/cambiar-password', body),
  };

  /* ── Miembros ── */
  const miembros = {
    leaderboard: ()       => get('/miembros/leaderboard'),
    miPerfil:    ()       => get('/miembros/mi-perfil'),
    todos:       params   => get('/miembros', params),
    porId:       id       => get(`/miembros/${id}`),
    actualizar:  (id, b)  => put(`/miembros/${id}`, b),
    eliminar:    id       => del(`/miembros/${id}`),
    ajustarPts:  (id, b)  => post(`/miembros/${id}/ajustar-puntos`, b),
  };

  /* ── Premios / Cupones ── */
  const premios = {
    todos:       params  => get('/premios', params),
    porId:       id      => get(`/premios/${id}`),
    categorias:  ()      => get('/premios/categorias'),
    crear:       body    => post('/premios', body),
    actualizar:  (id, b) => put(`/premios/${id}`, b),
    eliminar:    id      => del(`/premios/${id}`),
  };

  /* ── Canjes ── */
  const canjes = {
    crear:         body   => post('/canjes', body),
    misSolicitudes:()     => get('/canjes/mis'),
    todos:         params => get('/canjes', params),
    gestionar:     (id,b) => put(`/canjes/${id}`, b),
  };

  /* ── Tareas ── */
  const tareas = {
    todas:       params       => get('/tareas', params),
    categorias:  ()           => get('/tareas/categorias'),
    crear:       body         => post('/tareas', body),
    actualizar:  (id, b)      => put(`/tareas/${id}`, b),
    asignarPts:  (actId, b)   => post(`/tareas/${actId}/asignar-puntos`, b),
  };

  /* ── Historial ── */
  const historial = {
    miHistorial:   ()      => get('/historial/mi-historial'),
    general:       params  => get('/historial', params),
    estadisticas:  ()      => get('/historial/estadisticas'),
  };

  /* ── Contacto ── */
  const contacto = {
    enviar:   body     => post('/contacto', body),
    todos:    params   => get('/contacto', params),
    responder:(id, b)  => put(`/contacto/${id}`, b),
  };

  /* ── Helpers de sesión ── */
  function guardarSesion(token, usuario) {
    localStorage.setItem('ap-token',   token);
    localStorage.setItem('ap-user',    JSON.stringify(usuario));
  }

  function cerrarSesion() {
    localStorage.removeItem('ap-token');
    localStorage.removeItem('ap-user');
    localStorage.removeItem('ap-redeemed');
  }

  function usuarioActual() {
    const u = localStorage.getItem('ap-user');
    return u ? JSON.parse(u) : null;
  }

  function estaAutenticado() {
    return !!localStorage.getItem('ap-token');
  }

  return {
    auth, miembros, premios, canjes,
    tareas, historial, contacto,
    guardarSesion, cerrarSesion,
    usuarioActual, estaAutenticado,
  };
})();