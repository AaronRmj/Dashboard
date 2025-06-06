var DataTypes = require("sequelize").DataTypes;
var _admin = require("./admin"); 
var _reset_code = require("./mdpoublie");

function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes); 
  var reset_code = _reset_code(sequelize, DataTypes);

  return {
    admin,
    reset_code 
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
   



