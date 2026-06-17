/* ============================================
   ADMIN-DATA.JS - Datos mock del dashboard
   ============================================ */

/* ── Usuarios ── */
const ADMIN_USERS = [
  { id:1,  name:'Ana Torres',    email:'ana@agro.gt',     username:'anatorres',    phone:'5544-2178957', dept:'Ventas',  points:4850, redeemed:500,  nivel:'Premium', status:'activo',   initials:'AT' },
  { id:2,  name:'Carlos Ruiz',   email:'carlos@agro.gt',  username:'carlosruiz',   phone:'5544-2178958', dept:'IT',      points:4620, redeemed:750,  nivel:'Gold',    status:'activo',   initials:'CR' },
  { id:3,  name:'María López',   email:'maria@agro.gt',   username:'marialopez',   phone:'5544-2178959', dept:'Logística',points:4310,redeemed:200,  nivel:'Premium', status:'activo',   initials:'ML' },
  { id:4,  name:'Juan García',   email:'juan@agro.gt',    username:'juangarcia',   phone:'5544-2178960', dept:'Ventas',  points:3980, redeemed:400,  nivel:'Gold',    status:'activo',   initials:'JG' },
  { id:5,  name:'Laura Pérez',   email:'laura@agro.gt',   username:'lauraperez',   phone:'5544-2178961', dept:'RR.HH',   points:3750, redeemed:300,  nivel:'Premium', status:'activo',   initials:'LP' },
  { id:6,  name:'Pedro Sanz',    email:'pedro@agro.gt',   username:'pedrosanz',    phone:'5544-2178962', dept:'Operaciones',points:3200,redeemed:100,nivel:'Silver',  status:'activo',   initials:'PS' },
  { id:7,  name:'Sofía Martín',  email:'sofia@agro.gt',   username:'sofiamartín',  phone:'5544-2178963', dept:'Marketing',points:2800,redeemed:600,  nivel:'Gold',    status:'activo',   initials:'SM' },
  { id:8,  name:'Diego Flores',  email:'diego@agro.gt',   username:'diegoflores',  phone:'5544-2178964', dept:'Logística',points:1100,redeemed:0,    nivel:'Silver',  status:'inactivo', initials:'DF' },
  { id:9,  name:'Valeria Cruz',  email:'valeria@agro.gt', username:'valeriacruz',  phone:'5544-2178965', dept:'Marketing',points:980, redeemed:200,  nivel:'Basic',   status:'activo',   initials:'VC' },
  { id:10, name:'Roberto Soto',  email:'roberto@agro.gt', username:'robertosoto',  phone:'5544-2178966', dept:'Operaciones',points:650,redeemed:0,   nivel:'Basic',   status:'activo',   initials:'RS' },
];

/* ── Tareas ── */
const ADMIN_TASKS = [
  { id:1,  name:'Revisar reportes mensuales',  desc:'Análisis de métricas de ventas',          icon:'📊', iconColor:'ti-blue',   status:'completado', prioridad:'Alta',  fecha:'2024-05-10', puntos:150 },
  { id:2,  name:'Actualizar base de datos',     desc:'Migración de datos a nuevo servidor',     icon:'💾', iconColor:'ti-purple', status:'en-progreso',prioridad:'Alta',  fecha:'2024-05-15', puntos:200 },
  { id:3,  name:'Capacitación del equipo',      desc:'Sesión de formación en nuevas herramientas',icon:'👥',iconColor:'ti-green',status:'pendiente',  prioridad:'Media', fecha:'2024-05-18', puntos:100 },
  { id:4,  name:'Mantenimiento del sistema',    desc:'Optimización y limpieza de archivos',     icon:'⚙️', iconColor:'ti-orange', status:'pendiente',  prioridad:'Baja',  fecha:'2024-05-20', puntos:80  },
  { id:5,  name:'Desarrollar nueva función',    desc:'Implementar sistema de notificaciones',   icon:'🔔', iconColor:'ti-pink',   status:'en-progreso',prioridad:'Alta',  fecha:'2024-05-12', puntos:300 },
  { id:6,  name:'Auditoría de seguridad',       desc:'Revisión de vulnerabilidades del sistema',icon:'🔒', iconColor:'ti-red',    status:'pendiente',  prioridad:'Alta',  fecha:'2024-05-22', puntos:250 },
  { id:7,  name:'Actualizar documentación',     desc:'Revisar y actualizar manuales técnicos',  icon:'📄', iconColor:'ti-yellow', status:'completado', prioridad:'Baja',  fecha:'2024-05-08', puntos:60  },
  { id:8,  name:'Encuesta de satisfacción',     desc:'Enviar y recopilar encuestas del equipo', icon:'📋', iconColor:'ti-blue',   status:'pendiente',  prioridad:'Media', fecha:'2024-05-25', puntos:120 },
];

/* ── Historial ── */
const ADMIN_HISTORY = [
  { id:1,  title:'Nuevo usuario registrado',  desc:'Ana Torres se registró en el sistema',              dot:'dot-blue',   time:'Hace 2 horas',  date:'14 de Mayo, 2024' },
  { id:2,  title:'Tarea completada',          desc:'Carlos Ruiz completó la tarea "Revisar reportes"',  dot:'dot-green',  time:'Hace 3 horas',  date:'14 de Mayo, 2024' },
  { id:3,  title:'Sistema actualizado',       desc:'Actualización del sistema a la versión 2.5.1',      dot:'dot-purple', time:'Hace 5 horas',  date:'14 de Mayo, 2024' },
  { id:4,  title:'Nuevo cupón creado',        desc:'Cupón "VERANO2024" creado con 20% descuento',       dot:'dot-yellow', time:'Hace 8 horas',  date:'14 de Mayo, 2024' },
  { id:5,  title:'Puntos asignados',          desc:'María López recibió 500 puntos por completar encuesta',dot:'dot-green',time:'Hace 12 horas',date:'13 de Mayo, 2024' },
  { id:6,  title:'Usuario eliminado',         desc:'El usuario "testuser123" fue eliminado del sistema', dot:'dot-red',    time:'Hace 1 día',    date:'13 de Mayo, 2024' },
  { id:7,  title:'Configuración modificada',  desc:'Cambios en la configuración de seguridad',           dot:'dot-orange', time:'Hace 1 día',    date:'13 de Mayo, 2024' },
  { id:8,  title:'Reporte generado',          desc:'Reporte mensual de actividad generado exitosamente', dot:'dot-blue',   time:'Hace 2 días',   date:'12 de Mayo, 2024' },
  { id:9,  title:'Cupón canjeado',            desc:'Laura Pérez canjeó "Parking Premium"',               dot:'dot-purple', time:'Hace 2 días',   date:'12 de Mayo, 2024' },
  { id:10, title:'Nuevas tareas creadas',     desc:'Se agregaron 3 nuevas tareas al sistema',            dot:'dot-blue',   time:'Hace 3 días',   date:'11 de Mayo, 2024' },
];

/* ── Cupones admin ── */
const ADMIN_COUPONS = [
  { id:1,  name:'Spotify',     subtitle:'Tarjeta Regalo Spotify',   pts:500,  discount:'25%', desc:'Tarjeta de regalo Spotify por $20 USD.',    logo:null, emoji:'🎵', status:'disponible' },
  { id:2,  name:'Amazon',      subtitle:'Gift Card Amazon',          pts:750,  discount:'15%', desc:'Gift Card Amazon por $30 USD.',             logo:null, emoji:'📦', status:'disponible' },
  { id:3,  name:'Uber Eats',   subtitle:'Crédito Uber Eats',         pts:600,  discount:'30%', desc:'Crédito de $25 en Uber Eats.',              logo:null, emoji:'🛵', status:'disponible' },
  { id:4,  name:'Netflix',     subtitle:'Suscripción Netflix 1 mes', pts:800,  discount:'20%', desc:'Un mes de Netflix en plan estándar.',       logo:null, emoji:'🎬', status:'disponible' },
  { id:5,  name:'Walmart',     subtitle:'Gift Card Walmart',         pts:1000, discount:'50%', desc:'Gift Card Walmart por $50 USD.',            logo:null, emoji:'🛒', status:'disponible' },
  { id:6,  name:'iTunes',      subtitle:'Crédito iTunes',            pts:300,  discount:'10%', desc:'Crédito de $10 en la App Store.',           logo:null, emoji:'🎧', status:'disponible' },
  { id:7,  name:'Google Play', subtitle:'Gift Card Google Play',     pts:450,  discount:'15%', desc:'Gift Card Google Play por $20 USD.',        logo:null, emoji:'▶️', status:'disponible' },
  { id:8,  name:'Starbucks',   subtitle:'Tarjeta Regalo Starbucks',  pts:550,  discount:'25%', desc:'Tarjeta regalo Starbucks por $20 USD.',     logo:null, emoji:'☕', status:'disponible' },
];

/* ── Colores de avatar ── */
const AV_COLORS = [
  '#00A884','#8B0000','#2196F3','#9C27B0',
  '#FF5722','#009688','#FF9800','#607D8B',
];

function getAvColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}