const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('client', {
    IdClient: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Nom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Tel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "Tel"
    },
    Adresse: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'client',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IdClient" },
        ]
      },
      {
        name: "Tel",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "Tel" },
        ]
      },
    ]
  });
};
