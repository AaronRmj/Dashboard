const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('facture', {
    IdFacture: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    InfoCLient: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'client',
        key: 'IdClient'
      }
    }
  }, {
    sequelize,
    tableName: 'facture',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IdFacture" },
        ]
      },
      {
        name: "InfoCLient",
        using: "BTREE",
        fields: [
          { name: "InfoCLient" },
        ]
      },
    ]
  });
};
