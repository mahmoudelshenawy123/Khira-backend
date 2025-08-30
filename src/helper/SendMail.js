var nodemailer = require('nodemailer')

exports.SendMails = (sendToEmail, subject, html) => {
  var transporter = nodemailer.createTransport({
    host: 'khirastore.com',
    // port: 465,
    // secure: true, // 👈 for SSL/TLS
    port: 587,
    secure: false,
    auth: {
      user: 'support@khirastore.com',
      pass: '123456789',
      // pass: '123456789RDrd'
    },
  })
  let mailOptions = {
    from: 'support@khirastore.com',
    to: sendToEmail,
    subject: subject,
    // text: text,
    html: html,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
