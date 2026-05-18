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

const sharedOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const sequelize = dbConfig.url
  ? new Sequelize(dbConfig.url, {
      ...sharedOptions,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false
      }
    })
  : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
      ...sharedOptions,
      host: dbConfig.host,
      port: dbConfig.port,
      dialectOptions: {}
    });

module.exports = sequelize;
