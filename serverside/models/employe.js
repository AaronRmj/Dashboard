module.exports = (sequelize, DataTypes) => {
  const Employe = sequelize.define("employe", {
    IdEmploye: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UserName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Adresse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    Tel: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Poste: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Salaire: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Mdp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Photo: {
      type: DataTypes.STRING,
    },
    QRCodePath: {
      type: DataTypes.STRING,
    },
    Matricule: {
      type: DataTypes.STRING,
    },
    DateEmbauche: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    NomEntreprise: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    freezeTableName: true, 
    timestamps: false,// 
    indexes: [
      {
        unique: true,
        fields: ['Email', 'NomEntreprise'],
      },
    ],
  });

  return Employe;
};
