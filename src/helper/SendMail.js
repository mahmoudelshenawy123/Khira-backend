var nodemailer = require('nodemailer');

exports.SendMails=(sendToEmail,subject,html)=>{
    
      var transporter = nodemailer.createTransport({
        host: 'invoacdmy.com',
        port:465,
        auth: {
          user: 'rd-aroma@invoacdmy.com',
          pass: 'e,LwSw)vId3L'
          // pass: '123456789RDrd'
        }
      });
    let mailOptions = {
        from: 'rd-aroma@invoacdmy.com',
        to: sendToEmail,
        subject: subject,
        // text: text,
        html: html,
    };
    
transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
  });
}