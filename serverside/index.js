const db = require('./models/db');
const cors = require('cors'); // Ajoutez cette ligne
const express = require('express');// fonction ilay importena eto azo heritreretina hoe anonyme
//db.sequelize.sync({alter : true}); // {alter : true} si tu veux rajouter une colonne; sans arguments si tu veux juste qu'il detecte qu'il devrait créer une novelle table

app.use(cors()); // Ajoutez cette ligne pour activer CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200
  };
  
  app.use(cors(corsOptions));
  


try{
    db.sequelize.authenticate();
    console.log("Connecté à la DB");
}
catch(error){
    console.error(error);
}


const errhandler = err => console.log("error : ", err);
const app = express();
const PORT = 8080;
app.use(express.json()); // eny fa na fonction ara ilay express dia manana ny propriétés-any koa 💀

app.listen(PORT, () => {
    console.log(`serveur au port ${PORT}`); // backtick eo amin'ny è kay no mampety ilay ${} 🤦‍♂️🤦‍♂️
})

app.get("/", (req, res) => {
    res.send("Hello");
});

app.get("/Produit", async (req, res) => {
    const produits = await db.produit.findAll();
    res.status(200).json(produits); // .json() mandefa données sous la forme JSON. avy tamin'ny express
});

app.get("/Clients", async (req, res) => {
    const clients = await db.client.findAll();
    res.status(200).json(clients);
});

app.get("/Employe", async (req, res) => {
    const employe = await db.employe.findAll();
    console.log("Employés récupérés :", employe); // Ajoute ceci pour voir les résultats dans le terminal
    res.status(200).json(employe);
});

app.get("/Facture/:idFacture", async (req, res) =>{
    const {idFacture} = req.params;
    const facture = await db.vente.findAll({attributes: { exclude : ["IdVente"]},
        include: {
            model : db.facture,
            attributes : ["idFacture"], 
            where: {IdFacture : idFacture}
        }
    }).catch(errhandler);
    console.log(facture.map(ele => ele.toJSON()));
    res.status(200).json(facture);
});

app.post("/Vente", async (req, res) => {
    for(prod in req.body){
        const { Quantite, Date, CodeProduit, NumFacture, NumEmploye} = req.body[prod];
        if(!Quantite || !Date || !CodeProduit || !NumFacture || !NumEmploye){
            return res.status(400).json({error : "un field manquant"});
        }
        await db.vente.create({ Quantite, Date, CodeProduit, NumFacture, NumEmploye}).catch(errhandler);
        const produit = await db.produit.findOne({where: {IdProduit : CodeProduit}}).catch(errhandler);
        const updatedStock = produit.Stock - Quantite;
        await db.produit.update({Stock : updatedStock}, {where : {IdProduit : CodeProduit}}).catch(errhandler);
    }
    res.sendStatus(201);
});


/*app.post("/Achat", async (req, res) => {
    const {CodeProduit, Descri, Quantite, Date, Pachat, Pvente, NumFournisseur} = req.body;
    const listeProduit = await db.produit.findAll({attributes : ["Description"]}); 

    const check = listeProduit.map(descri => descri == Descri? Descri: null);
    const doublecheck = check.every(element => element === null);
    if (!doublecheck){
        await db.achat.create({ CodeProduit, Quantite, Date, NumFournisseur}).catch(errhandler);
        const produit = await db.produit.findOne({where: {Description : Descri}}).catch(errhandler); 
        console.log(produit);
        const updatedStock = produit.Stock + Quantite;
        await db.produit.update({Stock : updatedStock}, {where : {Description : Descri}}).catch(errhandler);    
    }
    else{
        await db.produit.create({Stock : Quantite, Description : Descri, PAunitaire : Pachat, PVunitaire : Pvente });
        const NvCodeProduit = db.produit.findAll({attributes : ["IdProduit"], where : {Description : Descri}});
        await db.achat.create({ NvCodeProduit, Quantite, Date, NumFournisseur}).catch(errhandler);
    }
    res.sendStatus(201);

});*/
