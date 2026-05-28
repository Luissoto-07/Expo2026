const router = require('express').Router();
const ctrl   = require('../controllers/miembros.controller');
const { authMiembro, authAdmin } = require('../middleware/auth');

// Públicas
router.get('/leaderboard', ctrl.getLeaderboard);

// Miembro autenticado
router.get('/mi-perfil', authMiembro, ctrl.getMiPerfil);

// Admin
router.get('/',                     authAdmin, ctrl.getTodos);
router.get('/:id',                  authAdmin, ctrl.getPorId);
router.put('/:id',                  authAdmin, ctrl.actualizar);
router.delete('/:id',               authAdmin, ctrl.eliminar);
router.post('/:id/ajustar-puntos',  authAdmin, ctrl.ajustarPuntos);

module.exports = router;