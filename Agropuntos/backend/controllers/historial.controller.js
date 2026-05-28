/* ============================================
   HISTORIAL CONTROLLER
   Movimientos de puntos y actividad general
   ============================================ */

const { query } = require('../config/db');

/* ── GET historial del miembro autenticado ── */
async function getMiHistorial(req, res, next) {
  try {
    const id = req.usuario.id;

    const result = await query(`
      SELECT
        mp.id_movimiento,
        mp.tipo,
        mp.cantidad,
        mp.saldo_resultante,
        mp.descripcion,
        mp.fecha,
        a.nombre_actividad,
        a.icono AS actividad_icono,
        sc.id_solicitud,
        sc.estado AS solicitud_estado
      FROM movimientos_puntos mp
      LEFT JOIN actividades a        ON mp.actividad_id = a.id_actividad
      LEFT JOIN solicitudes_canje sc ON mp.solicitud_id = sc.id_solicitud
      WHERE mp.miembro_id = @id
      ORDER BY mp.fecha DESC
    `, { id });

    res.json({ ok: true, total: result.recordset.length, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── GET historial general (admin) ── */
async function getGeneral(req, res, next) {
  try {
    const { tipo = '', miembro = '' } = req.query;

    let sql = `
      SELECT TOP 100
        mp.id_movimiento,
        mp.tipo,
        mp.cantidad,
        mp.saldo_resultante,
        mp.descripcion,
        mp.fecha,
        m.nombre_completo AS miembro_nombre,
        m.correo          AS miembro_correo,
        a.nombre          AS admin_nombre,
        act.nombre_actividad
      FROM movimientos_puntos mp
      JOIN miembros m ON mp.miembro_id = m.id_miembro
      LEFT JOIN administradores a   ON mp.registrado_por = a.id_admin
      LEFT JOIN actividades act     ON mp.actividad_id   = act.id_actividad
      WHERE 1=1
    `;
    const params = {};

    if (tipo) {
      sql += ` AND mp.tipo = @tipo`;
      params.tipo = tipo;
    }

    if (miembro) {
      sql += ` AND (m.nombre_completo LIKE @miembro OR m.correo LIKE @miembro)`;
      params.miembro = `%${miembro}%`;
    }

    sql += ` ORDER BY mp.fecha DESC`;

    const result = await query(sql, params);
    res.json({ ok: true, total: result.recordset.length, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── GET estadísticas de puntos (admin) ── */
async function getEstadisticas(req, res, next) {
  try {
    const stats = await query(`
      SELECT
        SUM(CASE WHEN tipo = 'suma'      THEN cantidad ELSE 0 END) AS puntos_ganados,
        SUM(CASE WHEN tipo = 'descuento' THEN cantidad ELSE 0 END) AS puntos_usados,
        SUM(CASE WHEN tipo = 'reversion' THEN cantidad ELSE 0 END) AS puntos_revertidos
      FROM movimientos_puntos
    `);

    const totales = await query(`
      SELECT
        SUM(puntos_disponibles)      AS puntos_disponibles_total,
        SUM(puntos_acumulados_total) AS puntos_acumulados_total,
        COUNT(*)                     AS total_miembros
      FROM miembros WHERE estado = 'activo'
    `);

    res.json({
      ok: true,
      data: {
        ...stats.recordset[0],
        ...totales.recordset[0],
      }
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { getMiHistorial, getGeneral, getEstadisticas };