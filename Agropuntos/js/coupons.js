/* ============================================
   COUPONS.JS - Carrusel de 32 cupones
   ============================================ */

const CouponsManager = (() => {

  /* ── Estado del carrusel ── */
  let activeFilter  = 'all';
  let currentPage   = 0;
  let visibleCards  = 4;      // cuántas tarjetas se ven a la vez
  let filteredList  = [];     // lista filtrada activa
  let totalPages    = 0;
  let autoplayTimer = null;
  let isDragging    = false;
  let dragStartX    = 0;
  let dragCurrentX  = 0;

  /* ── Elementos del DOM ── */
  const $ = id => document.getElementById(id);

  /* ── Calcular cuántas tarjetas caben ── */
  function _calcVisible() {
    const w = window.innerWidth;
    if (w >= 1200) return 4;
    if (w >= 900)  return 3;
    if (w >= 600)  return 2;
    return 1;
  }

  /* ── Filtrar cupones ── */
  function _applyFilter() {
    if (activeFilter === 'all') {
      filteredList = [...COUPONS];
    } else {
      filteredList = COUPONS.filter(c =>
        c.category.toLowerCase() === activeFilter
      );
    }
    totalPages  = Math.ceil(filteredList.length / visibleCards);
    currentPage = 0;
  }

  /* ── HTML de una tarjeta ── */
  function _cardHTML(coupon) {
    const alreadyDone = AppState.redeemedCoupons.includes(coupon.id);
    const enough      = AppState.currentUser.points >= coupon.points;
    const canDo       = !alreadyDone && enough && coupon.status !== 'sold-out';

    const badgeLabel = {
      available: 'Disponible',
      limited:   `Solo ${coupon.stock}`,
      'sold-out':'Agotado',
    }[coupon.status] || 'Disponible';

    const imgHTML = coupon.image
      ? `<img
           src="${coupon.image}"
           alt="${coupon.title}"
           class="coupon-image"
           loading="lazy"
           onerror="this.parentElement.innerHTML='<div class=\\'coupon-image-placeholder\\'><span class=\\'coupon-emoji\\'>${coupon.emoji}</span></div>'"
         >`
      : `<div class="coupon-image-placeholder">
           <span class="coupon-emoji">${coupon.emoji}</span>
           <span class="coupon-image-label">Sin imagen</span>
         </div>`;

    const tagsHTML = coupon.tags.map(t =>
      `<span class="coupon-tag">${t}</span>`
    ).join('');

    let btnClass    = 'btn-redeem';
    let btnText     = '🎁 Canjear';
    let btnDisabled = '';

    if (alreadyDone) {
      btnClass   += ' insufficient';
      btnText     = '✓ Canjeado';
      btnDisabled = 'disabled';
    } else if (coupon.status === 'sold-out') {
      btnClass   += ' insufficient';
      btnText     = '❌ Agotado';
      btnDisabled = 'disabled';
    } else if (!enough) {
      btnClass   += ' insufficient';
      btnText     = '🔒 Sin puntos';
      btnDisabled = 'disabled';
    }

    return `
      <div class="coupon-card" data-id="${coupon.id}">
        <div class="coupon-image-wrapper">
          ${imgHTML}
          <span class="coupon-badge ${coupon.status}">${badgeLabel}</span>
        </div>
        <div class="coupon-body">
          <h3 class="coupon-title">${coupon.title}</h3>
          <p class="coupon-desc">${coupon.description}</p>
          <div class="coupon-tags">${tagsHTML}</div>
          <div class="coupon-footer">
            <div class="coupon-points">
              <span class="coin">🪙</span>
              <span>${coupon.points.toLocaleString()} pts</span>
            </div>
            <button
              class="${btnClass}"
              ${btnDisabled}
              onclick="CouponsManager.openModal(${coupon.id})"
            >${btnText}</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Renderizar el track del carrusel ── */
  function _renderTrack() {
    const track = $('carousel-track');
    if (!track) return;

    if (filteredList.length === 0) {
      // Sin resultados
      const viewport = $('carousel-viewport');
      if (viewport) {
        viewport.innerHTML = `
          <div class="no-results">
            <span class="no-results-emoji">🔍</span>
            <p class="no-results-text">No hay cupones en esta categoría.</p>
          </div>`;
      }
      _updateControls();
      return;
    }

    // Restaurar viewport si tenía mensaje de no-resultados
    const viewport = $('carousel-viewport');
    if (viewport && !viewport.querySelector('#carousel-track')) {
      viewport.innerHTML = `<div class="carousel-track" id="carousel-track"></div>`;
    }

    const freshTrack = $('carousel-track');
    if (!freshTrack) return;

    // Calcular ancho de cada tarjeta
    const gap         = 18;
    const totalGap    = gap * (visibleCards - 1);
    const trackWidth  = freshTrack.parentElement.clientWidth;
    const cardWidth   = Math.floor((trackWidth - totalGap) / visibleCards);

    freshTrack.innerHTML = filteredList.map(_cardHTML).join('');

    // Aplicar ancho a cada tarjeta
    freshTrack.querySelectorAll('.coupon-card').forEach(card => {
      card.style.width    = cardWidth + 'px';
      card.style.minWidth = cardWidth + 'px';
    });

    _goToPage(currentPage, false);
    _renderDots();
    _updateControls();
    _updateCounter();
  }

  /* ── Ir a una página ── */
  function _goToPage(page, animate = true) {
    const track = $('carousel-track');
    if (!track || filteredList.length === 0) return;

    // Limitar rango
    page = Math.max(0, Math.min(page, totalPages - 1));
    currentPage = page;

    const gap         = 18;
    const totalGap    = gap * (visibleCards - 1);
    const trackWidth  = track.parentElement.clientWidth;
    const cardWidth   = Math.floor((trackWidth - totalGap) / visibleCards);
    const offset      = page * visibleCards * (cardWidth + gap);

    track.style.transition = animate
      ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    track.style.transform  = `translateX(-${offset}px)`;

    _updateDots();
    _updateControls();
    _updateCounter();
  }

  /* ── Dots de navegación ── */
  function _renderDots() {
    const container = $('carousel-dots');
    if (!container) return;

    container.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === currentPage ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Página ${i + 1}`);
      dot.addEventListener('click', () => _goToPage(i));
      container.appendChild(dot);
    }
  }

  function _updateDots() {
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPage);
    });
  }

  /* ── Botones prev/next ── */
  function _updateControls() {
    const btnPrev = $('carousel-prev');
    const btnNext = $('carousel-next');

    if (btnPrev) btnPrev.disabled = currentPage === 0;
    if (btnNext) btnNext.disabled = currentPage >= totalPages - 1 || filteredList.length === 0;
  }

  /* ── Contador de cupones ── */
  function _updateCounter() {
    const el = $('carousel-counter');
    if (!el) return;

    if (filteredList.length === 0) {
      el.innerHTML = 'Sin cupones disponibles';
      return;
    }

    const start = currentPage * visibleCards + 1;
    const end   = Math.min(start + visibleCards - 1, filteredList.length);
    el.innerHTML = `Mostrando <strong>${start}–${end}</strong> de <strong>${filteredList.length}</strong> cupones`;
  }

  /* ── Autoplay ── */
  function _startAutoplay() {
    _stopAutoplay();
    if (totalPages <= 1) return;

    autoplayTimer = setInterval(() => {
      if (!document.hidden) {
        const next = currentPage < totalPages - 1 ? currentPage + 1 : 0;
        _goToPage(next);
      }
    }, 5000);
  }

  function _stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  /* ── Swipe táctil y arrastre con mouse ── */
  function _setupDrag() {
    const viewport = $('carousel-viewport');
    if (!viewport) return;

    // Touch
    viewport.addEventListener('touchstart', e => {
      dragStartX   = e.touches[0].clientX;
      dragCurrentX = dragStartX;
      _stopAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchmove', e => {
      dragCurrentX = e.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', () => {
      const diff = dragStartX - dragCurrentX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? _goToPage(currentPage + 1) : _goToPage(currentPage - 1);
      }
      _startAutoplay();
    });

    // Mouse drag
    viewport.addEventListener('mousedown', e => {
      isDragging   = true;
      dragStartX   = e.clientX;
      dragCurrentX = e.clientX;
      viewport.style.cursor = 'grabbing';
      _stopAutoplay();
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      dragCurrentX = e.clientX;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      viewport.style.cursor = '';
      const diff = dragStartX - dragCurrentX;
      if (Math.abs(diff) > 60) {
        diff > 0 ? _goToPage(currentPage + 1) : _goToPage(currentPage - 1);
      }
      _startAutoplay();
    });
  }

  /* ── Teclado ── */
  function _setupKeyboard() {
    document.addEventListener('keydown', e => {
      const section = document.getElementById('cupones');
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') { _goToPage(currentPage + 1); _stopAutoplay(); }
      if (e.key === 'ArrowLeft')  { _goToPage(currentPage - 1); _stopAutoplay(); }
    });
  }

  /* ── Resize ── */
  function _setupResize() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newVisible = _calcVisible();
        if (newVisible !== visibleCards) {
          visibleCards = newVisible;
          _applyFilter();
          _renderTrack();
          _startAutoplay();
        } else {
          // Solo recalcular anchos y posición
          _renderTrack();
        }
      }, 200);
    });
  }

  /* ── Filtros ── */
  function _setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        visibleCards = _calcVisible();
        _applyFilter();
        _renderTrack();
        _startAutoplay();
      });
    });
  }

  /* ── Controles prev/next ── */
  function _setupNavButtons() {
    const btnPrev = $('carousel-prev');
    const btnNext = $('carousel-next');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        _goToPage(currentPage - 1);
        _stopAutoplay();
        setTimeout(_startAutoplay, 8000); // Reiniciar después de interacción
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        _goToPage(currentPage + 1);
        _stopAutoplay();
        setTimeout(_startAutoplay, 8000);
      });
    }
  }

  /* ── Modal ── */
  function openModal(couponId) {
    const coupon = COUPONS.find(c => c.id === couponId);
    if (!coupon) return;

    const pts       = AppState.currentUser.points;
    const remaining = pts - coupon.points;

    const imgHTML = coupon.image
      ? `<img src="${coupon.image}" alt="${coupon.title}" class="redeem-modal-image">`
      : `<div class="redeem-modal-image-placeholder">${coupon.emoji}</div>`;

    $('modal-content').innerHTML = `
      ${imgHTML}
      <h2 class="modal-title">${coupon.title}</h2>
      <p class="modal-desc">${coupon.description}</p>
      <div class="modal-points-summary">
        <div class="modal-points-row">
          <span>Tus puntos actuales</span>
          <span>🪙 ${pts.toLocaleString()} pts</span>
        </div>
        <div class="modal-points-row">
          <span>Costo del canje</span>
          <span>− ${coupon.points.toLocaleString()} pts</span>
        </div>
        <div class="modal-points-row result">
          <span>Puntos restantes</span>
          <span>${remaining.toLocaleString()} pts</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="CouponsManager.closeModal()">
          Cancelar
        </button>
        <button class="btn btn-primary" onclick="CouponsManager.confirmRedeem(${couponId})">
          🎁 Confirmar Canje
        </button>
      </div>
    `;

    $('redeem-modal').classList.add('active');
    _stopAutoplay();
  }

  function closeModal() {
    $('redeem-modal').classList.remove('active');
    _startAutoplay();
  }

  function confirmRedeem(couponId) {
    const coupon = COUPONS.find(c => c.id === couponId);
    if (!coupon) return;

    if (AppState.currentUser.points < coupon.points) {
      ToastManager.show('No tienes suficientes puntos para este canje.', 'error');
      closeModal();
      return;
    }

    AppState.updatePoints(AppState.currentUser.points - coupon.points);
    AppState.redeemedCoupons.push(couponId);
    AppState._save();

    closeModal();
    _renderTrack(); // re-renderizar para actualizar el botón

    ToastManager.show(
      `¡"${coupon.title}" canjeado! El administrador procesará tu solicitud.`,
      'success'
    );
  }

  /* ── Init ── */
  function init() {
    visibleCards = _calcVisible();
    _applyFilter();

    // Esperar a que el DOM esté pintado para medir anchos
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _renderTrack();
        _setupNavButtons();
        _setupFilters();
        _setupDrag();
        _setupKeyboard();
        _setupResize();
        _startAutoplay();
      });
    });

    // Cerrar modal al hacer clic en overlay
    const overlay = $('redeem-modal');
    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
      });
    }

    // Re-renderizar cuando cambien los puntos
    AppState.onPointsChange(() => _renderTrack());
  }

  return { init, openModal, closeModal, confirmRedeem };
})();