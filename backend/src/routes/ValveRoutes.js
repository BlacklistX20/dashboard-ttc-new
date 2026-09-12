const express = require('express');
const router = express.Router();
const valveController = require('../controllers/ValveController');

// Endpoint untuk mengambil status terbaru semua device
router.get('/states', valveController.getStates);

// Endpoint untuk merubah status simulasi Arduino (Connected/Disconnected)
router.post('/arduino', valveController.toggleArduino);

// Endpoint untuk membuka/menutup Valve
router.post('/valve', valveController.toggleValve);

module.exports = router;