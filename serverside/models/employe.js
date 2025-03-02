const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('employe', {
    IdEmploye: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Nom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    UserName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Adresse: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Email : {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Tel: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Poste: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Salaire: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Mdp: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'employe',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IdEmploye" },
        ]
      },
    ]
  });
};
