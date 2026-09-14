const express = require('express');
const router = express.Router();
const riwayatController = require('../controllers/RiwayatController');

router.get('/', riwayatController.getAll);
// Inject multer middleware sebelum fungsi controller
router.post('/', riwayatController.uploadMiddleware, riwayatController.createData);
router.put('/:id', riwayatController.uploadMiddleware, riwayatController.updateData);
router.delete('/:id', riwayatController.deleteData);

module.exports = router;