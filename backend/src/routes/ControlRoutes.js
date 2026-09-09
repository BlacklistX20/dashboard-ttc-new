const express = require('express');
const router = express.Router();
const controlController = require('../controllers/ControlController');

// Endpoint untuk mengambil status terbaru semua device
router.get('/states', controlController.getStates);

// Endpoint untuk merubah status simulasi Arduino (Connected/Disconnected)
router.post('/arduino', controlController.toggleArduino);

// Endpoint untuk membuka/menutup Valve
router.post('/valve', controlController.toggleValve);

module.exports = router;