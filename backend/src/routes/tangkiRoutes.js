const express = require('express');
const router = express.Router();
const TangkiController = require('../controllers/TangkiController');

router.get('/latest', TangkiController.getLatestFuelData);
router.get('/export', TangkiController.exportFuelData); // Route disiapkan untuk fitur download

module.exports = router;