const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/:album_id', favoriteController.removeFavorite);
router.get('/check/:album_id', favoriteController.checkFavorite);

module.exports = router;
