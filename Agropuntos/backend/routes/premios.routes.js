const router = require('express').Router();
const ctrl   = require('../controllers/premios.controller');
const { authAdmin } = require('../middleware/auth');

// Públicas (usuario y admin)
router.get('/',            ctrl.getTodos);
router.get('/categorias',  ctrl.getCategorias);
router.get('/:id',         ctrl.getPorId);

// Solo admin
router.post('/',      authAdmin, ctrl.crear);
router.put('/:id',    authAdmin, ctrl.actualizar);
router.delete('/:id', authAdmin, ctrl.eliminar);

module.exports = router;