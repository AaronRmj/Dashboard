const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes){
    return sequelize.define('fournisseur', {
        IdFournisseur: {
            autoIncrement : true,
            type : DataTypes.INTEGER,
            allowNull : false,
            primaryKey : true
        },

        NomEntreprise : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }
    },
    {
        sequelize,
        tableName: 'fournisseur',
        timestamps: false,
    });
}