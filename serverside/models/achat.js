const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('achat', {
    IdAchat: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Quantite: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    NomProduit: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'produit',
        key: 'Description'
      }
    },
    InfoFournisseur: {
      type: DataTypes.STRING,
      allowNull: false,
      references:{
        model: 'fournisseur',
        key:'Entreprise'
      }
    }
  }, {
    sequelize,
    tableName: 'achat',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IdAchat" },
        ]
      },
      {
        name: "NomProduit",
        using: "BTREE",
        fields: [
          { name: "NomProduit" },
        ]
      },
    ]
  });
};
