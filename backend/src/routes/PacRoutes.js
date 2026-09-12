const express = require('express');
const router = express.Router();
const pacController = require('../controllers/PacController');

router.get('/', pacController.getPacData);
router.post('/settings', pacController.saveParameters);

module.exports = router;