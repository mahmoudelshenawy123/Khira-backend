const admin = require('firebase-admin');
const fcm = require('fcm-notification');
// const serviceAccount = require('../config/readyPrivateKey.json');

const certPath = null;
// const certPath = admin.credential.cert(serviceAccount);
const FCM = new fcm(certPath);

exports.sendPushNotification = async (fcm_token, title, body) => {
  try {
    const message = {
      android: {
        notification: {
          title,
          body,
        },
      },
      token: fcm_token,
    };

    await FCM.send(message, (err, resp) => {
      if (err) {
        throw err;
      } else {
        console.log('Successfully sent notification');
      }
    });
  } catch (err) {
    throw err;
  }
};
