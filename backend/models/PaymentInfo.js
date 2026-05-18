const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

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
      model: User,
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
  }
}, {
  tableName: 'payment_info',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

PaymentInfo.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(PaymentInfo, { foreignKey: 'user_id' });

module.exports = PaymentInfo;
