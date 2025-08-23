const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "presence",
    {
      IdPresence: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      NumEmploye: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      DatePresence: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
            Matricule: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      NomEntreprise: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      HeureScan: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      Statut: {
        type: DataTypes.ENUM("absent", "present", "retard"),
        defaultValue: "absent",
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "presence",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "IdPresence" }],
        },
      ],
    }
  );
};
