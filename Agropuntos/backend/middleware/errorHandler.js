/* ============================================
   ERROR HANDLER - Manejo global de errores
   ============================================ */

function errorHandler(err, req, res, next) {
  console.error('💥 Error:', err.message);

  // Error de SQL Server
  if (err.code === 'EREQUEST' || err.name === 'RequestError') {
    return res.status(500).json({
      ok: false,
      mensaje: 'Error en la base de datos.',
      detalle: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Error de validación
  if (err.status === 400) {
    return res.status(400).json({ ok: false, mensaje: err.message });
  }

  // Error genérico
  res.status(err.status || 500).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor.',
    detalle: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = errorHandler;