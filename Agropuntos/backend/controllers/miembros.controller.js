/* ============================================
   MIEMBROS CONTROLLER
   CRUD completo de miembros (admin)
   + perfil propio (miembro)
   ============================================ */

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

/* ── GET todos los miembros (admin) ── */
async function getTodos(req, res, next) {
  try {
    const { buscar = '', estado = '' } = req.query;

    let sql = `
      SELECT
        id_miembro, nombre_completo, carnet, correo,
        telefono, departamento, foto_perfil,
        puntos_disponibles, puntos_acumulados_total,
        estado, fecha_registro, ultimo_acceso
      FROM miembros
      WHERE 1=1
    `;
    const params = {};

    if (buscar) {
      sql += ` AND (nombre_completo LIKE @buscar OR correo LIKE @buscar OR carnet LIKE @buscar OR departamento LIKE @buscar)`;
      params.buscar = `%${buscar}%`;
    }

    if (estado) {
      sql += ` AND estado = @estado`;
      params.estado = estado;
    }

    sql += ` ORDER BY puntos_disponibles DESC`;

    const result = await query(sql, params);
    res.json({ ok: true, total: result.recordset.length, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── GET leaderboard (público) ── */
async function getLeaderboard(req, res, next) {
  try {
    const result = await query(`
      SELECT TOP 50
        id_miembro,
        nombre_completo,
        LEFT(nombre_completo, 1) +
          ISNULL(LEFT(LTRIM(SUBSTRING(nombre_completo,
            CHARINDEX(' ', nombre_completo)+1, 100)), 1), '') AS iniciales,
        departamento,
        puntos_disponibles,
        puntos_acumulados_total,
        (SELECT COUNT(*) FROM movimientos_puntos mp
         WHERE mp.miembro_id = m.id_miembro AND mp.tipo = 'suma') AS tareas_completadas
      FROM miembros m
      WHERE estado = 'activo'
      ORDER BY puntos_disponibles DESC
    `);

    res.json({ ok: true, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── GET miembro por ID ── */
async function getPorId(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        id_miembro, nombre_completo, carnet, correo,
        telefono, departamento, foto_perfil,
        puntos_disponibles, puntos_acumulados_total,
        estado, fecha_registro, ultimo_acceso
      FROM miembros
      WHERE id_miembro = @id
    `, { id: parseInt(id) });

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Miembro no encontrado.' });
    }

    res.json({ ok: true, data: result.recordset[0] });

  } catch (err) {
    next(err);
  }
}

/* ── GET perfil propio (miembro autenticado) ── */
async function getMiPerfil(req, res, next) {
  try {
    const id = req.usuario.id;

    const result = await query(`
      SELECT
        id_miembro, nombre_completo, carnet, correo,
        telefono, departamento, foto_perfil,
        puntos_disponibles, puntos_acumulados_total,
        estado, fecha_registro, ultimo_acceso
      FROM miembros
      WHERE id_miembro = @id
    `, { id });

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Perfil no encontrado.' });
    }

    res.json({ ok: true, data: result.recordset[0] });

  } catch (err) {
    next(err);
  }
}

/* ── PUT actualizar miembro (admin) ── */
async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const {
      nombre_completo, telefono, departamento,
      estado, puntos_disponibles
    } = req.body;

    // Verificar existencia
    const existe = await query(
      `SELECT id_miembro FROM miembros WHERE id_miembro = @id`,
      { id: parseInt(id) }
    );
    if (!existe.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Miembro no encontrado.' });
    }

    await query(`
      UPDATE miembros SET
        nombre_completo    = ISNULL(@nombre, nombre_completo),
        telefono           = ISNULL(@telefono, telefono),
        departamento       = ISNULL(@departamento, departamento),
        estado             = ISNULL(@estado, estado),
        puntos_disponibles = ISNULL(@puntos, puntos_disponibles)
      WHERE id_miembro = @id
    `, {
      nombre:       nombre_completo || null,
      telefono:     telefono        || null,
      departamento: departamento    || null,
      estado:       estado          || null,
      puntos:       puntos_disponibles !== undefined ? parseInt(puntos_disponibles) : null,
      id:           parseInt(id),
    });

    res.json({ ok: true, mensaje: 'Miembro actualizado exitosamente.' });

  } catch (err) {
    next(err);
  }
}

/* ── DELETE eliminar miembro (admin) ── */
async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    // Soft delete: cambiar estado a inactivo
    const result = await query(`
      UPDATE miembros
      SET estado = 'inactivo'
      WHERE id_miembro = @id
    `, { id: parseInt(id) });

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Miembro no encontrado.' });
    }

    res.json({ ok: true, mensaje: 'Miembro desactivado exitosamente.' });

  } catch (err) {
    next(err);
  }
}

/* ── POST ajustar puntos manualmente (admin) ── */
async function ajustarPuntos(req, res, next) {
  try {
    const { id } = req.params;
    const { cantidad, tipo, descripcion } = req.body;
    const adminId = req.admin.id;

    if (!cantidad || !tipo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Cantidad y tipo son requeridos.'
      });
    }

    if (!['suma', 'descuento', 'ajuste'].includes(tipo)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Tipo inválido. Use: suma, descuento, ajuste.'
      });
    }

    const cant = parseInt(cantidad);
    if (cant <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'La cantidad debe ser mayor a 0.'
      });
    }

    // Obtener puntos actuales
    const miembro = await query(
      `SELECT puntos_disponibles, puntos_acumulados_total
       FROM miembros WHERE id_miembro = @id`,
      { id: parseInt(id) }
    );

    if (!miembro.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Miembro no encontrado.' });
    }

    const ptsActuales = miembro.recordset[0].puntos_disponibles;
    let nuevoSaldo;

    if (tipo === 'suma' || tipo === 'ajuste') {
      nuevoSaldo = ptsActuales + cant;
    } else {
      nuevoSaldo = Math.max(0, ptsActuales - cant);
    }

    // Actualizar puntos del miembro
    await query(`
      UPDATE miembros SET
        puntos_disponibles      = @nuevo,
        puntos_acumulados_total = puntos_acumulados_total + CASE WHEN @tipo = 'suma' THEN @cant ELSE 0 END
      WHERE id_miembro = @id
    `, { nuevo: nuevoSaldo, tipo, cant, id: parseInt(id) });

    // Registrar en movimientos_puntos
    await query(`
      INSERT INTO movimientos_puntos
        (miembro_id, tipo, cantidad, saldo_resultante, descripcion, registrado_por)
      VALUES
        (@miembro, @tipo, @cant, @saldo, @desc, @admin)
    `, {
      miembro:  parseInt(id),
      tipo,
      cant,
      saldo:    nuevoSaldo,
      desc:     descripcion || `Ajuste manual por admin`,
      admin:    adminId,
    });

    res.json({
      ok: true,
      mensaje: `Puntos ${tipo === 'suma' ? 'sumados' : 'descontados'} correctamente.`,
      saldo_anterior: ptsActuales,
      saldo_nuevo:    nuevoSaldo,
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTodos, getLeaderboard, getPorId,
  getMiPerfil, actualizar, eliminar, ajustarPuntos
};