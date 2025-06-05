const {Sequelize, DataTypes} = require('sequelize'); // azo ampiasaina/ atao mention raha classe
//  ato amin'izay ilay classe Sequelize sy Datatypes

const sequelize = new Sequelize('erp', 'root', '', {
    host: 'localhost',
    dialect :'mysql'
});

module.exports = sequelize; 