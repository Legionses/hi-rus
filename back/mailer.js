const nodemailer = require("nodemailer");

const {MAIL_USER, MAIL_PASS, DKIM } = process.env;
async function getTransporter() {
  let transporter = nodemailer.createTransport({
    host: "smtp.hi-russian.com",
    port: 7005,
    ignoreTLS: true,
    dkim: {
      domainName: "smtp.hi-russian.com",
      keySelector: "s1",
      privateKey: DKIM,
    },
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    },
  });

  return transporter;
}

module.exports = { getTransporter };
