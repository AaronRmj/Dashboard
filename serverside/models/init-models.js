var DataTypes = require("sequelize").DataTypes;
var _achat = require("./achat");
var _client = require("./client");
var _employe = require("./employe");
var _facture = require("./facture");
var _produit = require("./produit");
var _vente = require("./vente");
const _fournisseur = require("./fournisseur");

function initModels(sequelize) {
  var achat = _achat(sequelize, DataTypes);
  var client = _client(sequelize, DataTypes);
  var employe = _employe(sequelize, DataTypes);
  var facture = _facture(sequelize, DataTypes);
  var produit = _produit(sequelize, DataTypes);
  var vente = _vente(sequelize, DataTypes);
  var fournisseur = _fournisseur(sequelize, DataTypes);

  facture.belongsTo(client, { foreignKey: "InfoClient"});
  client.hasMany(facture, { foreignKey: "InfoClient"});
  vente.belongsTo(employe, { foreignKey: "NumEmploye"});
  employe.hasMany(vente, { foreignKey: "NumEmploye"});
  vente.belongsTo(facture, { foreignKey: "NumFacture"});
  facture.hasMany(vente, { foreignKey: "NumFacture"});
  achat.belongsTo(produit, { foreignKey: "CodeProduit"});
  produit.hasMany(achat, { foreignKey: "CodeProduit"});
  vente.belongsTo(produit, { foreignKey: "CodeProduit"});
  produit.hasMany(vente, { foreignKey: "CodeProduit"});
  achat.belongsTo(fournisseur, {foreignKey :"InfoFournisseur"});
  fournisseur.hasMany(achat, {foreignKey : "InfoFournisseur"});
  
  return {
    achat,
    client,
    employe,
    facture,
    produit,
    vente,
    fournisseur
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
