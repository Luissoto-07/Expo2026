/* ============================================
   DATA.JS - Estado global y datos de la app
   ============================================ */

const AppState = {
  currentUser: {
    id:       8,
    name:     'Juan Pérez',
    initials: 'JP',
    dept:     'Operaciones',
    points:   1250,
    tasks:    25,
    rank:     8,
  },

  redeemedCoupons: [],
  _listeners: [],

  updatePoints(newPoints) {
    this.currentUser.points = newPoints;
    this._listeners.forEach(fn => fn(newPoints));
    this._save();
  },

  onPointsChange(fn) { this._listeners.push(fn); },

  _save() {
    localStorage.setItem('ap-user',     JSON.stringify(this.currentUser));
    localStorage.setItem('ap-redeemed', JSON.stringify(this.redeemedCoupons));
  },
  _load() {
    const u = localStorage.getItem('ap-user');
    const r = localStorage.getItem('ap-redeemed');
    if (u) this.currentUser     = { ...this.currentUser, ...JSON.parse(u) };
    if (r) this.redeemedCoupons = JSON.parse(r);
  },
};

AppState._load();

/* ── Colaboradores ── */
const COLLABORATORS = [
  { id:  1, name: 'Ana García',      initials: 'AG', dept: 'Ventas',         points: 4850, tasks: 97 },
  { id:  2, name: 'Luis Martínez',   initials: 'LM', dept: 'Logística',      points: 4620, tasks: 93 },
  { id:  3, name: 'María Rodríguez', initials: 'MR', dept: 'Administración', points: 4310, tasks: 86 },
  { id:  4, name: 'Carlos López',    initials: 'CL', dept: 'IT',             points: 3980, tasks: 80 },
  { id:  5, name: 'Sofía Hernández', initials: 'SH', dept: 'RR.HH',         points: 3750, tasks: 75 },
  { id:  6, name: 'Pedro Jiménez',   initials: 'PJ', dept: 'Ventas',         points: 3500, tasks: 70 },
  { id:  7, name: 'Laura Torres',    initials: 'LT', dept: 'Operaciones',    points: 3200, tasks: 64 },
  { id:  8, name: 'Juan Pérez',      initials: 'JP', dept: 'Operaciones',    points: 1250, tasks: 25 },
  { id:  9, name: 'Diego Flores',    initials: 'DF', dept: 'Logística',      points: 1100, tasks: 22 },
  { id: 10, name: 'Valeria Cruz',    initials: 'VC', dept: 'Marketing',      points:  980, tasks: 20 },
  { id: 11, name: 'Andrés Morales',  initials: 'AM', dept: 'Ventas',         points:  850, tasks: 17 },
  { id: 12, name: 'Patricia Ruiz',   initials: 'PR', dept: 'IT',             points:  720, tasks: 14 },
  { id: 13, name: 'Roberto Soto',    initials: 'RS', dept: 'Operaciones',    points:  650, tasks: 13 },
  { id: 14, name: 'Isabella Vega',   initials: 'IV', dept: 'Administración', points:  580, tasks: 12 },
  { id: 15, name: 'Miguel Ángel',    initials: 'MA', dept: 'RR.HH',         points:  490, tasks: 10 },
];

/* ── 32 Cupones ── */
const COUPONS = [
  // ── ALIMENTACIÓN ──────────────────────────────
  {
    id: 1,
    title: 'Snack Pack',
    description: 'Paquete de snacks saludables para tu semana laboral. Incluye frutas, nueces y barras de cereal.',
    emoji: '🍿', image: null,
    points: 150, category: 'Alimentación',
    tags: ['Popular', 'Semanal'], status: 'available', stock: 10,
  },
  {
    id: 2,
    title: 'Almuerzo Especial',
    description: 'Almuerzo en restaurante selecto con un acompañante. Experiencia gastronómica premium.',
    emoji: '🍽️', image: null,
    points: 300, category: 'Alimentación',
    tags: ['Gourmet'], status: 'available', stock: 6,
  },
  {
    id: 3,
    title: 'Desayuno Ejecutivo',
    description: 'Desayuno completo en la cafetería corporativa para ti y un compañero.',
    emoji: '🥐', image: null,
    points: 120, category: 'Alimentación',
    tags: ['Diario'], status: 'available', stock: 20,
  },
  {
    id: 4,
    title: 'Cena Romántica',
    description: 'Cena para dos en restaurante premium seleccionado por la empresa.',
    emoji: '🍷', image: null,
    points: 550, category: 'Alimentación',
    tags: ['Premium', 'Pareja'], status: 'limited', stock: 4,
  },
  {
    id: 5,
    title: 'Canasta Navideña',
    description: 'Canasta con productos especiales para celebrar en familia.',
    emoji: '🧺', image: null,
    points: 400, category: 'Alimentación',
    tags: ['Especial', 'Navidad'], status: 'limited', stock: 5,
  },
  {
    id: 6,
    title: 'Café del Mes',
    description: 'Acceso ilimitado al café de la oficina durante todo el mes.',
    emoji: '☕', image: null,
    points: 80, category: 'Alimentación',
    tags: ['Mensual'], status: 'available', stock: 30,
  },

  // ── BENEFICIOS ────────────────────────────────
  {
    id: 7,
    title: 'Parking Premium',
    description: 'Estacionamiento premium asignado por 1 mes completo. Sin preocupaciones de llegada.',
    emoji: '🅿️', image: null,
    points: 400, category: 'Beneficios',
    tags: ['Premium', 'Mensual'], status: 'limited', stock: 3,
  },
  {
    id: 8,
    title: 'Home Office Week',
    description: 'Una semana completa trabajando desde casa con todos los beneficios.',
    emoji: '🏠', image: null,
    points: 350, category: 'Beneficios',
    tags: ['Remoto', 'Semanal'], status: 'available', stock: 8,
  },
  {
    id: 9,
    title: 'Horario Flexible',
    description: 'Un mes con entrada y salida flexible. Organiza tu día a tu ritmo.',
    emoji: '🕐', image: null,
    points: 500, category: 'Beneficios',
    tags: ['Mensual', 'Bienestar'], status: 'available', stock: 10,
  },
  {
    id: 10,
    title: 'Viernes Corto',
    description: 'Sal dos horas antes los viernes durante un mes completo.',
    emoji: '🎯', image: null,
    points: 280, category: 'Beneficios',
    tags: ['Mensual'], status: 'available', stock: 15,
  },
  {
    id: 11,
    title: 'Lugar VIP en Reuniones',
    description: 'Asiento prioritario y participación especial en reuniones del mes.',
    emoji: '👑', image: null,
    points: 200, category: 'Beneficios',
    tags: ['Reconocimiento'], status: 'available', stock: 5,
  },

  // ── TIEMPO ────────────────────────────────────
  {
    id: 12,
    title: 'Día Libre',
    description: 'Un día de descanso adicional que puedes tomar cuando lo necesites.',
    emoji: '🌴', image: null,
    points: 800, category: 'Tiempo',
    tags: ['Premium', 'Especial'], status: 'limited', stock: 2,
  },
  {
    id: 13,
    title: 'Tarde Libre',
    description: 'Sal a mediodía un día de tu elección este mes.',
    emoji: '🌅', image: null,
    points: 350, category: 'Tiempo',
    tags: ['Flexible'], status: 'available', stock: 10,
  },
  {
    id: 14,
    title: 'Puente Extendido',
    description: 'Convierte un puente en 4 días seguidos de descanso.',
    emoji: '🏖️', image: null,
    points: 1200, category: 'Tiempo',
    tags: ['Premium', 'Exclusivo'], status: 'limited', stock: 2,
  },
  {
    id: 15,
    title: 'Hora de Entrada Late',
    description: 'Llega 2 horas tarde un día de tu elección, sin descuento.',
    emoji: '😴', image: null,
    points: 180, category: 'Tiempo',
    tags: ['Flexible'], status: 'available', stock: 20,
  },

  // ── EDUCACIÓN ─────────────────────────────────
  {
    id: 16,
    title: 'Curso Online',
    description: 'Acceso a plataforma de cursos online por 3 meses. Elige tu área de aprendizaje.',
    emoji: '📚', image: null,
    points: 500, category: 'Educación',
    tags: ['Desarrollo', '3 meses'], status: 'available', stock: 15,
  },
  {
    id: 17,
    title: 'Certificación Pagada',
    description: 'La empresa financia tu certificación profesional de elección.',
    emoji: '🎓', image: null,
    points: 1500, category: 'Educación',
    tags: ['Premium', 'Exclusivo'], status: 'limited', stock: 2,
  },
  {
    id: 18,
    title: 'Taller Presencial',
    description: 'Acceso a taller presencial de habilidades blandas o técnicas.',
    emoji: '🏫', image: null,
    points: 400, category: 'Educación',
    tags: ['Presencial', 'Habilidades'], status: 'available', stock: 8,
  },
  {
    id: 19,
    title: 'Libro a Elección',
    description: 'Recibe el libro de tu elección (hasta Q150) en tu escritorio.',
    emoji: '📖', image: null,
    points: 200, category: 'Educación',
    tags: ['Aprendizaje'], status: 'available', stock: 12,
  },
  {
    id: 20,
    title: 'Suscripción Premium',
    description: 'Un mes de suscripción a plataforma premium (LinkedIn Learning, Coursera, etc.).',
    emoji: '💡', image: null,
    points: 300, category: 'Educación',
    tags: ['Digital', 'Mensual'], status: 'available', stock: 10,
  },

  // ── SALUD ─────────────────────────────────────
  {
    id: 21,
    title: 'Membresía Gym',
    description: 'Un mes de acceso al gimnasio corporativo con todas las instalaciones incluidas.',
    emoji: '💪', image: null,
    points: 450, category: 'Salud',
    tags: ['Mensual', 'Bienestar'], status: 'available', stock: 10,
  },
  {
    id: 22,
    title: 'Sesión de Masaje',
    description: 'Una hora de masaje relajante en el spa corporativo.',
    emoji: '💆', image: null,
    points: 350, category: 'Salud',
    tags: ['Relajación'], status: 'available', stock: 6,
  },
  {
    id: 23,
    title: 'Chequeo Médico',
    description: 'Chequeo médico general completo cubierto por la empresa.',
    emoji: '🏥', image: null,
    points: 600, category: 'Salud',
    tags: ['Preventivo', 'Premium'], status: 'available', stock: 5,
  },
  {
    id: 24,
    title: 'Kit Bienestar',
    description: 'Set de productos de bienestar: vitaminas, aromaterapia y más.',
    emoji: '🌿', image: null,
    points: 250, category: 'Salud',
    tags: ['Kit', 'Natural'], status: 'available', stock: 15,
  },

  // ── MERCHANDISE ───────────────────────────────
  {
    id: 25,
    title: 'Combo Corporativo',
    description: 'Set exclusivo de artículos corporativos: mochila, termo, libreta y más.',
    emoji: '🎁', image: null,
    points: 600, category: 'Merchandise',
    tags: ['Exclusivo', 'Kit'], status: 'available', stock: 5,
  },
  {
    id: 26,
    title: 'Camiseta AgroPuntos',
    description: 'Camiseta exclusiva de edición limitada con el logo de AgroPuntos.',
    emoji: '👕', image: null,
    points: 200, category: 'Merchandise',
    tags: ['Edición Limitada'], status: 'available', stock: 20,
  },
  {
    id: 27,
    title: 'Termo Premium',
    description: 'Termo de acero inoxidable con el logo corporativo. 500ml.',
    emoji: '🫙', image: null,
    points: 280, category: 'Merchandise',
    tags: ['Calidad'], status: 'available', stock: 15,
  },
  {
    id: 28,
    title: 'Mochila Ejecutiva',
    description: 'Mochila anti-robo con compartimento para laptop hasta 15".',
    emoji: '🎒', image: null,
    points: 700, category: 'Merchandise',
    tags: ['Premium', 'Exclusivo'], status: 'limited', stock: 4,
  },

  // ── CONSUMO ───────────────────────────────────
  {
    id: 29,
    title: 'Tarjeta Libre',
    description: 'Tarjeta de consumo en la tienda corporativa. Úsala en lo que necesites.',
    emoji: '🎟️', image: null,
    points: 350, category: 'Consumo',
    tags: ['Flexible'], status: 'available', stock: 8,
  },
  {
    id: 30,
    title: 'Gift Card Q200',
    description: 'Tarjeta de regalo por Q200 para usar en tiendas aliadas.',
    emoji: '💳', image: null,
    points: 450, category: 'Consumo',
    tags: ['Gift Card'], status: 'available', stock: 10,
  },
  {
    id: 31,
    title: 'Gift Card Q500',
    description: 'Tarjeta de regalo por Q500 para usar en tiendas aliadas.',
    emoji: '💰', image: null,
    points: 1000, category: 'Consumo',
    tags: ['Gift Card', 'Premium'], status: 'limited', stock: 3,
  },
  {
    id: 32,
    title: 'Bono Sorpresa',
    description: 'Bono misterioso con un premio especial seleccionado por el admin.',
    emoji: '🎊', image: null,
    points: 900, category: 'Consumo',
    tags: ['Misterio', 'Especial'], status: 'available', stock: 5,
  },
];