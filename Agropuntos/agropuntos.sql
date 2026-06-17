-- =====================================================
-- BASE DE DATOS: Agropuntos
-- Versión MySQL compatible con phpMyAdmin
-- =====================================================

DROP DATABASE IF EXISTS Agropuntos;
CREATE DATABASE Agropuntos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE Agropuntos;

-- =====================================================
-- TABLA: miembros
-- =====================================================
CREATE TABLE miembros (
    id_miembro              INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo         VARCHAR(150) NOT NULL,
    carnet                  VARCHAR(50)  NOT NULL UNIQUE,
    correo                  VARCHAR(100) NOT NULL UNIQUE,
    contrasena              VARCHAR(255) NOT NULL,
    telefono                VARCHAR(20)  NULL,
    foto_perfil             VARCHAR(255) NULL DEFAULT 'assets/default-avatar.png',
    departamento            VARCHAR(100) NULL,

    puntos_disponibles      INT NOT NULL DEFAULT 0,
    puntos_acumulados_total INT NOT NULL DEFAULT 0,

    fecha_registro          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso           DATETIME NULL,

    estado                  VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT CK_miembros_estado
        CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    CONSTRAINT CK_miembros_puntos_disponibles
        CHECK (puntos_disponibles >= 0),
    CONSTRAINT CK_miembros_puntos_acumulados
        CHECK (puntos_acumulados_total >= 0)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: administradores
-- =====================================================
CREATE TABLE administradores (
    id_admin       INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    correo         VARCHAR(100) NOT NULL UNIQUE,
    contrasena     VARCHAR(255) NOT NULL,
    rol            VARCHAR(30) NOT NULL DEFAULT 'admin',
    estado         VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT CK_admin_rol
        CHECK (rol IN ('superadmin', 'admin')),
    CONSTRAINT CK_admin_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: categorias_actividad
-- =====================================================
CREATE TABLE categorias_actividad (
    id_categoria      INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria  VARCHAR(100) NOT NULL,
    descripcion       VARCHAR(255) NULL,
    icono             VARCHAR(10)  NULL,
    estado            VARCHAR(20)  NOT NULL DEFAULT 'activo',

    CONSTRAINT CK_cat_actividad_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: actividades
-- =====================================================
CREATE TABLE actividades (
    id_actividad      INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id      INT NOT NULL,
    nombre_actividad  VARCHAR(150) NOT NULL,
    descripcion       TEXT NULL,
    puntos_otorgados  INT NOT NULL,
    imagen            VARCHAR(255) NULL,
    icono             VARCHAR(10) NULL,
    fecha_creacion    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado            VARCHAR(20) NOT NULL DEFAULT 'activo',

    CONSTRAINT CK_actividades_puntos
        CHECK (puntos_otorgados > 0),
    CONSTRAINT CK_actividades_estado
        CHECK (estado IN ('activo', 'inactivo')),

    CONSTRAINT FK_actividades_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias_actividad(id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: categorias_premio
-- =====================================================
CREATE TABLE categorias_premio (
    id_categoria_premio INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    icono               VARCHAR(10)  NULL,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'activo',

    CONSTRAINT CK_cat_premio_estado
        CHECK (estado IN ('activo', 'inactivo'))
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: premios
-- =====================================================
CREATE TABLE premios (
    id_premio           INT AUTO_INCREMENT PRIMARY KEY,
    categoria_premio_id INT NULL,
    nombre_premio       VARCHAR(150) NOT NULL,
    descripcion         TEXT NULL,
    puntos_requeridos   INT NOT NULL,
    stock               INT NOT NULL DEFAULT 0,
    emoji               VARCHAR(10) NULL,
    imagen              VARCHAR(255) NULL,
    tags                VARCHAR(255) NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'disponible',
    fecha_creacion      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT CK_premios_puntos
        CHECK (puntos_requeridos > 0),
    CONSTRAINT CK_premios_stock
        CHECK (stock >= 0),
    CONSTRAINT CK_premios_estado
        CHECK (estado IN ('disponible', 'limitado', 'agotado', 'inactivo')),

    CONSTRAINT FK_premios_categoria
        FOREIGN KEY (categoria_premio_id)
        REFERENCES categorias_premio(id_categoria_premio)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: solicitudes_canje
-- =====================================================
CREATE TABLE solicitudes_canje (
    id_solicitud              INT AUTO_INCREMENT PRIMARY KEY,
    miembro_id                INT NOT NULL,
    puntos_totales_solicitados INT NOT NULL,
    estado                    VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    puntos_descontados        TINYINT(1) NOT NULL DEFAULT 0,
    fecha_solicitud           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    admin_id                  INT NULL,
    fecha_respuesta           DATETIME NULL,
    observacion               TEXT NULL,

    CONSTRAINT CK_solicitud_puntos
        CHECK (puntos_totales_solicitados > 0),
    CONSTRAINT CK_solicitud_estado
        CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),

    CONSTRAINT FK_solicitud_miembro
        FOREIGN KEY (miembro_id)
        REFERENCES miembros(id_miembro)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_solicitud_admin
        FOREIGN KEY (admin_id)
        REFERENCES administradores(id_admin)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: detalle_canje
-- =====================================================
CREATE TABLE detalle_canje (
    id_detalle       INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id     INT NOT NULL,
    premio_id        INT NOT NULL,
    cantidad         INT NOT NULL DEFAULT 1,
    puntos_unitarios INT NOT NULL,
    puntos_usados    INT NOT NULL,

    CONSTRAINT CK_detalle_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT FK_detalle_solicitud
        FOREIGN KEY (solicitud_id)
        REFERENCES solicitudes_canje(id_solicitud)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT FK_detalle_premio
        FOREIGN KEY (premio_id)
        REFERENCES premios(id_premio)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: movimientos_puntos
-- =====================================================
CREATE TABLE movimientos_puntos (
    id_movimiento    INT AUTO_INCREMENT PRIMARY KEY,
    miembro_id       INT NOT NULL,
    tipo             VARCHAR(30) NOT NULL,
    cantidad         INT NOT NULL,
    saldo_resultante INT NOT NULL,
    actividad_id     INT NULL,
    solicitud_id     INT NULL,
    descripcion      TEXT NULL,
    registrado_por   INT NULL,
    fecha            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT CK_movimiento_tipo
        CHECK (tipo IN ('suma', 'descuento', 'ajuste', 'reversion')),
    CONSTRAINT CK_movimiento_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT FK_movimiento_miembro
        FOREIGN KEY (miembro_id)
        REFERENCES miembros(id_miembro)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT FK_movimiento_actividad
        FOREIGN KEY (actividad_id)
        REFERENCES actividades(id_actividad)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT FK_movimiento_solicitud
        FOREIGN KEY (solicitud_id)
        REFERENCES solicitudes_canje(id_solicitud)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT FK_movimiento_admin
        FOREIGN KEY (registrado_por)
        REFERENCES administradores(id_admin)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: notificaciones
-- =====================================================
CREATE TABLE notificaciones (
    id_notificacion  INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id     INT NULL,
    miembro_id       INT NULL,
    tipo             VARCHAR(30) NOT NULL,
    correo_destino   VARCHAR(100) NOT NULL,
    asunto           VARCHAR(200) NULL,
    contenido        TEXT NULL,
    fecha_envio      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_envio     VARCHAR(20) NOT NULL DEFAULT 'pendiente',

    CONSTRAINT CK_notif_tipo
        CHECK (tipo IN (
            'canje_aprobado',
            'canje_rechazado',
            'canje_pendiente',
            'puntos_ganados',
            'bienvenida',
            'general'
        )),
    CONSTRAINT CK_notif_estado
        CHECK (estado_envio IN ('pendiente', 'enviado', 'fallido')),

    CONSTRAINT FK_notif_solicitud
        FOREIGN KEY (solicitud_id)
        REFERENCES solicitudes_canje(id_solicitud)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT FK_notif_miembro
        FOREIGN KEY (miembro_id)
        REFERENCES miembros(id_miembro)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: mensajes_contacto
-- =====================================================
CREATE TABLE mensajes_contacto (
    id_mensaje      INT AUTO_INCREMENT PRIMARY KEY,
    miembro_id      INT NULL,
    nombre          VARCHAR(150) NOT NULL,
    correo          VARCHAR(100) NOT NULL,
    asunto          VARCHAR(200) NULL,
    mensaje         TEXT NOT NULL,
    leido           TINYINT(1) NOT NULL DEFAULT 0,
    fecha_lectura   DATETIME NULL,
    respondido      TINYINT(1) NOT NULL DEFAULT 0,
    respuesta       TEXT NULL,
    fecha_respuesta DATETIME NULL,
    respondido_por  INT NULL,
    fecha           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT FK_mensaje_miembro
        FOREIGN KEY (miembro_id)
        REFERENCES miembros(id_miembro)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT FK_mensaje_admin
        FOREIGN KEY (respondido_por)
        REFERENCES administradores(id_admin)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IX_miembros_puntos
    ON miembros(puntos_disponibles);

CREATE INDEX IX_movimientos_miembro
    ON movimientos_puntos(miembro_id, fecha);

CREATE INDEX IX_solicitudes_estado
    ON solicitudes_canje(estado, fecha_solicitud);

CREATE INDEX IX_premios_estado
    ON premios(estado, puntos_requeridos);

CREATE INDEX IX_mensajes_leido
    ON mensajes_contacto(leido, fecha);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO administradores (nombre, correo, contrasena, rol)
VALUES ('Administrador', 'admin@agropuntos.gt', 'HASH_AQUI', 'superadmin');

INSERT INTO categorias_actividad (nombre_categoria, icono) VALUES
    ('WhatsApp',    '💬'),
    ('Ventas',      '📈'),
    ('Operaciones', '⚙️'),
    ('Logística',   '🚚'),
    ('RR.HH',       '👥'),
    ('IT',          '💻'),
    ('General',     '⭐');

INSERT INTO categorias_premio (nombre, icono) VALUES
    ('Alimentación', '🍿'),
    ('Beneficios',   '🅿️'),
    ('Consumo',      '🎟️'),
    ('Merchandise',  '🎁'),
    ('Tiempo',       '🌴'),
    ('Educación',    '📚'),
    ('Salud',        '💪');

INSERT INTO premios
    (categoria_premio_id, nombre_premio, descripcion, puntos_requeridos,
     stock, emoji, tags, estado)
VALUES
    (1, 'Snack Pack',        'Paquete de snacks saludables para tu semana laboral.', 150,  10, '🍿', 'Popular,Semanal',   'disponible'),
    (2, 'Parking Premium',    'Estacionamiento premium asignado por 1 mes.',          400,   3, '🅿️', 'Premium,Mensual',   'limitado'),
    (3, 'Tarjeta Libre',      'Tarjeta de consumo en la tienda corporativa.',         350,   8, '🎟️', 'Flexible',          'disponible'),
    (4, 'Combo Corporativo',  'Set exclusivo: mochila, termo, libreta y más.',        600,   5, '🎁', 'Exclusivo,Kit',     'disponible'),
    (5, 'Día Libre',          'Un día de descanso adicional.',                        800,   2, '🌴', 'Premium,Especial',  'limitado'),
    (6, 'Curso Online',       'Acceso a plataforma de cursos por 3 meses.',          500,  15, '📚', 'Desarrollo,3 meses','disponible'),
    (1, 'Almuerzo Especial',  'Almuerzo en restaurante selecto con acompañante.',    300,   6, '🍽️', 'Gourmet',           'disponible'),
    (7, 'Membresía Gym',      'Un mes de acceso al gimnasio corporativo.',           450,  10, '💪', 'Mensual,Bienestar', 'disponible');