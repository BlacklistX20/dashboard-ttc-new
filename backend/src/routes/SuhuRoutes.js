const express = require('express');
const router = express.Router();
const SuhuController = require('../controllers/SuhuController');

// Route Realtime (data ringkasan per ruangan, dikelompokkan per lantai)
router.get('/', SuhuController.getRealtime);

// Route Detail Ruangan (breakdown per sensor) - dipanggil saat klik tombol Detail
router.get('/detail/:key', SuhuController.getRoomDetail);

// Route Export Data (Excel / PDF): ?room=...&format=excel|pdf&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/export', SuhuController.exportData);

module.exports = router;