const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// User routes
router.use(auth);
router.post('/', withdrawalController.createWithdrawal);
router.get('/', withdrawalController.getMyWithdrawals);

// Admin routes
router.get('/admin/all', adminAuth, withdrawalController.getAllWithdrawals);
router.post('/:id/approve', adminAuth, withdrawalController.approveWithdrawal);
router.post('/:id/reject', adminAuth, withdrawalController.rejectWithdrawal);

module.exports = router;
