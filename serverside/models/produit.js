const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {// instance de sequelize io ahalalany hoe connexion an'ny db iza io; Sequelize.datatypes no alatsaka eto satria ilain'ilay code ao ambany ex: INTEGER
  return sequelize.define('produit', {
    IdProduit: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true 
    },
    CodeProduit: {
  type: DataTypes.STRING(50),
  allowNull: false,
  unique: true
},

    PVunitaire: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PAunitaire: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Description: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    Image: {
      type: Sequelize.STRING,
      allowNull: true
    },
   Stock: {
  type: DataTypes.INTEGER,
  allowNull: true,
  validate: {
    min: 0 // >= 0
  }
},

   Description: {
  type: DataTypes.STRING(50),
  allowNull: false,
  unique: true
},
Image: {
  type: Sequelize.STRING,
  allowNull: true
},
 CodeBarre: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'produit',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IdProduit" },
        ]
      },
    ]
  });
};
