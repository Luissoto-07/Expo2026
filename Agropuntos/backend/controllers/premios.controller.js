/* ============================================
   PREMIOS CONTROLLER
   Cupones del frontend + gestión admin
   ============================================ */

const { query } = require('../config/db');

/* ── GET todos los premios (público / usuario) ── */
async function getTodos(req, res, next) {
  try {
    const { categoria, estado = 'disponible,limitado' } = req.query;

    const estados = estado.split(',').map(e => `'${e.trim()}'`).join(',');

    let sql = `
      SELECT
        p.id_premio,
        p.nombre_premio,
        p.descripcion,
        p.puntos_requeridos,
        p.stock,
        p.emoji,
        p.imagen,
        p.tags,
        p.estado,
        p.fecha_creacion,
        cp.nombre        AS categoria,
        cp.icono         AS categoria_icono
      FROM premios p
      LEFT JOIN categorias_premio cp
             ON p.categoria_premio_id = cp.id_categoria_premio
      WHERE p.estado IN (${estados})
    `;
    const params = {};

    if (categoria) {
      sql += ` AND cp.nombre = @categoria`;
      params.categoria = categoria;
    }

    sql += ` ORDER BY p.puntos_requeridos ASC`;

    const result = await query(sql, params);

    // Formatear tags como array
    const data = result.recordset.map(p => ({
      ...p,
      tags: p.tags ? p.tags.split(',').map(t => t.trim()) : [],
    }));

    res.json({ ok: true, total: data.length, data });

  } catch (err) {
    next(err);
  }
}

/* ── GET premio por ID ── */
async function getPorId(req, res, next) {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        p.*,
        cp.nombre AS categoria,
        cp.icono  AS categoria_icono
      FROM premios p
      LEFT JOIN categorias_premio cp
             ON p.categoria_premio_id = cp.id_categoria_premio
      WHERE p.id_premio = @id
    `, { id: parseInt(id) });

    if (!result.recordset.length) {
      return res.status(404).json({ ok: false, mensaje: 'Premio no encontrado.' });
    }

    const p = result.recordset[0];
    p.tags  = p.tags ? p.tags.split(',').map(t => t.trim()) : [];

    res.json({ ok: true, data: p });

  } catch (err) {
    next(err);
  }
}

/* ── GET categorías de premios ── */
async function getCategorias(req, res, next) {
  try {
    const result = await query(`
      SELECT id_categoria_premio, nombre, icono
      FROM categorias_premio
      WHERE estado = 'activo'
      ORDER BY nombre
    `);
    res.json({ ok: true, data: result.recordset });
  } catch (err) {
    next(err);
  }
}

/* ── POST crear premio (admin) ── */
async function crear(req, res, next) {
  try {
    const {
      categoria_premio_id, nombre_premio, descripcion,
      puntos_requeridos, stock, emoji, imagen, tags, estado
    } = req.body;

    if (!nombre_premio || !puntos_requeridos) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Nombre y puntos requeridos son obligatorios.'
      });
    }

    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');

    await query(`
      INSERT INTO premios
        (categoria_premio_id, nombre_premio, descripcion,
         puntos_requeridos, stock, emoji, imagen, tags, estado)
      VALUES
        (@cat, @nombre, @desc, @puntos, @stock, @emoji, @imagen, @tags, @estado)
    `, {
      cat:    categoria_premio_id ? parseInt(categoria_premio_id) : null,
      nombre: nombre_premio,
      desc:   descripcion   || null,
      puntos: parseInt(puntos_requeridos),
      stock:  parseInt(stock)  || 0,
      emoji:  emoji   || null,
      imagen: imagen  || null,
      tags:   tagsStr || null,
      estado: estado  || 'disponible',
    });

    res.status(201).json({ ok: true, mensaje: 'Premio creado exitosamente.' });

  } catch (err) {
    next(err);
  }
}

/* ── PUT actualizar premio (admin) ── */
async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const {
      nombre_premio, descripcion, puntos_requeridos,
      stock, emoji, imagen, tags, estado, categoria_premio_id
    } = req.body;

    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || null);

    await query(`
      UPDATE premios SET
        nombre_premio       = ISNULL(@nombre, nombre_premio),
        descripcion         = ISNULL(@desc, descripcion),
        puntos_requeridos   = ISNULL(@puntos, puntos_requeridos),
        stock               = ISNULL(@stock, stock),
        emoji               = ISNULL(@emoji, emoji),
        imagen              = ISNULL(@imagen, imagen),
        tags                = ISNULL(@tags, tags),
        estado              = ISNULL(@estado, estado),
        categoria_premio_id = ISNULL(@cat, categoria_premio_id)
      WHERE id_premio = @id
    `, {
      nombre: nombre_premio || null,
      desc:   descripcion   || null,
      puntos: puntos_requeridos ? parseInt(puntos_requeridos) : null,
      stock:  stock !== undefined ? parseInt(stock) : null,
      emoji:  emoji  || null,
      imagen: imagen || null,
      tags:   tagsStr,
      estado: estado || null,
      cat:    categoria_premio_id ? parseInt(categoria_premio_id) : null,
      id:     parseInt(id),
    });

    res.json({ ok: true, mensaje: 'Premio actualizado exitosamente.' });

  } catch (err) {
    next(err);
  }
}

/* ── DELETE eliminar premio (admin) ── */
async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    await query(
      `UPDATE premios SET estado = 'inactivo' WHERE id_premio = @id`,
      { id: parseInt(id) }
    );

    res.json({ ok: true, mensaje: 'Premio desactivado exitosamente.' });

  } catch (err) {
    next(err);
  }
}

module.exports = { getTodos, getPorId, getCategorias, crear, actualizar, eliminar };