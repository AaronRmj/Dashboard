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
const QRCode = require('qrcode');




// Connexion à la BD
db.sequelize.authenticate()
  .then(() => console.log(" Connecté à la BD "))
  .catch(err => console.error(" Erreur connexion BD :", err));

/*db.sequelize.sync({ force: true }) //{alter : true} si tu veux rajouter une colonne; sans arguments si tu veux juste qu'il detecte qu'il devrait créer une novelle table
  .then(() => {
    console.log(" Synchronisation Sequelize ");
    console.log("Modèles chargés :", Object.keys(db));
  })
  .catch(err => console.error(" Erreur synchronisation :", err));// !!! Enlever le commentaire pour Synchroniser la BD aux Modèles
*/


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


// routes


//mila telechargena le qrcode alaina avao amle db s dossier 

app.get('/telecharger-qr/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads/employe-qr', filename);
  res.download(filePath); 
});


app.get("/Employe", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const entreprise = decoded.entreprise;

    const employes = await db.employe.findAll({
      where: { NomEntreprise: entreprise }
    });

    res.status(200).json(employes);
  } catch (err) {
    console.error("Erreur de vérification du token :", err);
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }
});


//  Inscription
app.post('/signup', upload.single("photo"), async (req, res) => {
  try {
    const { nom, email, password, entreprise } = req.body;
    const photoPath = req.file ? req.file.filename : null;

    if (!nom || !email || !password || !entreprise) {
      return res.status(400).json({ error: "Tous les champs   sont obligatoires" });
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

// Connexion 
app.post('/login', async (req, res) => {
  try {
    const { role, email, password, rememberMe, matricule } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ error: "Role, email et mot de passe requis." });
    }

    if (role === "admin") {
      const admin = await db.admin.findOne({ where: { Email: email } });
      if (!admin) return res.status(404).json({ error: "Admin introuvable." });

      const passwordMatch = await bcrypt.compare(password, admin.MotDePasse);
      if (!passwordMatch) return res.status(401).json({ error: "Mot de passe incorrect." });

      const token = jwt.sign(
        { id: admin.IdAdmin, email: admin.Email, role: "admin" ,  entreprise: admin.NomEntreprise  },
        JWT_SECRET,
        { expiresIn: rememberMe ? '20d' : '4d' }
      );

      return res.status(200).json({
        message: "Connexion admin réussie",
        token,
        role: "admin",
        rememberMe: !!rememberMe
      });

    } else if (role === "employe") {
      if (!matricule) {
        return res.status(400).json({ error: "Le matricule est requis pour l'employé." });
      }

      // forme matricule  4 chifr-  lettre na chiffre  ..... 0055-erp
      const matriculeRegex = /^\d{4}-[a-zA-Z0-9]+$/;
      if (!matriculeRegex.test(matricule)) {
        return res.status(400).json({ error: "Format de matricule invalide." });
      }

    
      const employes = await db.employe.findAll({ where: { Email: email } });
      if (!employes || employes.length === 0) {
        return res.status(404).json({ error: "Employé introuvable." });
      }


      const employe = employes.find(emp => emp.Matricule === matricule);
      if (!employe) {
        return res.status(401).json({ error: "Matricule incorrect." });
      }


      const passwordMatch = await bcrypt.compare(password, employe.Mdp);
      if (!passwordMatch) return res.status(401).json({ error: "Mot de passe incorrect." });

      const token = jwt.sign(
        { id: employe.IdEmploye, email: employe.Email, role: "employe" ,entreprise: employe.NomEntreprise},
        JWT_SECRET,
        { expiresIn: rememberMe ? '22d' : '4d' }
      );

      return res.status(200).json({
        message: "Connexion employé réussie",
        token,
        role: "employe",
        rememberMe: !!rememberMe
      });

    } else {
      return res.status(400).json({ error: "Rôle invalide. Doit être 'admin' ou 'employe'." });
    }

  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});



// mdp oublier 
app.post('/forgot-password', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "Email et rôle requis" });

    const Model = role === 'admin' ? db.admin : role === 'employe' ? db.employe : null;
    if (!Model) return res.status(400).json({ error: "Rôle invalide" });

    const user = await Model.findOne({ where: { Email: email } });
    if (!user) return res.status(404).json({ error: "Aucun compte avec cet email" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.reset_code.create({ Email: email, Code: code,Role: role, ExpireAt: expireAt });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Voici votre de réinitialisation de mot de passe",
      text: `Bonjour,\n\nVotre code de réinitialisation  est : ${code}\n\nCe code expirera dans 10 minutes.\n\n`
    });

    res.json({ message: "Code envoyé par email" });

  } catch (err) {
    console.error("Erreur forgot-password :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token invalide" });
    req.user = decoded;
    next();
  });
}


// route proteger +profil+ securisee 
app.get('/profile', authMiddleware, async (req, res) => {
  const { id, role } = req.user;

  let user = null;
  if (role === 'admin') {
    user = await db.admin.findByPk(id, { attributes: { exclude: ['MotDePasse'] } });
  } else if (role === 'employe') {
    user = await db.employe.findByPk(id, { attributes: { exclude: ['MotDePasse'] } });
  }

  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json({
    ...user.toJSON(),
    photoUrl: user.Photo ? `${req.protocol}://${req.get('host')}/uploads/${user.Photo}` : null
  });
});


app.post('/validate-code', async (req, res) => {
  try {
    const { email, code, role } = req.body;
    if (!email || !code || !role) {
      return res.status(400).json({ error: "Email, code et rôle requis" });
    }

    const record = await db.reset_code.findOne({
      where: { Email: email, Code: code, Role: role },
      order: [['createdAt', 'DESC']],
    });

    if (!record) return res.status(400).json({ error: "Code invalide ou rôle incorrect" });
    if (new Date() > record.ExpireAt) {
      return res.status(400).json({ error: "Code expiré" });
    }

    res.json({ message: "Code valide" });

  } catch (err) {
    console.error("Erreur validate-code :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// changment mdp
app.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword, role } = req.body;

    if (!email || !code || !newPassword || !confirmPassword || !role) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Les mots de passe ne correspondent pas" });
    }

    const passwordRegex = /^[A-Za-z0-9]{6,6}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: "Mot de passe : exactement 6 caractères alphanumériques, pas de caractères spéciaux"
      });
    }

    const record = await db.reset_code.findOne({
      where: { Email: email, Code: code },
      order: [['createdAt', 'DESC']],
    });

    if (!record) return res.status(400).json({ error: "Code invalide" });
    if (new Date() > record.ExpireAt) return res.status(400).json({ error: "Code expiré" });

    let user = null;
    let fieldToUpdate = "";

    if (role === 'admin') {
      user = await db.admin.findOne({ where: { Email: email } });
      fieldToUpdate = "MotDePasse";
    } else if (role === 'employe') {
      user = await db.employe.findOne({ where: { Email: email } });
      fieldToUpdate = "Mdp";
    } else {
      return res.status(400).json({ error: "Rôle invalide" });
    }

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé dans le rôle spécifié" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ [fieldToUpdate]: hashedPassword });

    await db.reset_code.destroy({ where: { Email: email } });

    res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès" });

  } catch (err) {
    console.error("Erreur reset-password :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.post('/ajouter-employe', authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const {
      nom, username, adresse, email,
      tel, poste, salaire, motdepasse
    } = req.body;

    const photoPath = req.file ? req.file.filename : null;

    //regex 
    
    
    if (!nom || !username || !adresse || !email || !tel || !poste || !salaire || !motdepasse || !photoPath) {
      return res.status(400).json({ error: "Tous les champs sont requis et la photo est obligatoire." });
    }

    const passwordRegex = /^[A-Za-z0-9]{6,}$/;
    if (!passwordRegex.test(motdepasse)) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 6 caractères alphanumériques sans caractères spéciaux."
      });
    }
   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: "Adresse email invalide." });
}
    // verification lo z olona connecte apidtr employe mb iraccordena azy ao @ entreprise 
    const admin = await db.admin.findByPk(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: "Administrateur introuvable." });
    }

    // Normalisation
    const nomEntreprise = admin.NomEntreprise.trim().toLowerCase();
    const emailCheck = email.trim().toLowerCase();

    console.log("==> Débogage avant findOne");
    console.log("Nom entreprise (admin):", nomEntreprise);
    console.log("Email saisi:", emailCheck);

    const existant = await db.employe.findOne({
      where: {
        Email: emailCheck,
        NomEntreprise: nomEntreprise
      }
    });

    console.log("Résultat existant:", existant);

    if (existant) {
      return res.status(400).json({
        error: "Cet email est déjà utilisé dans cette entreprise."
      });
    }


    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // generation matricule auto selon id dans l entreprise fa ts id ao amn bd 
    const employeCount = await db.employe.count({
      where: { NomEntreprise: nomEntreprise }
    });

    const numeroMatricule = (employeCount + 1).toString().padStart(4, '0');
    const suffixEntreprise = nomEntreprise.replace(/\s+/g, '-');
    const matricule = `${numeroMatricule}-${suffixEntreprise}`;

    const nouvelEmploye = await db.employe.create({
      Nom: nom,
      UserName: username,
      Adresse: adresse,
      Email: emailCheck,
      Tel: tel,
      Poste: poste,
      Salaire: salaire,
      Mdp: hashedPassword,
      Photo: photoPath,
      QRCodePath: "",
      NomEntreprise: nomEntreprise,
      Matricule: matricule
    });

    // meme methode que l image sur inscription 
    const qrFolderPath = path.join(__dirname, 'uploads/employe-qr');
    if (!fs.existsSync(qrFolderPath)) {
      fs.mkdirSync(qrFolderPath, { recursive: true });
    }

    // generation qrcode asina mail satria iny no maha unique azy ao amn entreprise 1 
    const qrData = nouvelEmploye.Email;
    const qrFileName = `qr-${Date.now()}.png`;
    const qrCodePath = path.join(qrFolderPath, qrFileName);

    await QRCode.toFile(qrCodePath, qrData);

    // Maj du chemin alefa anaty bd 
    await nouvelEmploye.update({ QRCodePath: `employe-qr/${qrFileName}` });

    return res.status(201).json({
      message: "Employé ajouté avec succès.",
      id: nouvelEmploye.IdEmploye,
      matricule: matricule,
      qrCode: `http://localhost:8080/uploads/employe-qr/${qrFileName}`
    });

  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: "Un employé avec cet email existe déjà dans cette entreprise."
      });
    }
    
   if (err.name === 'SequelizeValidationError') {
    // Traduction humaine des erreurs Sequelize   mety ilaina ko amn manaraka 
    const messages = err.errors.map(e => {
      if (e.message.includes("isEmail")) return "Adresse email invalide.";
      return e.message;
    });

    return res.status(400).json({ error: messages.join(", ") });
  }

  console.error("Erreur lors de l'ajout de l'employé :", err);
  return res.status(500).json({ error: "Erreur serveur." });
}
});
  



app.get('/user-info', authMiddleware, async (req, res) => {
  try {
    const { role, id } = req.user;
    const baseUrl = 'http://localhost:8080/uploads/';

    if (role === "admin") {
      const admin = await db.admin.findOne({ where: { IdAdmin: id } });
      if (!admin) return res.status(404).json({ error: "Admin introuvable" });

      return res.json({
        name: admin.Nom,
      
        email: admin.Email,
        entreprise: admin.NomEntreprise,
        photoUrl: admin.Photo ? baseUrl + admin.Photo : null,
        role: "admin"
      });

    } else if (role === "employe") {
      const employe = await db.employe.findOne({ where: { IdEmploye: id } });
      if (!employe) return res.status(404).json({ error: "Employé introuvable" });

      return res.json({
        name: employe.Nom,
        username: employe.UserName,
        email: employe.Email,
        entreprise: employe.NomEntreprise,
        poste: employe.Poste,
        matricule: employe.Matricule, // <-- ajout ici
        photoUrl: employe.Photo ? baseUrl + employe.Photo : null,
        role: "employe"
      });

    } else {
      return res.status(400).json({ error: "Rôle invalide" });
    }
  } catch (error) {
    console.error("Erreur récupération info utilisateur :", error);
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



// Route MAJ photo de profil (admin ou employe)
app.post('/update-photo', upload.single('photo'), async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, role } = decoded;

    if (!req.file) {
      return res.status(400).json({ error: "Aucune photo téléchargée." });
    }

    const newPhotoPath = req.file.filename;

    if (role === "admin") {
      const admin = await db.admin.findByPk(id);
      if (!admin) return res.status(404).json({ error: "Admin introuvable." });

      // Supprimer l'ancienne photo si existante
      if (admin.Photo) {
        const oldPath = path.join(__dirname, 'uploads', admin.Photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // MAJ BDD
      admin.Photo = newPhotoPath;
      await admin.save();

    } else if (role === "employe") {
      const employe = await db.employe.findByPk(id);
      if (!employe) return res.status(404).json({ error: "Employé introuvable." });

      if (employe.Photo) {
        const oldPath = path.join(__dirname, 'uploads', employe.Photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      employe.Photo = newPhotoPath;
      await employe.save();

    } else {
      return res.status(400).json({ error: "Rôle non reconnu." });
    }

    res.status(200).json({ message: "Photo mise à jour avec succès", photoUrl: `http://localhost:${PORT}/uploads/${newPhotoPath}` });

  } catch (err) {
    console.error("Erreur update photo :", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la photo." });
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
            where: { Entreprise: InfoFournisseur },
            transaction
        });

        if (!fournisseur) {
            fournisseur = await db.fournisseur.create(
                { Entreprise: InfoFournisseur, Telephone, Email },
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
                InfoFournisseur: fournisseur.Entreprise
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
