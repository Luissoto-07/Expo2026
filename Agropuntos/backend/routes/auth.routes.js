const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { authMiembro, authAdmin } = require('../middleware/auth');

router.post('/miembro/login',    ctrl.loginMiembro);
router.post('/admin/login',      ctrl.loginAdmin);
router.post('/miembro/registro', authAdmin, ctrl.registrarMiembro);
router.put('/cambiar-password',  authMiembro, ctrl.cambiarPassword);

module.exports = router;