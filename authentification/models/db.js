const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('./config');

const db = require('./init-models')(sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;