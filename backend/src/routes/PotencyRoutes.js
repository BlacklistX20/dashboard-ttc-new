const express = require('express');
const router = express.Router();
const potencyController = require('../controllers/PotencyController');

// Menyediakan endpoint dinamis berbasis parameter :tableName
router.get('/:tableName', potencyController.getAllData);
router.post('/:tableName', potencyController.createData);

// Membutuhkan parameter id spesifik untuk update dan delete
router.put('/:tableName/:id', potencyController.updateData);
router.delete('/:tableName/:id', potencyController.deleteData);

module.exports = router;