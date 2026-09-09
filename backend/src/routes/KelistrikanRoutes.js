const express = require('express');
const router = express.Router();
const KelistrikanController = require('../controllers/KelistrikanController');

// Route Realtime
router.get('/', KelistrikanController.getRealtime);

// Route Tren Data Terpisah (Menggunakan parameter query ?range=1h | 1d | 1w)
router.get('/trend/main', KelistrikanController.getTrendMain);
router.get('/trend/rectifiers', KelistrikanController.getTrendRectifiers);
router.get('/trend/ups', KelistrikanController.getTrendUps);

// Route Export Data (Excel / PDF): ?tableType=...&format=excel|pdf&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/export', KelistrikanController.exportData);

module.exports = router;