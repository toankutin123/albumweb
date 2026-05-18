const { Album, Image, AlbumImage, User, Favorite, PurchasedAlbum } = require('../models');

exports.createAlbum = async (req, res) => {
  try {
    const { title, description, coverImage, genre, isPremium, price, imageUrls } = req.body;
    const createdById = req.user?.id;

    if (!title || !coverImage) {
      return res.status(400).json({ message: 'Tiêu đề và ảnh bìa là bắt buộc' });
    }

    const album = await Album.create({
      title,
      description: description || '',
      coverImage,
      genre: genre || '',
      isPremium: isPremium || false,
      price: price || 0,
      createdById
    });

    // Add images to album if provided
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      // Filter out duplicate URLs
      const uniqueUrls = [...new Set(imageUrls)];
      
      for (const url of uniqueUrls) {
        // Create image if not exists
        let image = await Image.findOne({ where: { url } });
        if (!image) {
          image = await Image.create({ url, caption: '' });
        }
        
        // Check if already linked
        const existingLink = await AlbumImage.findOne({
          where: { albumId: album.id, imageId: image.id }
        });
        
        // Only link if not already linked
        if (!existingLink) {
          await AlbumImage.create({
            albumId: album.id,
            imageId: image.id
          });
        }
      }
    }

    res.status(201).json({
      message: 'Tạo album thành công',
      album
    });
  } catch (error) {
    console.error('CreateAlbum error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getAllAlbums = async (req, res) => {
  try {
    const { genre, premium, search } = req.query;

    const where = {};
    if (genre) where.genre = genre;
    if (premium !== undefined) where.isPremium = premium === 'true';
    if (search) {
      where.title = { [require('sequelize').Op.iLike]: `%${search}%` };
    }

    const albums = await Album.findAll({
      where,
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'username'] },
        { model: Image, as: 'images', through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ albums });
  } catch (error) {
    console.error('GetAllAlbums error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findByPk(id, {
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'username'] },
        { model: Image, as: 'images', through: { attributes: [] } }
      ]
    });

    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Increment view count
    album.viewCount += 1;
    await album.save();

    res.json({ album });
  } catch (error) {
    console.error('GetAlbumById error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, coverImage, genre, isPremium } = req.body;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Check permission (only creator or admin can update)
    const user = await User.findByPk(req.user.id);
    if (album.createdById !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa album này' });
    }

    if (title) album.title = title;
    if (description !== undefined) album.description = description;
    if (coverImage) album.coverImage = coverImage;
    if (genre !== undefined) album.genre = genre;
    if (isPremium !== undefined) album.isPremium = isPremium;

    await album.save();

    res.json({ message: 'Cập nhật album thành công', album });
  } catch (error) {
    console.error('UpdateAlbum error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Check permission
    const user = await User.findByPk(req.user.id);
    if (album.createdById !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa album này' });
    }

    // Delete album images associations
    await AlbumImage.destroy({ where: { albumId: id } });

    // Delete favorites
    await Favorite.destroy({ where: { album_id: id } });

    // Delete album
    await album.destroy();

    res.json({ message: 'Xóa album thành công' });
  } catch (error) {
    console.error('DeleteAlbum error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.addImagesToAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrls } = req.body;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Check permission
    if (album.createdById !== req.user.id) {
      const user = await User.findByPk(req.user.id);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền thêm ảnh vào album này' });
      }
    }

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ message: 'Danh sách ảnh không hợp lệ' });
    }

    const addedImages = [];
    for (const url of imageUrls) {
      let image = await Image.findOne({ where: { url } });
      if (!image) {
        image = await Image.create({ url, caption: '' });
      }

      // Check if already linked
      const existing = await AlbumImage.findOne({
        where: { albumId: id, imageId: image.id }
      });

      if (!existing) {
        await AlbumImage.create({
          albumId: id,
          imageId: image.id
        });
        addedImages.push(image);
      }
    }

    res.json({
      message: `Đã thêm ${addedImages.length} ảnh vào album`,
      images: addedImages
    });
  } catch (error) {
    console.error('AddImagesToAlbum error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.removeImageFromAlbum = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Check permission
    if (album.createdById !== req.user.id) {
      const user = await User.findByPk(req.user.id);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Không có quyền xóa ảnh khỏi album này' });
      }
    }

    const deleted = await AlbumImage.destroy({
      where: { albumId: id, imageId }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Ảnh không tồn tại trong album' });
    }

    res.json({ message: 'Đã xóa ảnh khỏi album' });
  } catch (error) {
    console.error('RemoveImageFromAlbum error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getMyAlbums = async (req, res) => {
  try {
    const user_id = req.user.id;

    const albums = await Album.findAll({
      where: { createdById: user_id },
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'username'] },
        { model: Image, as: 'images', through: { attributes: [] } }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ albums });
  } catch (error) {
    console.error('GetMyAlbums error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.purchaseAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ message: 'Không tìm thấy album' });
    }

    // Check if already purchased
    const existingPurchase = await PurchasedAlbum.findOne({
      where: { user_id, album_id: id }
    });

    if (existingPurchase) {
      return res.status(400).json({ message: 'Bạn đã mua album này rồi' });
    }

    // Check if album is free
    if (album.price === 0) {
      // Free album - auto purchase
      await PurchasedAlbum.create({
        user_id,
        album_id: id,
        price: 0
      });
      return res.json({ message: 'Nhận album miễn phí thành công', purchased: true });
    }

    // Check user balance
    const user = await User.findByPk(user_id);
    if (user.balance < album.price) {
      return res.status(400).json({ 
        message: 'Số dư không đủ', 
        required: album.price,
        current: user.balance 
      });
    }

    // Deduct balance and create purchase
    user.balance -= album.price;
    await user.save();

    await PurchasedAlbum.create({
      user_id,
      album_id: id,
      price: album.price
    });

    res.json({ 
      message: 'Mua album thành công', 
      purchased: true,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('PurchaseAlbum error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.checkPurchased = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.json({ purchased: false });
    }

    const purchase = await PurchasedAlbum.findOne({
      where: { user_id, album_id: id }
    });

    res.json({ purchased: !!purchase });
  } catch (error) {
    console.error('CheckPurchased error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
