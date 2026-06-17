/* ============================================
   SERVER.JS - Punto de entrada del backend
   ============================================ */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const errorHandler = require('./middleware/errorHandler');
const { getPool }  = require('./config/db');

const app = express();

/* ── CORS: permitir frontend ── */
app.use(cors({
  origin: [
    'http://localhost:5500',     // Live Server
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://localhost:8080',
  ],
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

/* ── Parsers ── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ── Archivos estáticos (imágenes subidas) ── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── Health check ── */
app.get('/api/health', (req, res) => {
  res.json({
    ok:      true,
    mensaje: 'API AgroPuntos funcionando ✅',
    version: '2.0.0',
    fecha:   new Date().toISOString(),
  });
});

/* ── Rutas ── */
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/miembros',  require('./routes/miembros.routes'));
app.use('/api/premios',   require('./routes/premios.routes'));
app.use('/api/canjes',    require('./routes/canjes.routes'));
app.use('/api/tareas',    require('./routes/tareas.routes'));
app.use('/api/historial', require('./routes/historial.routes'));
app.use('/api/contacto',  require('./routes/contacto.routes'));

/* ── 404 ── */
app.use((req, res) => {
  res.status(404).json({
    ok:      false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

/* ── Error handler global ── */
app.use(errorHandler);

/* ── Iniciar servidor ── */
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await getPool(); // Verificar conexión a BD
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor AgroPuntos corriendo en http://localhost:${PORT}`);
      console.log(`📋 API docs: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

startServer();