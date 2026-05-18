const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes
router.use(auth);
router.post('/', depositController.createDeposit);
router.get('/', depositController.getMyDeposits);

// Admin routes
router.get('/admin/all', adminAuth, depositController.getAllDeposits);
router.post('/:id/approve', adminAuth, depositController.approveDeposit);
router.post('/:id/reject', adminAuth, depositController.rejectDeposit);

module.exports = router;
