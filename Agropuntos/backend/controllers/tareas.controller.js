/* ============================================
   TAREAS CONTROLLER
   Actividades que generan puntos
   ============================================ */

const { query } = require('../config/db');

/* ── GET todas las tareas (admin) ── */
async function getTodas(req, res, next) {
  try {
    const { estado = '', categoria = '' } = req.query;

    let sql = `
      SELECT
        a.id_actividad,
        a.nombre_actividad,
        a.descripcion,
        a.puntos_otorgados,
        a.icono,
        a.imagen,
        a.estado,
        a.fecha_creacion,
        ca.nombre_categoria AS categoria,
        ca.icono            AS categoria_icono
      FROM actividades a
      LEFT JOIN categorias_actividad ca
             ON a.categoria_id = ca.id_categoria
      WHERE 1=1
    `;
    const params = {};

    if (estado) {
      sql += ` AND a.estado = @estado`;
      params.estado = estado;
    }

    if (categoria) {
      sql += ` AND ca.nombre_categoria = @categoria`;
      params.categoria = categoria;
    }

    sql += ` ORDER BY a.fecha_creacion DESC`;

    const result = await query(sql, params);
    res.json({ ok: true, total: result.recordset.length, data: result.recordset });

  } catch (err) {
    next(err);
  }
}

/* ── POST crear tarea (admin) ── */
async function crear(req, res, next) {
  try {
    const {
      categoria_id, nombre_actividad, descripcion,
      puntos_otorgados, icono, imagen, estado
    } = req.body;

    if (!nombre_actividad || !puntos_otorgados || !categoria_id) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre, categoría y puntos son obligatorios.'
      });
    }

    await query(`
      INSERT INTO actividades
        (categoria_id, nombre_actividad, descripcion,
         puntos_otorgados, icono, imagen, estado)
      VALUES
        (@cat, @nombre, @desc, @puntos, @icono, @imagen, @estado)
    `, {
      cat:    parseInt(categoria_id),
      nombre: nombre_actividad,
      desc:   descripcion || null,
      puntos: parseInt(puntos_otorgados),
      icono:  icono  || null,
      imagen: imagen || null,
      estado: estado || 'activo',
    });

    res.status(201).json({ ok: true, mensaje: 'Tarea creada exitosamente.' });

  } catch (err) {
    next(err);
  }
}

/* ── PUT actualizar tarea (admin) ── */
async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const {
      nombre_actividad, descripcion, puntos_otorgados,
      icono, imagen, estado, categoria_id
    } = req.body;

    await query(`
      UPDATE actividades SET
        nombre_actividad = ISNULL(@nombre, nombre_actividad),
        descripcion      = ISNULL(@desc, descripcion),
        puntos_otorgados = ISNULL(@puntos, puntos_otorgados),
        icono            = ISNULL(@icono, icono),
        imagen           = ISNULL(@imagen, imagen),
        estado           = ISNULL(@estado, estado),
        categoria_id     = ISNULL(@cat, categoria_id)
      WHERE id_actividad = @id
    `, {
      nombre: nombre_actividad || null,
      desc:   descripcion      || null,
      puntos: puntos_otorgados ? parseInt(puntos_otorgados) : null,
      icono:  icono   || null,
      imagen: imagen  || null,
      estado: estado  || null,
      cat:    categoria_id ? parseInt(categoria_id) : null,
      id:     parseInt(id),
    });

    res.json({ ok: true, mensaje: 'Tarea actualizada exitosamente.' });

  } catch (err) {
    next(err);
  }
}

/* ── POST asignar puntos por tarea completada (admin) ── */
async function asignarPuntos(req, res, next) {
  try {
    const { id_actividad } = req.params;
    const { miembro_id }   = req.body;
    const adminId          = req.admin.id;

    // Obtener actividad y miembro
    const [actividad, miembro] = await Promise.all([
      query(
        `SELECT puntos_otorgados, nombre_actividad, estado
         FROM actividades WHERE id_actividad = @id`,
        { id: parseInt(id_actividad) }
      ),
      query(
        `SELECT puntos_disponibles, puntos_acumulados_total
         FROM miembros WHERE id_miembro = @id AND estado = 'activo'`,
        { id: parseInt(miembro_id) }
      ),
    ]);

    if (!actividad.recordset.length || actividad.recordset[0].estado !== 'activo') {
      return res.status(404).json({ ok: false, mensaje: 'Actividad no encontrada o inactiva.' });
    }

    if (!miembro.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Miembro no encontrado.' });
    }

    const pts         = actividad.recordset[0].puntos_otorgados;
    const nombreAct   = actividad.recordset[0].nombre_actividad;
    const ptsActuales = miembro.recordset[0].puntos_disponibles;
    const nuevoSaldo  = ptsActuales + pts;
    const nuevoTotal  = miembro.recordset[0].puntos_acumulados_total + pts;

    // Actualizar puntos del miembro
    await query(`
      UPDATE miembros SET
        puntos_disponibles      = @nuevo,
        puntos_acumulados_total = @total
      WHERE id_miembro = @miembro
    `, {
      nuevo:   nuevoSaldo,
      total:   nuevoTotal,
      miembro: parseInt(miembro_id),
    });

    // Registrar movimiento
    await query(`
      INSERT INTO movimientos_puntos
        (miembro_id, tipo, cantidad, saldo_resultante,
         actividad_id, descripcion, registrado_por)
      VALUES
        (@miembro, 'suma', @pts, @saldo, @act, @desc, @admin)
    `, {
      miembro: parseInt(miembro_id),
      pts,
      saldo:   nuevoSaldo,
      act:     parseInt(id_actividad),
      desc:    `Puntos por completar: ${nombreAct}`,
      admin:   adminId,
    });

    res.json({
      ok:      true,
      mensaje: `Se asignaron ${pts} puntos por "${nombreAct}".`,
      puntos_asignados: pts,
      saldo_nuevo:      nuevoSaldo,
    });

  } catch (err) {
    next(err);
  }
}

/* ── GET categorías de actividad ── */
async function getCategorias(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM categorias_actividad WHERE estado = 'activo' ORDER BY nombre_categoria`
    );
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodas, crear, actualizar, asignarPuntos, getCategorias };