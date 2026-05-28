/* ============================================
   CONTACTO CONTROLLER
   Mensajes del formulario de contacto
   ============================================ */

const { query } = require('../config/db');

/* ── POST enviar mensaje (público) ── */
async function enviar(req, res, next) {
  try {
    const { nombre, correo, asunto, mensaje } = req.body;
    const miembroId = req.usuario?.id || null;

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, correo y mensaje son obligatorios.'
      });
    }

    await query(`
      INSERT INTO mensajes_contacto
        (miembro_id, nombre, correo, asunto, mensaje)
      VALUES
        (@miembro, @nombre, @correo, @asunto, @mensaje)
    `, {
      miembro: miembroId,
      nombre,
      correo,
      asunto:  asunto || null,
      mensaje,
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Mensaje enviado correctamente. Te responderemos pronto.'
    });

  } catch (err) {
    next(err);
  }
}

/* ── GET todos los mensajes (admin) ── */
async function getTodos(req, res, next) {
  try {
    const { leido = '' } = req.query;

    let sql = `
      SELECT
        mc.id_mensaje,
        mc.nombre,
        mc.correo,
        mc.asunto,
        mc.mensaje,
        mc.leido,
        mc.fecha_lectura,
        mc.respondido,
        mc.respuesta,
        mc.fecha_respuesta,
        mc.fecha,
        m.nombre_completo AS miembro_nombre,
        a.nombre          AS respondido_por_nombre
      FROM mensajes_contacto mc
      LEFT JOIN miembros        m ON mc.miembro_id     = m.id_miembro
      LEFT JOIN administradores a ON mc.respondido_por = a.id_admin
      WHERE 1=1
    `;
    const params = {};

    if (leido !== '') {
      sql += ` AND mc.leido = @leido`;
      params.leido = leido === '1' || leido === 'true' ? 1 : 0;
    }

    sql += ` ORDER BY mc.fecha DESC`;

    const result = await query(sql, params);
    res.json({ ok: true, total: result.recordset.length, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── PUT marcar como leído y responder (admin) ── */
async function responder(req, res, next) {
  try {
    const { id }       = req.params;
    const { respuesta } = req.body;
    const adminId      = req.admin.id;

    await query(`
      UPDATE mensajes_contacto SET
        leido           = 1,
        fecha_lectura   = GETDATE(),
        respondido      = 1,
        respuesta       = @respuesta,
        fecha_respuesta = GETDATE(),
        respondido_por  = @admin
      WHERE id_mensaje = @id
    `, { respuesta: respuesta || null, admin: adminId, id: parseInt(id) });

    res.json({ ok: true, mensaje: 'Mensaje marcado como respondido.' });

  } catch (err) {
    next(err);
  }
}

module.exports = { enviar, getTodos, responder };