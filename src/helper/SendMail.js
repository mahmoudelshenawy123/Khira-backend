// var nodemailer = require('nodemailer')

// exports.SendMails = (sendToEmail, subject, html) => {
//   var transporter = nodemailer.createTransport({
//     host: 'mail.privateemail.com',
//     port: 465,
//     secure: true, // SSL/TLS
//     // port: 587,
//     // secure: false,

//     auth: {
//       user: 'support@khirastore.com',
//       pass: '123456789',
//       // pass: '123456789RDrd'
//     },
//     // tls: {
//     //   rejectUnauthorized: false, // 👈 useful if self-signed cert
//     // },
//   })
//   let mailOptions = {
//     from: 'support@khirastore.com',
//     to: sendToEmail,
//     subject: subject,
//     // text: text,
//     html: html,
//   }

//   transporter.sendMail(mailOptions, function (error, info) {
//     if (error) {
//       console.log(error)
//     } else {
//       console.log('Email sent: ' + info.response)
//     }
//   })
// }

var nodemailer = require('nodemailer')

exports.SendMails = (sendToEmail, subject, html) => {
  var transporter = nodemailer.createTransport({
    host: 'invoacdmy.com',
    port: 465,
    auth: {
      user: 'rd-aroma@invoacdmy.com',
      pass: 'e,LwSw)vId3L',
      // pass: '123456789RDrd'
    },
  })
  let mailOptions = {
    from: 'rd-aroma@invoacdmy.com',
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
