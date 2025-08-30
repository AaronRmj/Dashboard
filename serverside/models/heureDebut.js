const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "heureDebut", 
    {
      IdHeureDebut: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      NomEntreprise: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      HeureDebut: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "heuredebut", 
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "IdHeureDebut" }],
        },
        {
          name: "entreprise_date_index",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "NomEntreprise" },
            { name: "Date" }
          ],
        },
      ],
    }
  );
};