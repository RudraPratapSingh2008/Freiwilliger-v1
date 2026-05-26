const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../../../firebase-admin-key.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialised');
}

module.exports = admin;