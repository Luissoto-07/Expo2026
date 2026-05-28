/* ============================================
   CANJES CONTROLLER
   Solicitudes de canje de premios
   ============================================ */

const { query, sql, getPool } = require('../config/db');

/* ── POST crear solicitud de canje (miembro) ── */
async function crearSolicitud(req, res, next) {
  try {
    const miembroId = req.usuario.id;
    const { premios_ids } = req.body;
    // premios_ids: [{ id_premio: 1, cantidad: 1 }, ...]

    if (!premios_ids || !premios_ids.length) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debes seleccionar al menos un premio.'
      });
    }

    // Obtener puntos del miembro
    const miembro = await query(
      `SELECT puntos_disponibles FROM miembros
       WHERE id_miembro = @id AND estado = 'activo'`,
      { id: miembroId }
    );

    if (!miembro.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Miembro no encontrado.' });
    }

    const ptsDisponibles = miembro.recordset[0].puntos_disponibles;

    // Calcular total de puntos y verificar stock
    let ptsTotal = 0;
    const detalles = [];

    for (const item of premios_ids) {
      const premio = await query(
        `SELECT id_premio, nombre_premio, puntos_requeridos, stock, estado
         FROM premios WHERE id_premio = @id`,
        { id: parseInt(item.id_premio) }
      );

      if (!premio.recordset.length) {
        return res.status(404).json({
          ok: false,
          mensaje: `Premio ID ${item.id_premio} no encontrado.`
        });
      }

      const p    = premio.recordset[0];
      const cant = parseInt(item.cantidad) || 1;

      if (p.estado === 'agotado' || p.estado === 'inactivo') {
        return res.status(400).json({
          ok: false,
          mensaje: `El premio "${p.nombre_premio}" no está disponible.`
        });
      }

      if (p.stock < cant) {
        return res.status(400).json({
          ok: false,
          mensaje: `Stock insuficiente para "${p.nombre_premio}". Disponible: ${p.stock}`
        });
      }

      const ptsPremio = p.puntos_requeridos * cant;
      ptsTotal += ptsPremio;

      detalles.push({
        premio_id:        p.id_premio,
        cantidad:         cant,
        puntos_unitarios: p.puntos_requeridos,
        puntos_usados:    ptsPremio,
      });
    }

    // Verificar que tenga suficientes puntos
    if (ptsDisponibles < ptsTotal) {
      return res.status(400).json({
        ok: false,
        mensaje: `Puntos insuficientes. Necesitas ${ptsTotal} pts, tienes ${ptsDisponibles} pts.`,
        puntos_disponibles: ptsDisponibles,
        puntos_requeridos:  ptsTotal,
      });
    }

    // Usar transacción
    const pool    = await getPool();
    const trans   = new sql.Transaction(pool);
    await trans.begin();

    try {
      const req1 = new sql.Request(trans);
      req1.input('miembro',  sql.Int,     miembroId);
      req1.input('ptsTotal', sql.Int,     ptsTotal);

      const solicitudResult = await req1.query(`
        INSERT INTO solicitudes_canje
          (miembro_id, puntos_totales_solicitados, estado, puntos_descontados)
        OUTPUT INSERTED.id_solicitud
        VALUES (@miembro, @ptsTotal, 'pendiente', 0)
      `);

      const solicitudId = solicitudResult.recordset[0].id_solicitud;

      // Insertar detalles
      for (const d of detalles) {
        const req2 = new sql.Request(trans);
        req2.input('sol',     sql.Int, solicitudId);
        req2.input('premio',  sql.Int, d.premio_id);
        req2.input('cant',    sql.Int, d.cantidad);
        req2.input('unit',    sql.Int, d.puntos_unitarios);
        req2.input('usados',  sql.Int, d.puntos_usados);

        await req2.query(`
          INSERT INTO detalle_canje
            (solicitud_id, premio_id, cantidad, puntos_unitarios, puntos_usados)
          VALUES (@sol, @premio, @cant, @unit, @usados)
        `);

        // Reducir stock
        const req3 = new sql.Request(trans);
        req3.input('cant',   sql.Int, d.cantidad);
        req3.input('premio', sql.Int, d.premio_id);
        await req3.query(`
          UPDATE premios SET stock = stock - @cant WHERE id_premio = @premio
        `);
      }

      // Descontar puntos al miembro
      const nuevoSaldo = ptsDisponibles - ptsTotal;
      const req4 = new sql.Request(trans);
      req4.input('nuevo',   sql.Int, nuevoSaldo);
      req4.input('miembro', sql.Int, miembroId);
      await req4.query(`
        UPDATE miembros SET
          puntos_disponibles = @nuevo,
          puntos_descontados = 1
        WHERE id_miembro = @miembro
      `);

      // Registrar movimiento
      const req5 = new sql.Request(trans);
      req5.input('miembro',   sql.Int,          miembroId);
      req5.input('cant',      sql.Int,          ptsTotal);
      req5.input('saldo',     sql.Int,          nuevoSaldo);
      req5.input('sol',       sql.Int,          solicitudId);
      req5.input('desc',      sql.NVarChar(500), `Canje de ${detalles.length} premio(s)`);
      await req5.query(`
        INSERT INTO movimientos_puntos
          (miembro_id, tipo, cantidad, saldo_resultante, solicitud_id, descripcion)
        VALUES (@miembro, 'descuento', @cant, @saldo, @sol, @desc)
      `);

      // Marcar puntos_descontados en la solicitud
      const req6 = new sql.Request(trans);
      req6.input('sol', sql.Int, solicitudId);
      await req6.query(`
        UPDATE solicitudes_canje SET puntos_descontados = 1 WHERE id_solicitud = @sol
      `);

      await trans.commit();

      res.status(201).json({
        ok: true,
        mensaje: 'Solicitud de canje creada exitosamente. El admin la procesará pronto.',
        id_solicitud:    solicitudId,
        puntos_usados:   ptsTotal,
        puntos_restantes: nuevoSaldo,
      });

    } catch (err) {
      await trans.rollback();
      throw err;
    }

  } catch (err) {
    next(err);
  }
}

/* ── GET solicitudes del miembro autenticado ── */
async function getMisSolicitudes(req, res, next) {
  try {
    const miembroId = req.usuario.id;

    const result = await query(`
      SELECT
        sc.id_solicitud,
        sc.puntos_totales_solicitados,
        sc.estado,
        sc.fecha_solicitud,
        sc.fecha_respuesta,
        sc.observacion,
        a.nombre AS admin_nombre
      FROM solicitudes_canje sc
      LEFT JOIN administradores a ON sc.admin_id = a.id_admin
      WHERE sc.miembro_id = @id
      ORDER BY sc.fecha_solicitud DESC
    `, { id: miembroId });

    // Para cada solicitud, traer el detalle
    const solicitudes = [];
    for (const sol of result.recordset) {
      const det = await query(`
        SELECT
          dc.cantidad,
          dc.puntos_usados,
          p.nombre_premio,
          p.emoji,
          p.imagen
        FROM detalle_canje dc
        JOIN premios p ON dc.premio_id = p.id_premio
        WHERE dc.solicitud_id = @id
      `, { id: sol.id_solicitud });

      solicitudes.push({ ...sol, premios: det.recordset });
    }

    res.json({ ok: true, total: solicitudes.length, data: solicitudes });

  } catch (err) {
    next(err);
  }
}

/* ── GET todas las solicitudes (admin) ── */
async function getTodas(req, res, next) {
  try {
    const { estado = '' } = req.query;

    let sql = `
      SELECT
        sc.id_solicitud,
        sc.puntos_totales_solicitados,
        sc.estado,
        sc.fecha_solicitud,
        sc.fecha_respuesta,
        sc.observacion,
        m.id_miembro,
        m.nombre_completo AS miembro_nombre,
        m.correo          AS miembro_correo,
        m.puntos_disponibles,
        a.nombre          AS admin_nombre
      FROM solicitudes_canje sc
      JOIN miembros m ON sc.miembro_id = m.id_miembro
      LEFT JOIN administradores a ON sc.admin_id = a.id_admin
      WHERE 1=1
    `;
    const params = {};

    if (estado) {
      sql += ` AND sc.estado = @estado`;
      params.estado = estado;
    }

    sql += ` ORDER BY sc.fecha_solicitud DESC`;

    const result = await query(sql, params);
    res.json({ ok: true, total: result.recordset.length, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── PUT gestionar solicitud (admin: aprobar/rechazar) ── */
async function gestionarSolicitud(req, res, next) {
  try {
    const { id }        = req.params;
    const { estado, observacion } = req.body;
    const adminId       = req.admin.id;

    if (!['aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Estado debe ser: aprobado o rechazado.'
      });
    }

    // Obtener solicitud
    const sol = await query(
      `SELECT sc.*, m.puntos_disponibles, m.puntos_acumulados_total
       FROM solicitudes_canje sc
       JOIN miembros m ON sc.miembro_id = m.id_miembro
       WHERE sc.id_solicitud = @id AND sc.estado = 'pendiente'`,
      { id: parseInt(id) }
    );

    if (!sol.recordset.length) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Solicitud no encontrada o ya fue procesada.'
      });
    }

    const solicitud = sol.recordset[0];

    // Si se rechaza, devolver puntos
    if (estado === 'rechazado' && solicitud.puntos_descontados) {
      const nuevoSaldo = solicitud.puntos_disponibles + solicitud.puntos_totales_solicitados;

      await query(`
        UPDATE miembros SET puntos_disponibles = @nuevo
        WHERE id_miembro = @miembro
      `, { nuevo: nuevoSaldo, miembro: solicitud.miembro_id });

      // Registrar reversión
      await query(`
        INSERT INTO movimientos_puntos
          (miembro_id, tipo, cantidad, saldo_resultante, solicitud_id, descripcion, registrado_por)
        VALUES
          (@miembro, 'reversion', @cant, @saldo, @sol, @desc, @admin)
      `, {
        miembro: solicitud.miembro_id,
        cant:    solicitud.puntos_totales_solicitados,
        saldo:   nuevoSaldo,
        sol:     parseInt(id),
        desc:    `Reversión por rechazo de solicitud #${id}`,
        admin:   adminId,
      });

      // Restaurar stock de los premios
      const detalles = await query(
        `SELECT premio_id, cantidad FROM detalle_canje WHERE solicitud_id = @id`,
        { id: parseInt(id) }
      );
      for (const d of detalles.recordset) {
        await query(
          `UPDATE premios SET stock = stock + @cant WHERE id_premio = @premio`,
          { cant: d.cantidad, premio: d.premio_id }
        );
      }
    }

    // Actualizar estado de la solicitud
    await query(`
      UPDATE solicitudes_canje SET
        estado          = @estado,
        admin_id        = @admin,
        fecha_respuesta = GETDATE(),
        observacion     = @obs
      WHERE id_solicitud = @id
    `, {
      estado,
      admin: adminId,
      obs:   observacion || null,
      id:    parseInt(id),
    });

    // Registrar en historial (notificación)
    await query(`
      INSERT INTO notificaciones
        (solicitud_id, miembro_id, tipo, correo_destino, asunto, contenido)
      SELECT
        @sol, m.id_miembro,
        CASE WHEN @estado = 'aprobado' THEN 'canje_aprobado' ELSE 'canje_rechazado' END,
        m.correo,
        CASE WHEN @estado = 'aprobado' THEN 'Tu canje fue aprobado' ELSE 'Tu canje fue rechazado' END,
        @obs
      FROM miembros m
      JOIN solicitudes_canje sc ON sc.miembro_id = m.id_miembro
      WHERE sc.id_solicitud = @sol
    `, { sol: parseInt(id), estado, obs: observacion || '' });

    res.json({
      ok: true,
      mensaje: `Solicitud ${estado} exitosamente.`
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearSolicitud, getMisSolicitudes,
  getTodas, gestionarSolicitud
};