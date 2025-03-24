const db = require('./models/db');
const express = require('express'); // fonction ilay importena eto azo heritreretina hoe anonyme
//db.sequelize.sync({alter : true}); // {alter : true} si tu veux rajouter une colonne; sans arguments si tu veux juste qu'il detecte qu'il devrait créer une novelle table
const cors = require('cors');

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
app.use(cors());
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

//VENTE

app.post("/Vente", async (req, res) => {
    try {
        // Validation des données
        if (!req.body.Client || !req.body.Produits) {
            return res.status(400).json({ error: "Données client ou produits manquantes" });
        }
        if (!Array.isArray(req.body.Produits)) {
            return res.status(400).json({ error: "Le champ 'Produits' doit être un tableau" });
        }

        // Gestion du client
        const { Telephone } = req.body.Client;
        const clientExists = await db.client.findOne({ where: { Tel: Telephone } });
        let newFacture;

        if (!clientExists) {
            const { Nom, Adresse, Email } = req.body.Client;
            const newClient = await db.client.create({ Nom, Adresse, Tel: Telephone, Email });
            newFacture = await db.facture.create({ InfoClient: newClient.IdClient });
        } else {
            newFacture = await db.facture.create({ InfoClient: clientExists.IdClient });
        }

        // Gestion des produits
        const NumFacture = newFacture.IdFacture;
        for (const produit of req.body.Produits) {
            const { Quantite, Date, CodeProduit, NumEmploye } = produit;

            // Validation et conversion
            const quantite = parseInt(Quantite, 10);
            const codeProduit = parseInt(CodeProduit, 10);
            const numEmploye = parseInt(NumEmploye, 10);
            if (isNaN(quantite) || isNaN(codeProduit) || isNaN(numEmploye) || !Date) {
                return res.status(400).json({ error: "Données de produit invalides" });
            }

            // Création de la vente
            await db.vente.create({ 
                Quantite: quantite, 
                Date, 
                CodeProduit: codeProduit, 
                NumFacture, 
                NumEmploye: numEmploye 
            });

            // Mise à jour du stock
            const produitStock = await db.produit.findOne({ where: { IdProduit: codeProduit } });
            if (!produitStock) {
                return res.status(404).json({ error: "Produit introuvable" });
            }
            await db.produit.update(
                { Stock: produitStock.Stock - quantite },
                { where: { IdProduit: codeProduit } }
            );
        }

        res.status(201).json({ message: "Facture créée avec succès", NumFacture });
    } catch (error) {
        console.error("Erreur globale :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// ACHAT

app.post("/Achat", async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { Date, InfoFournisseur, Telephone, Email, ...produits } = req.body;

        // Vérification des entrées
        if (!InfoFournisseur || !Date || Object.keys(produits).length === 0) {
            return res.status(400).json({ error: "Données invalides" });
        }

        // Vérifier si le fournisseur existe, sinon l'ajouter
        let fournisseur = await db.fournisseur.findOne({
            where: { NomEntreprise: InfoFournisseur },
            transaction
        });

        if (!fournisseur) {
            fournisseur = await db.fournisseur.create(
                { NomEntreprise: InfoFournisseur, Telephone, Email },
                { transaction }
            );
        }

        let achatsEffectués = [];

        for (const key in produits) {
            const { NomProduit, Quantite, Pachat, Pvente, Reference } = produits[key];

            if (!NomProduit || Quantite <= 0 || Pachat < 0 || Pvente < 0 || !Reference) {
                throw new Error(`Données invalides pour le produit : ${NomProduit}`);
            }

            let produit = await db.produit.findOne({
                where: { Description: NomProduit },
                transaction
            });

            if (produit) {
                // Mise à jour du stock, des prix et de la référence si nécessaire
                produit.Stock += Quantite;
                if (produit.PAunitaire !== Pachat) produit.PAunitaire = Pachat;
                if (produit.PVunitaire !== Pvente) produit.PVunitaire = Pvente;
                if (produit.Reference !== Reference) produit.Reference = Reference;
                await produit.save({ transaction });
            } else {
                // Création du produit avec la référence
                produit = await db.produit.create({
                    Description: NomProduit,
                    Stock: Quantite,
                    PAunitaire: Pachat,
                    PVunitaire: Pvente,
                    Reference: Reference
                }, { transaction });
            }

            // Enregistrement de l'achat
            const achat = await db.achat.create({
                NomProduit,
                Quantite,
                Date,
                InfoFournisseur: fournisseur.NomEntreprise
            }, { transaction });

            achatsEffectués.push({
                fournisseur: InfoFournisseur,
                produit: NomProduit,
                quantite: Quantite,
                reference: Reference,
                achatId: achat.id
            });
        }

        // Valider la transaction après avoir traité tous les produits
        await transaction.commit();

        res.status(201).json({
            message: "Achats enregistrés avec succès",
            achats: achatsEffectués
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de l'achat :", error);
        res.status(500).json({ error: "Une erreur est survenue", details: error.message });
    }
});
