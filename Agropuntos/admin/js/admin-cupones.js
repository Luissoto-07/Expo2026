/* ============================================
   ADMIN-CUPONES.JS - Gestión de cupones
   ============================================ */

const AdminCupones = (() => {
  let coupons   = [...ADMIN_COUPONS];
  let editingId = null;
  let tempImgUrl = null;

  function _logoHTML(c, size = 62) {
    return c.logo
      ? `<div class="cupon-logo" style="width:${size}px;height:${size}px">
           <img src="${c.logo}" alt="${c.name}" onerror="this.parentElement.innerHTML='<span class=cupon-logo-emoji>${c.emoji}</span>'">
         </div>`
      : `<div class="cupon-logo" style="width:${size}px;height:${size}px;background:var(--a-input)">
           <span class="cupon-logo-emoji">${c.emoji}</span>
         </div>`;
  }

  function render() {
    const grid = document.getElementById('cupones-grid-admin');
    if (!grid) return;

    grid.innerHTML = coupons.length ? coupons.map(c => `
      <div class="cupon-card-admin">
        <span class="cupon-pts-badge">${c.pts} pts</span>
        ${_logoHTML(c)}
        <div class="cupon-name">${c.name}</div>
        <div class="cupon-discount">${c.discount}</div>
        <div class="cupon-actions">
          <button class="btn-a btn-primary btn-sm" style="flex:1"
            onclick="AdminCupones.verCupon(${c.id})">Ver detalles</button>
          <button class="btn-a btn-secondary btn-sm"
            onclick="AdminCupones.editCupon(${c.id})">✏️</button>
        </div>
      </div>
    `).join('') : `<div class="empty-state" style="grid-column:1/-1">
      <span class="empty-state-icon">🎁</span>
      <p class="empty-state-text">No hay cupones creados.</p>
    </div>`;
  }

  function verCupon(id) {
    const c = coupons.find(x => x.id === id);
    if (!c) return;
    document.getElementById('detalle-cupon-body').innerHTML = `
      <span class="badge badge-success" style="margin-bottom:12px;display:inline-block">Disponible</span>
      <div class="cupon-modal-logo">
        ${c.logo
          ? `<img src="${c.logo}" alt="${c.name}">`
          : `<span class="cupon-modal-logo-emoji">${c.emoji}</span>`}
      </div>
      <div class="cupon-modal-name">${c.name}</div>
      <div class="cupon-modal-subtitle">${c.subtitle}</div>
      <div class="cupon-modal-pts">🏆 ${c.pts} pts</div>
      <div class="cupon-modal-desc">${c.desc}</div>
    `;
    document.getElementById('btn-detalle-editar').onclick  = () => { AdminModal.close('modal-detalle-cupon'); editCupon(id); };
    document.getElementById('btn-detalle-eliminar').onclick = () => { AdminModal.close('modal-detalle-cupon'); eliminarCupon(id); };
    AdminModal.open('modal-detalle-cupon');
  }

  function editCupon(id) {
    const c = coupons.find(x => x.id === id);
    editingId = id;
    tempImgUrl = c?.logo || null;
    if (!c) return;
    document.getElementById('ec-name').value     = c.name;
    document.getElementById('ec-subtitle').value = c.subtitle;
    document.getElementById('ec-pts').value      = c.pts;
    document.getElementById('ec-discount').value = c.discount;
    document.getElementById('ec-desc').value     = c.desc;
    document.getElementById('ec-emoji').value    = c.emoji;
    document.getElementById('ec-status').value   = c.status;
    document.getElementById('modal-ec-title').textContent = 'Editar Cupón';
    _updateImgPreview();
    AdminModal.open('modal-editar-cupon');
  }

  function nuevoCupon() {
    editingId  = null;
    tempImgUrl = null;
    document.getElementById('ec-form').reset();
    document.getElementById('modal-ec-title').textContent = '+ Nuevo Cupón';
    _updateImgPreview();
    AdminModal.open('modal-editar-cupon');
  }

  function guardarCupon() {
    const name     = document.getElementById('ec-name').value.trim();
    const subtitle = document.getElementById('ec-subtitle').value.trim();
    const pts      = parseInt(document.getElementById('ec-pts').value) || 0;
    const discount = document.getElementById('ec-discount').value.trim();
    const desc     = document.getElementById('ec-desc').value.trim();
    const emoji    = document.getElementById('ec-emoji').value.trim() || '🎁';
    const status   = document.getElementById('ec-status').value;

    if (!name || !pts) { AdminToast.show('Nombre y puntos son obligatorios.', 'warning'); return; }

    if (editingId) {
      const c = coupons.find(x => x.id === editingId);
      if (c) Object.assign(c, { name, subtitle, pts, discount, desc, emoji, status, logo: tempImgUrl });
      AdminToast.show('Cupón actualizado.', 'success');
    } else {
      coupons.push({ id: Date.now(), name, subtitle, pts, discount, desc, emoji, status, logo: tempImgUrl });
      AdminToast.show('Cupón creado.', 'success');
    }

    render();
    AdminModal.close('modal-editar-cupon');
    editingId = null;
  }

  function eliminarCupon(id) {
    const c = coupons.find(x => x.id === id);
    AdminModal.confirm(`¿Eliminar el cupón "${c?.name}"?`, () => {
      coupons = coupons.filter(x => x.id !== id);
      render();
      AdminToast.show('Cupón eliminado.', 'success');
    });
  }

  function _updateImgPreview() {
    const prev = document.getElementById('img-preview');
    if (!prev) return;
    if (tempImgUrl) {
      prev.innerHTML = `<img src="${tempImgUrl}" class="img-preview" alt="preview">
                        <div style="font-size:12px;color:var(--a-accent);margin-top:4px">✔ Imagen cargada</div>`;
    } else {
      prev.innerHTML = `<div style="font-size:13px;color:var(--a-text-3)">📷 Click para subir imagen</div>`;
    }
  }

  function init() {
    render();

    document.getElementById('btn-nuevo-cupon')?.addEventListener('click', nuevoCupon);
    document.getElementById('btn-guardar-cupon')?.addEventListener('click', guardarCupon);

    // Upload de imagen
    const uploadArea = document.getElementById('img-upload-area');
    const fileInput  = document.getElementById('ec-img-file');

    uploadArea?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { AdminToast.show('Solo se permiten imágenes.', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = ev => { tempImgUrl = ev.target.result; _updateImgPreview(); };
      reader.readAsDataURL(file);
    });

    // Drag & drop
    uploadArea?.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--a-accent)'; });
    uploadArea?.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
    uploadArea?.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => { tempImgUrl = ev.target.result; _updateImgPreview(); };
        reader.readAsDataURL(file);
      }
    });
  }

  return { init, verCupon, editCupon };
})();