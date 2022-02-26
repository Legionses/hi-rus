const nodemailer = require("nodemailer");

const {MAIL_USER, MAIL_PASS, MAIL_DOMAIN, MAIL_KEY} = process.env;
// console.log({MAIL_USER, MAIL_PASS, MAIL_DOMAIN, MAIL_KEY});

// async..await is not allowed in global scope, must use a wrapper
async function getTransporter() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    // service: "Mailgun",
    host: "smtp.eu.mailgun.org",
    auth: {
      // type: "login",
      user: MAIL_USER,
      pass: MAIL_PASS
    },
  });

  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  return transporter;
}

// const mailgun = require("mailgun-js");
// const mg = mailgun({apiKey: MAIL_KEY, domain: MAIL_DOMAIN});
// const data = {
// 	from: 'Excited User <me@samples.mailgun.org>',
// 	to: 'bar@example.com, YOU@YOUR_DOMAIN_NAME',
// 	subject: 'Hello',
// 	text: 'Testing some Mailgun awesomness!'
// };
// mg.messages().send(data, function (error, body) {
// 	console.log(body);
// });

module.exports = { getTransporter };
