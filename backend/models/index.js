const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define PaymentInfo model
const PaymentInfo = sequelize.define('PaymentInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  account_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  account_holder: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: null
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'payment_info',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define Image model
const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, {
  tableName: 'images',
  timestamps: false
});

// Define Album model
const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
    validate: {
      len: [0, 1000]
    }
  },
  coverImage: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  price: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Giá album, 0 = miễn phí'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'albums',
  timestamps: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['genre']
    },
    {
      fields: ['is_premium']
    }
  ]
});

// Define AlbumImage model (junction table - one album has many images)
const AlbumImage = sequelize.define('AlbumImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  albumId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    }
  },
  imageId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'images',
      key: 'id'
    }
  }
}, {
  tableName: 'album_images',
  timestamps: false
});

// Define Payment model (deposit requests)
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transfer_note: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'payments',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define Withdrawal model (rút tiền)
const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'failed'),
    defaultValue: 'pending'
  },
  failure_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'withdrawals',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define Favorite model
const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  album_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    }
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  underscored: true
});

// Define associations
User.hasMany(PaymentInfo, { foreignKey: 'user_id', as: 'paymentInfo' });
PaymentInfo.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Withdrawal, { foreignKey: 'user_id', as: 'withdrawals' });
Withdrawal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Album, { foreignKey: 'createdById', as: 'albums' });
Album.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Album.hasMany(Favorite, { foreignKey: 'album_id', as: 'favorites' });
Favorite.belongsTo(Album, { foreignKey: 'album_id', as: 'album' });

// Define PurchasedAlbum model
const PurchasedAlbum = sequelize.define('PurchasedAlbum', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  album_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'purchased_albums',
  timestamps: true,
  underscored: true
});

// Associations for PurchasedAlbum
User.hasMany(PurchasedAlbum, { foreignKey: 'user_id', as: 'purchasedAlbums' });
PurchasedAlbum.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Album.hasMany(PurchasedAlbum, { foreignKey: 'album_id', as: 'purchasedBy' });
PurchasedAlbum.belongsTo(Album, { foreignKey: 'album_id', as: 'album' });

Album.belongsToMany(Image, { through: AlbumImage, foreignKey: 'albumId', as: 'images' });
Image.belongsToMany(Album, { through: AlbumImage, foreignKey: 'imageId', as: 'albums' });

module.exports = {
  sequelize,
  User,
  PaymentInfo,
  Payment,
  Withdrawal,
  Image,
  Album,
  AlbumImage,
  Favorite,
  PurchasedAlbum
};
