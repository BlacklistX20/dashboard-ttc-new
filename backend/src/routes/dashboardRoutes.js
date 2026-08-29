const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');

// Route untuk mengambil semua data dashboard
router.get('/', DashboardController.getDashboardData);

module.exports = router;