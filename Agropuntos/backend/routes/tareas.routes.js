const router = require('express').Router();
const ctrl   = require('../controllers/tareas.controller');
const { authAdmin } = require('../middleware/auth');

router.get('/categorias',                   ctrl.getCategorias);
router.get('/',                             authAdmin, ctrl.getTodas);
router.post('/',                            authAdmin, ctrl.crear);
router.put('/:id',                          authAdmin, ctrl.actualizar);
router.post('/:id_actividad/asignar-puntos', authAdmin, ctrl.asignarPuntos);

module.exports = router;