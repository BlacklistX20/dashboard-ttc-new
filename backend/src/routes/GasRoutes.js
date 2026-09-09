const express = require('express');
const router = express.Router();
const GasController = require('../controllers/GasController');

router.get('/', GasController.getLatestGasData);
router.get('/alerts', GasController.getAlerts);
router.get('/trend', GasController.getTrend);
router.get('/export', GasController.exportData);

module.exports = router;