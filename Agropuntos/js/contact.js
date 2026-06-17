/* ============================================
   CONTACT.JS - Validación y envío del formulario
   ============================================ */

const ContactManager = (() => {

  function _validateField(field) {
    const val      = field.value.trim();
    const errorEl  = field.parentElement.querySelector('.form-error-msg');
    let valid      = true;
    let msg        = '';

    if (field.required && !val) {
      valid = false;
      msg   = 'Este campo es obligatorio.';
    } else if (field.type === 'email' && val) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        valid = false;
        msg   = 'Ingresa un correo electrónico válido.';
      }
    }

    field.classList.toggle('error', !valid);
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.toggle('visible', !valid);
    }

    return valid;
  }

  function _prefill() {
    const nameEl = document.getElementById('contact-name');
    if (nameEl && AppState.currentUser.name) {
      nameEl.value = AppState.currentUser.name;
    }
  }

  function _handleSubmit(e) {
    e.preventDefault();
    const form   = e.target;
    const fields = form.querySelectorAll('[required]');
    let allOk    = true;

    fields.forEach(f => { if (!_validateField(f)) allOk = false; });

    if (!allOk) {
      ToastManager.show('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    const btn  = form.querySelector('.btn-send');
    const orig = btn.innerHTML;
    btn.innerHTML = '⏳ Enviando...';
    btn.disabled  = true;

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled  = false;
      form.reset();
      _prefill();
      ToastManager.show(
        '¡Mensaje enviado correctamente! El administrador te responderá pronto.',
        'success'
      );
    }, 1500);
  }

  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    _prefill();
    form.addEventListener('submit', _handleSubmit);

    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('blur',  () => _validateField(f));
      f.addEventListener('input', () => { if (f.classList.contains('error')) _validateField(f); });
    });
  }

  return { init };
})();