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

  const info = await transporter.sendMail({
      from: 'Hi Russian Project <service@hi-russian.com>', // sender address
      to: "nosock93@gmail.com", // list of receivers
      subject: "Здравствуй, русский.", // Subject line
      text: "TEST", // plain text body
      // attachments: getFiles(req, ["jpg", "png", "bmp", "jpeg"])
  });

  return transporter;
}

module.exports = { getTransporter };
