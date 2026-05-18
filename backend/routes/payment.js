const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.get('/my', authMiddleware, paymentController.getMyPaymentInfo);
router.post('/save', authMiddleware, paymentController.savePaymentInfo);

module.exports = router;
