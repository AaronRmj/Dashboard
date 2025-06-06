const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const db = require('./models/db'); // Chargement Sequelize + odele 

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

// Connexion amn bd 
db.sequelize.authenticate()
  .then(() => console.log(" Connecté à la Bd "))
  .catch(err => console.error(" Erreur connexion bd :", err));

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log(" Synchronisation Sequelize ");
    console.log("Modèles chargés :", Object.keys(db));
  })
  .catch(err => console.error(" Erreur synchronisation :", err));




// routes

//  Inscription
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

//  Connexion avec remember Me
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


// mdp oublier 
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

// verification du code par mail 
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

/// reinitialisation de mdp apres les processus 
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


app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
