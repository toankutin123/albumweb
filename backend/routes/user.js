const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Tất cả routes đều cần auth và quyền admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', userController.getAll);
router.get('/stats', userController.getStats);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

module.exports = router;
