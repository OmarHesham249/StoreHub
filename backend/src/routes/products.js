const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

// Stats must come before /:id to avoid route conflict
router.get('/stats', ctrl.getStats);
router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getById);
router.post('/',     ctrl.create);
router.put('/:id',   ctrl.update);
router.delete('/:id',ctrl.remove);

module.exports = router;
