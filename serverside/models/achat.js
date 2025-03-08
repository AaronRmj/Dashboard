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
    CodeProduit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'produit',
        key: 'IdProduit'
      }
    },
    InfoFournisseur: {
      type: DataTypes.STRING,
      allowNull: false
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
        name: "CodeProduit",
        using: "BTREE",
        fields: [
          { name: "CodeProduit" },
        ]
      },
    ]
  });
};
