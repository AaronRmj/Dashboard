const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { where, Op } = require('sequelize');
 const db = require('./models/db');

const QRCode = require('qrcode');
const crypto = require('crypto');
const bwipjs = require('bwip-js');
const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = "tonSecretJWTUltraSecurise";
// Middlewares fonction avec execution  obtient et renvoie reponse 
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log("Valeur de JWT_SECRET :", JWT_SECRET);


//importe classe server
const { Server } = require('socket.io');

//importe module http pour creer un serveur
const http = require('http');


const OptimaServer = http.createServer(app);

//initialise le socket avec le server http
const io = new Server(OptimaServer, {
  cors: {
    origin: '*', // Remplace par l'URL de ton frontend
    methods: ["GET", "POST"],
    credentials: true
  }
});

//ecoute des evenements niveau server
io.on('connection', (socket) => {
  console.log("Client connecté", socket.id);
  try {
    console.log('  handshake origin:', socket.handshake.headers.origin || 'n/a');
    console.log('  remote address:', socket.handshake.address || socket.conn.remoteAddress || 'n/a');
    console.log('  query:', socket.handshake.query || {});
  } catch (e) {
    console.warn('Erreur lecture handshake:', e);
  }
  // show current connected clients count
  try {
    const count = io.sockets.sockets.size || (io.engine && io.engine.clientsCount) || 0;
    console.log('  clients connectés (count):', count);
  } catch (e) {
    // ignore
  }
  
  socket.on('position-livreur', (data) => {
    console.log('📡 POSITION LIVREUR REÇUE:');
    console.log('ID:', data.id);
    console.log('Position:', data.position);
    console.log('Timestamp:', data.timestamp);
    console.log('----------------------');
    
    // 1. Envoyer au livreur lui-même
    socket.emit('ma-position', {
      type: 'ma-position',
      position: data.position
    });

    // 2. Envoyer aux gestionnaires
    socket.broadcast.emit('position-update', {
      type: 'position-update',
      position: data.position
    });
    // Also emit to all clients (including sender) for easier testing across devices
    try {
      io.emit('position-update', { type: 'position-update', position: data.position });
      console.log('  broadcast + io.emit position-update envoyé');
    } catch (e) {
      console.warn('Erreur emission io.emit:', e);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log("Client déconnecté", socket.id, 'reason:', reason);
  });
});
OptimaServer.listen(PORT, '0.0.0.0', ()=>{
  console.log(`Serveur demarré sur le port ${PORT} (bound 0.0.0.0)`);
})


// Connexion à la BD
db.sequelize.authenticate()
  .then(() => console.log(" Connecté à la BD "))
  .catch(err => console.error(" Erreur connexion BD :", err));


// db.sequelize.sync({ alter: true }) // {alter : true} si tu veux rajouter une colonne; sans arguments si tu veux juste qu'il détecte qu'il devrait créer une nouvelle table

//   .then(() => {
//     console.log(" Synchronisation Sequelize ");
//     console.log("Modèles chargés :", Object.keys(db));
//   })

//   .catch(err => console.error(" Erreur synchronisation :", err));/// !!! Enlever le commentaire pour Synchroniser la BD aux Modèles





// cree dossier uploads sinon existe 
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer gerance ficher image reetra +lire acceder enregitre 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  destination: (req, file, cb) => cb(null,path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `file-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
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
app.get("/Clients", async (req, res) => {
    const clients = await db.client.findAll();
    res.status(200).json(clients);
});
app.get("/Produit", async (req, res) => {
    const produits = await db.produit.findAll();
    res.status(200).json(produits); // .json() pour envoi des données après query sous forme json. **different de toJSON()
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
    const { nom, email, password, entreprise, telephone, adresse } = req.body;
    const photoPath = req.file ? req.file.filename : null;

    if (!nom || !email || !password || !entreprise || !telephone || !adresse) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
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
      Telephone: telephone,
      Adresse: adresse,
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
  subject: "Réinitialisation de votre mot de passe - OptimaBusiness",
  html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 40px; color: #fff; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
    <h2 style="text-align: center;"> Réinitialisation de votre mot de passe</h2>
    <p>Bonjour,</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>OptimaBusiness</strong>.</p>
    <p style="margin: 20px 0; font-size: 20px; background: #fff; color: #3b82f6; padding: 15px; border-radius: 8px; text-align: center;">
      <strong>Votre code de réinitialisation :</strong><br/>
      <span style="font-size: 28px; letter-spacing: 4px;">${code}</span>
    </p>
    <p>Ce code est valable pendant <strong>10 minutes</strong>. Veuillez ne pas le partager avec quiconque.</p>
    <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message ou contacter immédiatement notre support.</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    <p style="font-size: 12px; text-align: center;">Merci de votre confiance<br><strong>L'équipe OptimaBusiness</strong>
    <br><strong>Contact : 🇲🇬 +261 34 28 904 14 </strong>
    
    </p>
    

  </div>
  `
});


    res.json({ message: "Code envoyé par email" });

  } catch (err) {
    console.error("Erreur forgot-password :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

//fonction ilaina fona //a chaque action de l utilisateur actif anaty route reetr 
  function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); 
  if (!authHeader) return res.status(401).json({ error: "Token manquant" });

  const token = authHeader.split(' ')[1];
  console.log("Token extrait:", token); 
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Erreur JWT:", err);
      return res.status(401).json({ error: "Token invalide ou expiré" });
    }
    console.log("Token décodé:", decoded);
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

    // Correction ici : stocker le chemin relatif pour usage React/Electron
    const photoPath = req.file ? `uploads/${req.file.filename}` : null;

    // Vérification des champs requis
    if (!nom || !username || !adresse || !email || !tel || !poste || !salaire || !motdepasse || !photoPath) {
      return res.status(400).json({ error: "Tous les champs sont requis et la photo est obligatoire." });
    }

    // Regex validation
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

    // Vérification administrateur connecté
    const admin = await db.admin.findByPk(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: "Administrateur introuvable." });
    }

    const nomEntreprise = admin.NomEntreprise.trim();
    const emailCheck = email.trim().toLowerCase();

    const existant = await db.employe.findOne({
      where: {
        Email: emailCheck,
        NomEntreprise: nomEntreprise
      }
    });

    if (existant) {
      return res.status(400).json({
        error: "Cet email est déjà utilisé dans cette entreprise."
      });
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Génération du matricule
    const employeCount = await db.employe.count({
      where: { NomEntreprise: nomEntreprise }
    });

    const numeroMatricule = (employeCount + 1).toString().padStart(4, '0');
    const suffixEntreprise = nomEntreprise.replace(/\s+/g, '-');
    const matricule = `${numeroMatricule}-${suffixEntreprise}`;

    // Création de l'employé dans la base
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

    // Génération QR code
    const qrFolderPath = path.join(__dirname, 'uploads/employe-qr');
    if (!fs.existsSync(qrFolderPath)) {
      fs.mkdirSync(qrFolderPath, { recursive: true });
    }

    const qrData = nouvelEmploye.Email;
    const qrFileName = `qr-${Date.now()}.png`;
    const qrCodePath = path.join(qrFolderPath, qrFileName);

    await QRCode.toFile(qrCodePath, qrData);

    // Correction : chemin relatif pour React/Electron
    const qrRelativePath = `uploads/employe-qr/${qrFileName}`;

    await nouvelEmploye.update({ QRCodePath: qrRelativePath });

    return res.status(201).json({
      message: "Employé ajouté avec succès.",
      id: nouvelEmploye.IdEmploye,
      matricule: matricule,
      photoUrl: `http://localhost:8080/${photoPath}`, // URL complète
      qrCode: `http://localhost:8080/${qrRelativePath}` // URL complète
    });

  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: "Un employé avec cet email existe déjà dans cette entreprise."
      });
    }

    if (err.name === 'SequelizeValidationError') {
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

        console.log(req.body)
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
            console.log(codeProduit);
            // Mise à jour du stock
            const produitStock = await db.produit.findOne({ where: { IdProduit: codeProduit } });
            if (!produitStock) {
                return res.status(404).json({ error: "Produit introuvable" });
            }
            else if((produitStock.Stock - quantite)<0)
            {
                return res.status(400).json({ error: "Stock Insuffisant pour la transaction" });
            }
            await db.produit.update(
                { Stock: produitStock.Stock - quantite },
                { where: { IdProduit: codeProduit } }
            );

            // Création de la vente
            await db.vente.create({ 
                Quantite: quantite, 
                Date, 
                CodeProduit: codeProduit, 
                NumFacture, 
                NumEmploye: numEmploye 
            });      
        }

        res.status(201).json({ message: "Facture créée avec succès", NumFacture });
    } catch (error) {
        console.error("Erreur globale :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

// GET list of ventes (for history view)
app.get('/Vente', async (req, res) => {
  try {
    const ventes = await db.vente.findAll({
      include: [
        { model: db.produit },
        { model: db.employe },
        { model: db.facture, include: [{ model: db.client }] }
      ],
      order: [['Date', 'DESC']]
    });
    res.status(200).json(ventes);
  } catch (err) {
    console.error('Erreur GET /Vente :', err);
    res.status(500).json({ error: 'Erreur serveur' });
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


app.post("/Achat", upload.any(), async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { Date, InfoFournisseur, Telephone, Email } = req.body;
    if (!InfoFournisseur || !Date) {
      return res.status(400).json({ error: "InfoFournisseur et Date sont requis" });
    }

    // Parse produits JSON, vérifier que c’est un tableau et non vide
    let produits;
    try {
      produits = JSON.parse(req.body.produits);
    } catch {
      return res.status(400).json({ error: "Format des produits invalide" });
    }
    if (!Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ error: "Au moins un produit est requis" });
    }

    // Vérifier chaque produit
    for (const p of produits) {
      if (
        !p.NomProduit || typeof p.NomProduit !== "string" || p.NomProduit.trim() === "" ||
        !p.Quantite || isNaN(p.Quantite) || Number(p.Quantite) <= 0 ||
        p.Pachat === undefined || isNaN(p.Pachat) || Number(p.Pachat) < 0 ||
        p.Pvente === undefined || isNaN(p.Pvente) || Number(p.Pvente) < 0
      ) {
        return res.status(400).json({
          error: `Données invalides pour le produit : ${p.NomProduit || "inconnu"}`
        });
      }
    }

    // Trouver ou créer le fournisseur
    let fournisseur = await db.fournisseur.findOne({
      where: { Entreprise: InfoFournisseur },
      transaction,
    });
    if (!fournisseur) {
      fournisseur = await db.fournisseur.create(
        { Entreprise: InfoFournisseur, Telephone, Email },
        { transaction }
      );
    }

    // Traitement des produits + achats
    const achatsEffectues = [];

    for (let i = 0; i < produits.length; i++) {
      const { NomProduit, Quantite, Pachat, Pvente } = produits[i];
      const quantiteNum = Number(Quantite);
      const pachatNum = Number(Pachat);
      const pventeNum = Number(Pvente);

      const fichier = req.files[i];
      const imageProduit = fichier ? fichier.filename : null;

      // Générer code-barres
      const hash = crypto.createHash('sha1').update(NomProduit).digest('hex').substring(0, 12);
      const codeBarreTexte = hash.toUpperCase();

      const codeBarreDir = path.join(__dirname, "uploads", "codebarres");
      if (!fs.existsSync(codeBarreDir)) fs.mkdirSync(codeBarreDir, { recursive: true });
      const codeBarreImagePath = path.join(codeBarreDir, `${codeBarreTexte}.png`);

      if (!fs.existsSync(codeBarreImagePath)) {
        const buffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: codeBarreTexte,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        });
        fs.writeFileSync(codeBarreImagePath, buffer);
      }

      // Trouver produit existant
      let produit = await db.produit.findOne({ where: { Description: NomProduit }, transaction });

      if (produit) {
        produit.Stock += quantiteNum;
        if (produit.PAunitaire !== pachatNum) produit.PAunitaire = pachatNum;
        if (produit.PVunitaire !== pventeNum) produit.PVunitaire = pventeNum;
        if (imageProduit) produit.Image = `/uploads/${imageProduit}`;
        produit.CodeBarre = `/uploads/codebarres/${codeBarreTexte}.png`;
        await produit.save({ transaction });
      } else {
        produit = await db.produit.create({
          Description: NomProduit,
          Stock: quantiteNum,
          PAunitaire: pachatNum,
          PVunitaire: pventeNum,
          Image: imageProduit ? `/uploads/${imageProduit}` : null,
          CodeBarre: `/uploads/codebarres/${codeBarreTexte}.png`,
        }, { transaction });
      }

      const achat = await db.achat.create({
        NomProduit,
        Quantite: quantiteNum,
        Date,
        InfoFournisseur: fournisseur.Entreprise,
      }, { transaction });

      achatsEffectues.push({
        fournisseur: InfoFournisseur,
        produit: NomProduit,
        quantite: quantiteNum,
        codeBarre: `/uploads/codebarres/${codeBarreTexte}.png`,
        image: imageProduit ? `/uploads/${imageProduit}` : null,
        achatId: achat.id,
      });
    }

    await transaction.commit();
    return res.status(201).json({
      message: "Achats enregistrés avec succès",
      achats: achatsEffectues,
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de l'achat :", error);
    return res.status(500).json({ error: "Une erreur est survenue", details: error.message });
  }
});

// GET list of achats (for history view)
app.get('/Achat', async (req, res) => {
  try {
    const achats = await db.achat.findAll({
      include: [
        { model: db.produit },
        { model: db.fournisseur }
      ],
      order: [['Date', 'DESC']]
    });
    res.status(200).json(achats);
  } catch (err) {
    console.error('Erreur GET /Achat :', err);
    res.status(500).json({ error: 'Erreur serveur' });
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
        {        // ...existing code...
        const imageProduit = req.file ? req.file.filename : null;
        // ...existing code...
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


//  Enregistrer l'heure de début
app.post("/heure-debut", authMiddleware, async (req, res) => {
  try {
    const { heureDebut } = req.body;
    const { entreprise } = req.user; // Entreprise du token JWT
    const today = new Date().toISOString().slice(0, 10);

    const existingHeure = await db.heureDebut.findOne({
      where: {
        NomEntreprise: entreprise,
        Date: today,
      },
    });

    if (existingHeure) {
      return res.status(400).json({ 
        error: "Une heure de début a déjà été définie pour aujourd'hui",
        heureDebut: existingHeure.HeureDebut 
      });
    }

    const nouvelleHeure = await db.heureDebut.create({
      NomEntreprise: entreprise,
      Date: today,
      HeureDebut: heureDebut,
    });

    res.json({ 
      success: true, 
      message: "Heure de début enregistrée avec succès",
      heureDebut: nouvelleHeure.HeureDebut 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de l'heure de début" });
  }
});

app.get("/heure-debut/today", authMiddleware, async (req, res) => {
  try {
    const { entreprise } = req.user;
    const today = new Date().toISOString().slice(0, 10);

    const heureDebut = await db.heureDebut.findOne({
      where: {
        NomEntreprise: entreprise,
        Date: today,
      },
    });

    if (heureDebut) {
      res.json({ 
        exists: true, 
        heureDebut: heureDebut.HeureDebut,
        date: heureDebut.Date 
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la vérification de l'heure de début" });
  }
});

// Fonction de nettoyage automatique (dependant d  scheduler)
const cleanupOldHeuresDebut = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const deleted = await db.heureDebut.destroy({
      where: {
        Date: {
          [db.Sequelize.Op.lt]: yesterdayStr
        }
      }
    });

    console.log(`${deleted} anciennes heures de début supprimées`);
    return deleted;
  } catch (error) {
    console.error('Erreur lors du nettoyage des heures de début:', error);
  }
};

// Scheduler pour nettoyer automatiquement chaque jour **hd samihafa 
const scheduleCleanup = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  setTimeout(() => {
    cleanupOldHeuresDebut();
  }, msUntilMidnight);
};

scheduleCleanup();

// Routes affichage liste dans le logiciel 
app.get("/presences/today", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const presences = await db.presence.findAll({
      where: {
        DatePresence: today,
        NomEntreprise: req.user.entreprise,
      },
      include: [{ model: db.employe }],
    });

    res.json(presences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des présences" });
  }
});

app.post("/presences/scan", authMiddleware, async (req, res) => {
  const { email, heureDebut } = req.body;
  const { entreprise } = req.user;

  // Vérif format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Format de données invalides" });
  }

  const employe = await db.employe.findOne({ where: { Email: email } });
  if (!employe) {
    return res.status(404).json({ error: "Email introuvable" });
  }

  if (employe.NomEntreprise !== entreprise) {
    return res.status(403).json({ error: "Employé n'appartient pas à votre entreprise" });
  }

  const maintenant = new Date();
  let statut = "present";

  if (heureDebut) {
    const [h, m] = heureDebut.split(":").map(Number);
    const heureLimite = h * 60 + m;
    const currentMinutes = maintenant.getHours() * 60 + maintenant.getMinutes();
    statut = currentMinutes <= heureLimite ? "present" : "retard";
  }

  let presence = await db.presence.findOne({
    where: {
      NumEmploye: employe.IdEmploye,
      DatePresence: maintenant.toISOString().slice(0, 10),
    },
  });

  if (presence) {
    presence.Statut = statut;
    presence.HeureScan = maintenant;
    presence.Matricule = employe.Matricule;
    presence.NomEntreprise = employe.NomEntreprise;
    await presence.save();
  } else {
    presence = await db.presence.create({
      NumEmploye: employe.IdEmploye,
      Matricule: employe.Matricule,
      NomEntreprise: employe.NomEntreprise,
      DatePresence: maintenant.toISOString().slice(0, 10),
      HeureScan: maintenant,
      Statut: statut,
    });
  }

  res.json({ success: true, employe, statut });
});

//  PDF extractena
app.post('/presences/export-pdf', authMiddleware, async (req, res) => {
  try {
    const entrepriseToken = req.user.entreprise;
    const today = new Date().toISOString().split('T')[0]; 

    const { admin, heureDebut, presence, employe } = db;

    const entrepriseInfo = await admin.findOne({
      where: { NomEntreprise: entrepriseToken },
      attributes: ['NomEntreprise', 'Photo', 'Adresse', 'Telephone']
    });

    if (!entrepriseInfo) {
      return res.status(404).json({ error: "Informations de l'entreprise non trouvées" });
    }

    const heureDebutRecord = await heureDebut.findOne({
      where: { 
        NomEntreprise: entrepriseToken,
        Date: today
      },
      attributes: ['HeureDebut']
    });

    if (!heureDebutRecord) {
      return res.status(404).json({ error: "Aucune heure de début trouvée pour aujourd'hui" });
    }

    const heureDebutValue = heureDebutRecord.HeureDebut;

    const presences = await presence.findAll({
      where: { DatePresence: today },
      include: [{
        model: employe,
        where: { NomEntreprise: entrepriseToken }, 
        attributes: ['Nom', 'UserName', 'Adresse', 'Poste']
      }],
      attributes: ['NumEmploye', 'Statut', 'HeureScan'],
      order: [['Statut', 'ASC'], [employe, 'Nom', 'ASC']]
    });

    const presents = presences.filter(p => p.Statut === 'present');
    const retardataires = presences.filter(p => p.Statut === 'retard');

    //  Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fiche-presence-${today}.pdf"`);
    doc.pipe(res);

   let logoY = 50;
if (entrepriseInfo.Photo) {
  const logoPath = path.join(__dirname, 'uploads', entrepriseInfo.Photo); 
  if (fs.existsSync(logoPath)) {
    try {
      const logoWidth = 80;
      const logoHeight = 80;
      const logoX = (doc.page.width - logoWidth) / 2; 
      doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });
      logoY += logoHeight + 10;
    } catch (logoError) {
      console.warn("Erreur lors du chargement du logo:", logoError);
      logoY += 20;
    }
  }
}


    doc.fontSize(18).font('Helvetica-Bold');
    const nomEntreprise = entrepriseInfo.NomEntreprise || entrepriseToken;
    const nomWidth = doc.widthOfString(nomEntreprise);
    const pageWidth = doc.page.width;
    doc.text(nomEntreprise, (pageWidth - nomWidth) / 2, logoY);

    doc.fontSize(12).font('Helvetica');
    const telephone = entrepriseInfo.Telephone || '';
    if (telephone) {
      const telWidth = doc.widthOfString(telephone);
      doc.text(telephone, (pageWidth - telWidth) / 2, logoY + 25);
    }

    const adresse = entrepriseInfo.Adresse || '';
    if (adresse) {
      const adresseWidth = doc.widthOfString(adresse);
      doc.text(adresse, (pageWidth - adresseWidth) / 2, logoY + 40);
    }

  
    let currentY = logoY + 80;

    doc.fontSize(20).font('Helvetica-Bold');
    const titre = "FICHE DE PRESENCE";
    const titreWidth = doc.widthOfString(titre);
    doc.text(titre, (pageWidth - titreWidth) / 2, currentY);
    currentY += 40;

    doc.fontSize(14).font('Helvetica');
    const dateStr = `Date: ${new Date().toLocaleDateString('fr-FR')}`;
    doc.text(dateStr, 50, currentY);
    currentY += 20;

    const heureStr = `Heure de début: ${heureDebutValue}`;
    doc.text(heureStr, 50, currentY);
    currentY += 40;

    const drawTable = (title, data, startY, statusColor) => {
  let y = startY;

  // Titre section
  doc.fontSize(16).font('Helvetica-Bold').fillColor(statusColor);
  doc.text(title, 50, y);
  y += 25;

  if (data.length === 0) {
    doc.fontSize(12).font('Helvetica').fillColor('gray');
    doc.text("Aucun employé dans cette catégorie", 50, y);
    return y + 30;
  }

  const tableLeft = 40;     
  const tableWidth = 520;    
  const itemHeight = 20;

  // Colonnes rééquilibrées
  const colWidths = [130, 130, 100, 80, 80]; 
  const colPositions = [
    tableLeft,
    tableLeft + colWidths[0],
    tableLeft + colWidths[0] + colWidths[1],
    tableLeft + colWidths[0] + colWidths[1] + colWidths[2],
    tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
  ];

  doc.rect(tableLeft, y - 3, tableWidth, itemHeight + 5).fill('#E5E7E9');
  doc.fillColor('black').fontSize(10).font('Helvetica-Bold');
  doc.text('Nom', colPositions[0], y);
  doc.text('Prénom(s)', colPositions[1], y);
  doc.text('Adresse', colPositions[2], y);
  doc.text('Poste', colPositions[3], y);
  doc.text("Arrivée", colPositions[4], y);

  y += itemHeight;
  doc.moveTo(tableLeft, y).lineTo(tableLeft + tableWidth, y).stroke();
  y += 5;

  // Lignes du tableau
  doc.font('Helvetica').fontSize(9);
  data.forEach((item, index) => {
    if (y > 700) {
      doc.addPage();
      y = 80;
    }

    const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F8F9F9';
    doc.rect(tableLeft, y - 2, tableWidth, itemHeight).fill(bgColor);

    doc.fillColor('black');
    doc.text(item.employe.Nom || '-', colPositions[0], y, { width: colWidths[0] - 5 });
    doc.text(item.employe.UserName || '-', colPositions[1], y, { width: colWidths[1] - 5 });
    doc.text(item.employe.Adresse || '-', colPositions[2], y, { width: colWidths[2] - 5 });
    doc.text(item.employe.Poste || '-', colPositions[3], y, { width: colWidths[3] - 5 });
    doc.text(item.HeureScan || '-', colPositions[4], y, { width: colWidths[4] - 5 });

    y += itemHeight;
  });

  return y + 30; 
};

    currentY = drawTable(`PRÉSENTS (${presents.length})`, presents, currentY, '#b97425ff');

    if (currentY > 600) {
      doc.addPage();
      currentY = 50;
    }

    currentY = drawTable(`RETARDATAIRES (${retardataires.length})`, retardataires, currentY, '#A7001E');

    // Pied de page
    const bottomY = doc.page.height - 100;
    doc.fontSize(10).font('Helvetica').fillColor('black');
    doc.text('Signature du responsable: ____________________', 50, bottomY);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 300, bottomY + 20);

    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération du PDF',
      details: error.message
    });
  }
});



app.get("/dashboard-stats", async (req, res) => {
  try {
    // nombre de clients et commandes
    const nbClients = await db.client.count();
    const nbCommandes = await db.facture.count();

    // Charger tous les produits (PAunitaire / PVunitaire)
    const produits = await db.produit.findAll({
      attributes: ["IdProduit", "Description", "PAunitaire", "PVunitaire"]
    });
    const prodByDesc = new Map(produits.map(p => [p.Description, p]));
    const prodById = new Map(produits.map(p => [p.IdProduit, p]));

    // ACHATS : la table achat contient NomProduit et Quantite -> on récupère le PA via Description
    const achats = await db.achat.findAll(); // on prend tous les achats
    const totalAchats = achats.reduce((sum, achat) => {
      const q = Number(achat.Quantite) || 0;
      const prod = prodByDesc.get(achat.NomProduit);
      const pa = prod ? Number(prod.PAunitaire) || 0 : 0;
      return sum + q * pa;
    }, 0);

    // VENTES : la table vente contient Quantite et CodeProduit (FK) ; on essaye d'utiliser l'include sinon fallback sur la map
    const ventes = await db.vente.findAll({
      include: [{ model: db.produit, attributes: ["PVunitaire", "IdProduit"] }]
    });
    const totalVentes = ventes.reduce((sum, vente) => {
      const q = Number(vente.Quantite) || 0;
      let pv = vente.produit ? Number(vente.produit.PVunitaire) || 0 : undefined;
      if (pv === undefined) {
        const prod = prodById.get(vente.CodeProduit);
        pv = prod ? Number(prod.PVunitaire) || 0 : 0;
      }
      return (sum + q * pv) ;
    }, 0);

    res.json({
      nbClients,
      nbCommandes,
      totalAchats,
      totalVentes
    });
  } catch (err) {
    console.error("Erreur /dashboard-stats :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get("/best-sellers", async (req, res) => {
  try {
    // Regroupe les ventes par produit et somme la quantité
    const ventes = await db.vente.findAll({
      attributes: [
        "CodeProduit",
        [db.sequelize.fn("SUM", db.sequelize.col("Quantite")), "totalVendu"]
      ],
      group: ["CodeProduit"],
      include: [{
        model: db.produit,
        attributes: ["Description"]
      }],
      order: [[db.sequelize.literal("totalVendu"), "DESC"]],
      limit: 3 // Top 3
    });

    // Formatage pour le frontend
    const result = ventes.map(v => ({
      label: v.produit.Description,
      value: v.dataValues.totalVendu
    }));
    
    res.json(result);
  } catch (err) {
    console.error("Erreur best-sellers :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// app.listen(PORT, () => {
//     console.log(`serveur au port ${PORT}`);
// });
