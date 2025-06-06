const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { where, Op } = require('sequelize');
const db = require('./models/db');



// Connexion à la BD
db.sequelize.authenticate()
  .then(() => console.log(" Connecté à la BD "))
  .catch(err => console.error(" Erreur connexion BD :", err));

db.sequelize.sync({ alter: true }) //{alter : true} si tu veux rajouter une colonne; sans arguments si tu veux juste qu'il detecte qu'il devrait créer une novelle table
  .then(() => {
    console.log(" Synchronisation Sequelize ");
    console.log("Modèles chargés :", Object.keys(db));
  })
  .catch(err => console.error(" Erreur synchronisation :", err));// !!! Enlever le commentaire pour Synchroniser la BD aux Modèles


const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;


// Middlewares fonction avec execution  obtient et renvoie reponse 
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// cree dossier uploads sinon existe 
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer gerance ficher image reetra +lire acceder enregitre 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `photo-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Transport mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Routes!!!

app.get("/", (req, res) => {
    res.send("Hello");
});
const errhandler = err => console.log("Erreur : ", err);

app.get("/Produit", async (req, res) => {
    const produits = await db.produit.findAll();
    res.status(200).json(produits); // .json() pour envoi des données après query sous forme json. **different de toJSON()
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


//  INSCRIPTION
app.post('/signup', upload.single("photo"), async (req, res) => {
    try {
      const { nom, email, password, entreprise } = req.body;
      const photoPath = req.file ? req.file.filename : null;
  
      if (!nom || !email || !password || !entreprise) {
        return res.status(400).json({ error: "Tous les champs obligatoires ne sont pas fournis" });
      }
  
      const adminExist = await db.admin.findOne({ where: { Email: email } });
      if (adminExist) return res.status(400).json({ error: "Email déjà utilisé" });
  
      const entrepriseExist = await db.admin.findOne({ where: { NomEntreprise: entreprise } });
      if (entrepriseExist) return res.status(400).json({ error: "Nom d'entreprise déjà utilisé" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await db.admin.create({
        Nom: nom,
        Email: email,
        MotDePasse: hashedPassword,
        NomEntreprise: entreprise,
        Photo: photoPath
      });
  
      res.status(201).json({ message: "Admin inscrit avec succès" });
  
    } catch (err) {
      console.error("Erreur signup :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
});


//  CONNEXION avec REMEMBER ME
app.post('/login', async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }
  
      const admin = await db.admin.findOne({ where: { Email: email } });
      if (!admin) {
        return res.status(404).json({ error: "Aucun compte associé à cet email" });
      }
  
      const passwordMatch = await bcrypt.compare(password, admin.MotDePasse);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }
  
      // TOKEN apres connexion  1h  7j si rememberme
      const expiresIn = rememberMe ? '7d' : '1h';
      const token = jwt.sign(
        { id: admin.IdAdmin, email: admin.Email },
        JWT_SECRET,
        { expiresIn }
      );
  
      
      res.status(200).json({
        message: "Connexion réussie",
        token,
        rememberMe: !!rememberMe,
        expiresIn
      });
  
    } catch (err) {
      console.error("Erreur login :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
});


// MDP Oublié 
app.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email requis" });
  
      const admin = await db.admin.findOne({ where: { Email: email } });
      if (!admin) return res.status(404).json({ error: "Aucun compte avec cet email" });
  
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expireAt = new Date(Date.now() + 10 * 60 * 1000);
  
      await db.reset_code.create({ Email: email, Code: code, ExpireAt: expireAt });
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Code de réinitialisation de mot de passe",
        text: `Bonjour,\n\nVotre code de vérification pour réinitialiser votre mot de passe est : ${code}\n\nCe code expire dans 10 minutes.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nCordialement,\nVotre équipe`
      });
  
      res.json({ message: "Code de validation envoyé par email" });
  
    } catch (err) {
      console.error("Erreur forgot-password :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
});


// middle jwt verification apres connex 
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token manquant" });
  
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Token invalide" });
      req.admin = decoded;
      next();
    });
}

// route proteger +profil+ securisee 
app.get('/profile', authMiddleware, async (req, res) => {
    const admin = await db.admin.findByPk(req.admin.id, { attributes: { exclude: ['MotDePasse'] } });
    if (!admin) return res.status(404).json({ error: "Admin introuvable" });
  
    res.json({
      ...admin.toJSON(),
      photoUrl: admin.Photo ? `${req.protocol}://${req.get('host')}/uploads/${admin.Photo}` : null
    });
});

// VERIFICATION DU CODE PAR MAIL
app.post('/validate-code', async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ error: "Code requis" });
  
      const record = await db.reset_code.findOne({
        where: { Email: email, Code: code },
        order: [['createdAt', 'DESC']]
      });
  
      if (!record) return res.status(400).json({ error: "Code invalide" });
  
      const now = new Date();
      if (now > record.ExpireAt) {
        return res.status(400).json({ error: "Code expiré" });
      }
  
      res.json({ message: "Code valide" });
  
    } catch (err) {
      console.error("Erreur validate-code :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
});

/// REINITIALISATION DE MDP APRES LES PROCESSUS 
app.post('/reset-password', async (req, res) => {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;
  
      
      if (!email || !code || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, error: "Les mots de passe ne correspondent pas" });
      }
  
      const passwordRegex = /^[A-Za-z0-9]{6}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
           success: false,
           error: "Le mot de passe doit contenir exactement 6 caractères alphanumériques sans caractères spéciaux"
        });
      }
  
      const record = await db.reset_code.findOne({
        where: { Email: email, Code: code },
        order: [['createdAt', 'DESC']]
      });
  
      if (!record) {
        return res.status(400).json({ error: "Code invalide" });
      }
  
      const now = new Date();
      if (now > record.ExpireAt) {
        return res.status(400).json({ error: "Code expiré" });
      }
  
      // hash mdp
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Maj dans la table 
      const admin = await db.admin.findOne({ where: { Email: email } });
      if (!admin) {
        return res.status(404).json({ error: "Compte introuvable" });
      }
  
      await admin.update({ MotDePasse: hashedPassword });
  
      // Suppression code apres 
      await db.reset_code.destroy({ where: { Email: email } });
  
      res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  
    } catch (err) {
      console.error("Erreur reset-password :", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
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
app.post("/Achat", upload.any(), async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { Date, InfoFournisseur, Telephone, Email } = req.body;

        // Les produits sont supposés être envoyés en JSON dans un champ `produits`
        const produits = JSON.parse(req.body.produits); 

        // Vérification des entrées
        if (!InfoFournisseur || !Date || produits.length === 0) {
            return res.status(400).json({ error: "Données invalides" });
        }

        // Association fichiers -> produits (par index)
        const fichiers = req.files || [];

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

        for (let i = 0; i < produits.length; i++) {
            const { NomProduit, Quantite, Pachat, Pvente, Reference } = produits[i];

            if (!NomProduit || Quantite <= 0 || Pachat < 0 || Pvente < 0 || !Reference) {
                throw new Error(`Données invalides pour le produit : ${NomProduit}`);
            }

            const imageProduit = fichiers[i] ? fichiers[i].filename : null;

            let produit = await db.produit.findOne({
                where: { Description: NomProduit },
                transaction
            });

            if (produit) {
                // Mise à jour
                produit.Stock += Quantite;
                if (produit.PAunitaire !== Pachat) produit.PAunitaire = Pachat;
                if (produit.PVunitaire !== Pvente) produit.PVunitaire = Pvente;
                if (produit.Reference !== Reference) produit.Reference = Reference;
                if (imageProduit) produit.Image = `/uploads/${imageProduit}`;
                await produit.save({ transaction });
            } else {
                // Création
                produit = await db.produit.create({
                    Description: NomProduit,
                    Stock: Quantite,
                    PAunitaire: Pachat,
                    PVunitaire: Pvente,
                    Reference: Reference,
                    Image: imageProduit ? `/uploads/${imageProduit}` : null
                }, { transaction });
            }

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
                image: imageProduit ? `/uploads/${imageProduit}` : null,
                achatId: achat.id
            });
        }

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


// BENEFICE total ou par produit ou par date
app.post("/Benefice", async (req, res)=>{
    let Produits;
    if((!req.body.StartDate &&req.body.EndDate)  || (req.body.StartDate && !req.body.EndDate))
    {
        return res.status(400).json({ error: "Date de Début ou de Fin manquante" });
    }
    else if(req.body.idProduit)
    { 
        console.log(req.body.StartDate, req.body.EndDate, req.body.StartDate && req.body.EndDate);
        let Produit = (req.body.StartDate && req.body.EndDate)?
                      await db.vente.findAll({attributes: { exclude: ['CodeProduit', 'Date', 'IdVente', 'NumEmploye', 'NumFacture'] }, 
                                              where: {CodeProduit : req.body.idProduit, Date: { [Op.between] : [req.body.StartDate, req.body.EndDate] }}}) :
                      await db.vente.findAll({attributes: { exclude: ['CodeProduit', 'Date', 'IdVente', 'NumEmploye', 'NumFacture'] },
                                              where: {CodeProduit : req.body.idProduit}});

        const prixVente = await db.produit.findOne({where: {IdProduit : req.body.idProduit}});
        let totalQuantite = 0;
        // Produit trouvé par findAll donc array. Mieux si mappée et .toJSON() d'abord car là ça sera du clean [{},{},...] mais bon ça marche toujours 
        for(i of Produit)
        {
            totalQuantite += i["Quantite"];
        }
        const CA = totalQuantite * prixVente.PVunitaire; 
        const PR = totalQuantite * prixVente.PAunitaire; 
        const Benef = CA - PR;
        const package = { totalVentes : CA , Benefice : Benef}; // Plus facile à manipuler pour Mr Senpai
    
        console.log(Produit);
        console.log(totalQuantite);
        console.log(prixVente.PVunitaire);
    
        return res.status(200).json(package);
    }
    else if(!req.body.StartDate && !req.body.EndDate )
    {
        Produits = await db.vente.findAll({attributes: {exclude: ['IdVente', 'NumEmploye', 'NumFacture'] },
        include: {
            model: db.produit, 
            attributes: ["PVunitaire", "PAunitaire"]
        }});
    }
    else
    {
        Produits = await db.vente.findAll({attributes: {exclude: ['IdVente', 'NumEmploye', 'NumFacture'] },
        where: {Date: {[Op.between] : [req.body.StartDate , req.body.EndDate]} },
        include: {
            model: db.produit, 
            attributes: ["PVunitaire", "PAunitaire"]
        }});
    }
    console.log(Produits.map(i=>i.toJSON()));
    
    let CA = 0;
    let PR = 0;
    let Benefice = 0;
  
    for(article of Produits)
    {
        CA += article.Quantite * article.produit.PVunitaire;
        PR += article.Quantite * article.produit.PAunitaire;
    }
    Benefice = CA - PR;
    console.log(CA)
    res.status(200).json({Benefice : Benefice, CA : CA, SDate: req.body.StartDate, EDate : req.body.EndDate });
});


app.listen(PORT, () => {
    console.log(`serveur au port ${PORT}`);
});
