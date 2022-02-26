const nodemailer = require("nodemailer");

const {MAIL_USER, MAIL_PASS } = process.env;
async function getTransporter() {
  let transporter = nodemailer.createTransport({
    host: "smtp.eu.mailgun.org",
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    },
  });

  return transporter;
}

module.exports = { getTransporter };
