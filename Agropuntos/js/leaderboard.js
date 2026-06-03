/* ============================================
   LEADERBOARD.JS - Clasificación y podio
   ============================================ */

const LeaderboardManager = (() => {
  let searchQuery = '';

  const AVATAR_COLORS = [
    '#00A884', '#8B0000', '#2196F3', '#9C27B0',
    '#FF5722', '#009688', '#FF9800', '#607D8B',
  ];

  function _avatarColor(initials) {
    return AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
  }

  function _sorted() {
    return [...COLLABORATORS].sort((a, b) => b.points - a.points);
  }

  function _filtered() {
    let list = _sorted();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // ── Actualizar Datos del Navbar Real ──────────

  function updateNavbarPoints() {
    // Busca el contenedor de puntos en el Navbar de tu HTML
    const pointsDisplay = document.querySelector('.user-points-display');
    
    // Si el contenedor existe y el estado de la app tiene al usuario cargado con sus puntos...
    if (pointsDisplay && AppState && AppState.currentUser) {
      const currentPoints = AppState.currentUser.points;
      pointsDisplay.textContent = `${currentPoints.toLocaleString()} pts`;
    }
  }

  // ── Podio ────────────────────────────────────

  function renderPodium() {
    const container = document.getElementById('podium-grid');
    if (!container) return;

    const top3   = _sorted().slice(0, 3);
    const medals = ['🥇', '🥈', '🥉'];

    container.innerHTML = top3.map((c, i) => `
      <div class="podium-card ${i === 0 ? 'first' : ''}"
           style="animation-delay:${i * 0.12}s">
        <span class="podium-medal">${medals[i]}</span>
        <div class="avatar podium-avatar"
             style="background:${_avatarColor(c.initials)}">
          ${c.initials}
        </div>
        <div class="podium-name">${c.name}</div>
        <div class="podium-dept">${c.dept}</div>
        <div class="podium-points">${c.points.toLocaleString()}</div>
        <div class="podium-pts-label">pts</div>
        <div class="podium-tasks">${c.tasks} tareas completadas</div>
      </div>
    `).join('');
  }

  // ── Lista completa ────────────────────────────

  function renderList() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    const all      = _sorted();
    const filtered = _filtered();
    const me       = AppState.currentUser.id;

    if (!filtered.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:44px;color:var(--text-muted)">
          No se encontraron colaboradores.
        </div>`;
      return;
    }

    container.innerHTML = filtered.map((c, idx) => {
      const rank   = all.findIndex(x => x.id === c.id) + 1;
      const isMe   = c.id === me;
      const isTop3 = rank <= 3;
      const delay  = Math.min(idx * 0.04, 0.5);

      return `
        <div class="leaderboard-row ${isMe ? 'current-user' : ''}"
             style="animation-delay:${delay}s">
          <span class="rank-number ${isTop3 ? 'top3' : ''}">#${rank}</span>
          <div class="avatar row-avatar"
               style="background:${_avatarColor(c.initials)}">
            ${c.initials}
          </div>
          <div class="row-info">
            <div class="row-name">
              ${c.name}
              ${isMe
                ? '<span style="font-size:11px;color:var(--logo-red);margin-left:6px;font-weight:700;">(Tú)</span>'
                : ''}
            </div>
            <div class="row-dept">${c.dept}</div>
          </div>
          <div class="row-tasks">${c.tasks} tareas</div>
          <div class="row-points">${c.points.toLocaleString()} pts</div>
        </div>
      `;
    }).join('');
  }

  // ── Búsqueda ─────────────────────────────────

  function _setupSearch() {
    const input = document.getElementById('leaderboard-search');
    if (!input) return;
    input.addEventListener('input', e => {
      searchQuery = e.target.value.trim();
      renderList();
    });
  }

  // ── Init ─────────────────────────────────────

  function init() {
    updateNavbarPoints(); // 🔥 Sobreescribe el "1,250 pts" default de tu HTML por tus puntos reales
    renderPodium();
    renderList();
    _setupSearch();
  }

  return { init };
})();