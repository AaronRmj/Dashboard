require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestMail() {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: `"Test" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "Test Nodemailer",
    text: "Ceci est un mail de test"
  });

  console.log("Message envoyé : %s", info.messageId);
}

sendTestMail().catch(console.error);
