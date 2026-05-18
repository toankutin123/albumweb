const { Sequelize } = require('sequelize');
require('dotenv').config();

const getDatabaseConfig = () => {
  // Railway provides DATABASE_URL environment variable
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL };
  }
  
  // Local development fallback
  return {
    database: process.env.PG_DB || 'albumweb',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres123',
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
  };
};

const dbConfig = getDatabaseConfig();

const sequelize = new Sequelize(
  dbConfig.url ? dbConfig.url : dbConfig.database,
  dbConfig.url ? undefined : dbConfig.username,
  dbConfig.url ? undefined : dbConfig.password,
  {
    host: dbConfig.url ? undefined : dbConfig.host,
    port: dbConfig.url ? undefined : dbConfig.port,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: dbConfig.url ? {
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    } : {},
    define: {
      underscored: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
