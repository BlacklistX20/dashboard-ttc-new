const express = require('express');
const router = express.Router();
const SuhuController = require('../controllers/SuhuController');

// Route Realtime (data ringkasan + breakdown sensor, dikelompokkan per lantai)
router.get('/', SuhuController.getRealtime);

// Route Export Data (Excel / PDF): ?room=...&format=excel|pdf&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/export', SuhuController.exportData);

module.exports = router;