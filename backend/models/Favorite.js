const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Favorite extends Model {}

Favorite.init({
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
  collection_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'collections',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Favorite',
  tableName: 'favorites',
  timestamps: true,
  underscored: true
});

module.exports = Favorite;
