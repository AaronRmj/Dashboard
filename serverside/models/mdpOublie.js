module.exports = function(sequelize, DataTypes) {
    return sequelize.define('reset_code', {
      Id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      Email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      Code: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ExpireAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'reset_code',
      modelName: 'ResetCode',
      timestamps: true  
    });
  };
  