const { Favorite, Album, User, Image } = require('../models');

exports.addFavorite = async (req, res) => {
  try {
    const { album_id } = req.body;
    const user_id = req.user.id;

    if (!album_id) {
      return res.status(400).json({ message: 'Thiếu album_id' });
    }

    const album = await Album.findByPk(album_id);
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    const existing = await Favorite.findOne({
      where: { user_id, album_id }
    });

    if (existing) {
      return res.status(400).json({ message: 'Đã thêm vào yêu thích trước đó' });
    }

    const favorite = await Favorite.create({ user_id, album_id });

    res.status(201).json({
      message: 'Đã thêm vào yêu thích',
      favorite
    });
  } catch (error) {
    console.error('AddFavorite error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { album_id } = req.params;
    const user_id = req.user.id;

    const favorite = await Favorite.findOne({
      where: { user_id, album_id }
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Không tìm thấy trong danh sách yêu thích' });
    }

    await favorite.destroy();

    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (error) {
    console.error('RemoveFavorite error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;

    const favorites = await Favorite.findAll({
      where: { user_id },
      include: [{
        model: Album,
        as: 'album',
        include: [
          { model: User, as: 'createdBy', attributes: ['username'] },
          { model: Image, as: 'images', through: { attributes: [] } }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });

    const albums = favorites.map(f => ({
      ...f.album.toJSON(),
      is_favorited: true
    }));

    res.json({ favorites: albums });
  } catch (error) {
    console.error('GetFavorites error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { album_id } = req.params;
    const user_id = req.user.id;

    const favorite = await Favorite.findOne({
      where: { user_id, album_id }
    });

    res.json({ is_favorite: !!favorite });
  } catch (error) {
    console.error('CheckFavorite error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
