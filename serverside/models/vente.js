const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vente', {
    IdVente: {
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
    CodeProduit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'produit',
        key: 'IdProduit'
      }
    },
    NumFacture: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'facture',
        key: 'IdFacture'
      }
    },
    NumEmploye: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'employe',
        key: 'IdEmploye'
      }
    }
  }, {
    sequelize,
    tableName: 'vente',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IdVente" },
        ]
      },
      {
        name: "CodeProduit",
        using: "BTREE",
        fields: [
          { name: "CodeProduit" },
        ]
      },
      {
        name: "NumFacture",
        using: "BTREE",
        fields: [
          { name: "NumFacture" },
        ]
      },
      {
        name: "NumEmploye",
        using: "BTREE",
        fields: [
          { name: "NumEmploye" },
        ]
      },
    ]
  });
};
