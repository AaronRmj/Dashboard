var DataTypes = require("sequelize").DataTypes;
var _admin = require("./admin"); 
var _achat = require("./achat");
var _client = require("./client");
var _employe = require("./employe");
var _facture = require("./facture");
var _produit = require("./produit");
var _vente = require("./vente");
const _fournisseur = require("./fournisseur");
var _reset_code = require("./mdpOublie");

function initModels(sequelize) {
  var admin = _admin(sequelize, DataTypes); 
  var achat = _achat(sequelize, DataTypes);
  var client = _client(sequelize, DataTypes);
  var employe = _employe(sequelize, DataTypes);
  var facture = _facture(sequelize, DataTypes);
  var produit = _produit(sequelize, DataTypes);
  var vente = _vente(sequelize, DataTypes);
  var fournisseur = _fournisseur(sequelize, DataTypes);
  var reset_code = _reset_code(sequelize, DataTypes);


  facture.belongsTo(client, { foreignKey: "InfoClient"});
  client.hasMany(facture, { foreignKey: "InfoClient"});
  vente.belongsTo(employe, { foreignKey: "NumEmploye"});
  employe.hasMany(vente, { foreignKey: "NumEmploye"});
  vente.belongsTo(facture, { foreignKey: "NumFacture"});
  facture.hasMany(vente, { foreignKey: "NumFacture"});
  achat.belongsTo(produit, { foreignKey: "NomProduit"});
  produit.hasMany(achat, { foreignKey: "NomProduit"});
  vente.belongsTo(produit, { foreignKey: "CodeProduit"});
  produit.hasMany(vente, { foreignKey: "CodeProduit"});
  // InfoFournisseur stores the fournisseur Entreprise (string), not the PK IdFournisseur
  // Tell Sequelize to join using the Entreprise column as targetKey/sourceKey
  achat.belongsTo(fournisseur, { foreignKey: "InfoFournisseur", targetKey: "Entreprise" });
  fournisseur.hasMany(achat, { foreignKey: "InfoFournisseur", sourceKey: "Entreprise" });
  
  return {
    admin,
    achat,
    client,
    employe,
    facture,
    produit,
    vente,
    fournisseur,
    reset_code
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
