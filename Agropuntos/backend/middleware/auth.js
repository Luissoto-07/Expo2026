/* ============================================
   AUTH MIDDLEWARE - Verificar JWT
   ============================================ */

const jwt = require('jsonwebtoken');

// Middleware para rutas de usuario (miembros)
function authMiembro(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token requerido. Acceso denegado.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario   = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token inválido o expirado.'
    });
  }
}

// Middleware para rutas de administrador
function authAdmin(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token de administrador requerido.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tipo !== 'admin') {
      return res.status(403).json({
        ok: false,
        mensaje: 'Acceso solo para administradores.'
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      ok: false,
      mensaje: 'Token de admin inválido o expirado.'
    });
  }
}

// Middleware flexible: acepta miembro O admin
function authAny(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, mensaje: 'Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario   = decoded;
    next();
  } catch {
    return res.status(403).json({ ok: false, mensaje: 'Token inválido.' });
  }
}

module.exports = { authMiembro, authAdmin, authAny };