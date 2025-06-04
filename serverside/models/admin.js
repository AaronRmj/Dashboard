const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('admin', {
    IdAdmin: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    MotDePasse: {
      type: DataTypes.STRING,
      allowNull: false
    },
    NomEntreprise: {
      type: DataTypes.STRING,
      allowNull: false,
      unique : true
    },
    
    Photo: {
      type: DataTypes.STRING,
      allowNull: true // optionnel
    }
  }, {
    sequelize,
    tableName: 'admin',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [{ name: "IdAdmin" }]
      },
      {
        name: "Email",
        unique: true,
        using: "BTREE",
        fields: [{ name: "Email" }]
      }
    ]
  });
};
