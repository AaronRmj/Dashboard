const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes){
    return sequelize.define('fournisseur', {
        NomEntreprise : {
            type : DataTypes.STRING(50),
            allowNull : false,
            unique:true
        },
        IdFournisseur: {
            autoIncrement : true,
            type : DataTypes.INTEGER,
            allowNull : false,
            primaryKey : true
        }, 
        Telephone : {
            type : DataTypes.INTEGER,
            allowNull : false
        },
        Email : {
            type : DataTypes.STRING(50),
            allowNull : true
        }
    },
    {
        sequelize,
        tableName: 'fournisseur',
        timestamps: false,
    });
}