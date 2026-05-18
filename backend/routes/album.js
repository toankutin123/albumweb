const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', albumController.getAllAlbums);
router.get('/:id', albumController.getAlbumById);

// Protected routes
router.post('/', authMiddleware, albumController.createAlbum);
router.put('/:id', authMiddleware, albumController.updateAlbum);
router.delete('/:id', authMiddleware, albumController.deleteAlbum);
router.get('/my/albums', authMiddleware, albumController.getMyAlbums);

// Image management in album
router.post('/:id/images', authMiddleware, albumController.addImagesToAlbum);
router.delete('/:id/images/:imageId', authMiddleware, albumController.removeImageFromAlbum);

// Purchase album
router.post('/:id/purchase', authMiddleware, albumController.purchaseAlbum);
router.get('/:id/check-purchased', authMiddleware, albumController.checkPurchased);

module.exports = router;
