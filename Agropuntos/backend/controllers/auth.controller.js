/* ============================================
   AUTH CONTROLLER
   Login de miembros y administradores
   ============================================ */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query } = require('../config/db');

/* ── Login de miembro ── */
async function loginMiembro(req, res, next) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo y contraseña son requeridos.'
      });
    }

    // Buscar miembro activo
    const result = await query(
      `SELECT id_miembro, nombre_completo, correo, contrasena,
              puntos_disponibles, puntos_acumulados_total,
              departamento, foto_perfil, estado
       FROM miembros
       WHERE correo = @correo AND estado = 'activo'`,
      { correo }
    );

    if (!result.recordset.length) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas o cuenta inactiva.'
      });
    }

    const miembro = result.recordset[0];

    // Verificar contraseña
    const valida = await bcrypt.compare(contrasena, miembro.contrasena);
    if (!valida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas.'
      });
    }

    // Actualizar último acceso
    await query(
      `UPDATE miembros SET ultimo_acceso = GETDATE() WHERE id_miembro = @id`,
      { id: miembro.id_miembro }
    );

    // Generar token
    const token = jwt.sign(
      {
        id:     miembro.id_miembro,
        correo: miembro.correo,
        nombre: miembro.nombre_completo,
        tipo:   'miembro',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    // Quitar contraseña de la respuesta
    delete miembro.contrasena;

    res.json({
      ok: true,
      mensaje: `Bienvenido, ${miembro.nombre_completo}`,
      token,
      usuario: miembro,
    });

  } catch (err) {
    next(err);
  }
}

/* ── Login de administrador ── */
async function loginAdmin(req, res, next) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo y contraseña son requeridos.'
      });
    }

    const result = await query(
      `SELECT id_admin, nombre, correo, contrasena, rol, estado
       FROM administradores
       WHERE correo = @correo AND estado = 'activo'`,
      { correo }
    );

    if (!result.recordset.length) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas o cuenta inactiva.'
      });
    }

    const admin  = result.recordset[0];
    const valida = await bcrypt.compare(contrasena, admin.contrasena);

    if (!valida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales incorrectas.'
      });
    }

    const token = jwt.sign(
      {
        id:     admin.id_admin,
        correo: admin.correo,
        nombre: admin.nombre,
        rol:    admin.rol,
        tipo:   'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    delete admin.contrasena;

    res.json({
      ok: true,
      mensaje: `Bienvenido, ${admin.nombre}`,
      token,
      admin,
    });

  } catch (err) {
    next(err);
  }
}

/* ── Registrar nuevo miembro (admin) ── */
async function registrarMiembro(req, res, next) {
  try {
    const {
      nombre_completo, carnet, correo, contrasena,
      telefono, departamento
    } = req.body;

    if (!nombre_completo || !carnet || !correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, carnet, correo y contraseña son requeridos.'
      });
    }

    // Verificar duplicados
    const existe = await query(
      `SELECT id_miembro FROM miembros
       WHERE correo = @correo OR carnet = @carnet`,
      { correo, carnet }
    );

    if (existe.recordset.length) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un miembro con ese correo o carnet.'
      });
    }

    // Hash de contraseña
    const hash = await bcrypt.hash(contrasena, 12);

    await query(
      `INSERT INTO miembros
         (nombre_completo, carnet, correo, contrasena, telefono, departamento)
       VALUES
         (@nombre, @carnet, @correo, @hash, @telefono, @departamento)`,
      {
        nombre:       nombre_completo,
        carnet,
        correo,
        hash,
        telefono:     telefono     || null,
        departamento: departamento || null,
      }
    );

    res.status(201).json({
      ok: true,
      mensaje: 'Miembro registrado exitosamente.'
    });

  } catch (err) {
    next(err);
  }
}

/* ── Cambiar contraseña ── */
async function cambiarPassword(req, res, next) {
  try {
    const { contrasena_actual, contrasena_nueva } = req.body;
    const id = req.usuario.id;

    const result = await query(
      `SELECT contrasena FROM miembros WHERE id_miembro = @id`,
      { id }
    );

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    const valida = await bcrypt.compare(
      contrasena_actual,
      result.recordset[0].contrasena
    );

    if (!valida) {
      return res.status(401).json({
        ok: false,
        mensaje: 'La contraseña actual es incorrecta.'
      });
    }

    if (!contrasena_nueva || contrasena_nueva.length < 6) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La nueva contraseña debe tener al menos 6 caracteres.'
      });
    }

    const nuevoHash = await bcrypt.hash(contrasena_nueva, 12);
    await query(
      `UPDATE miembros SET contrasena = @hash WHERE id_miembro = @id`,
      { hash: nuevoHash, id }
    );

    res.json({ ok: true, mensaje: 'Contraseña actualizada exitosamente.' });

  } catch (err) {
    next(err);
  }
}

module.exports = { loginMiembro, loginAdmin, registrarMiembro, cambiarPassword };