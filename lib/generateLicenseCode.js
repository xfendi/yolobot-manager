const License = require('../models/license');

const generateUniqueLicenseCode = async () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const keyLength = 16;

  let key;
  let exists = true;

  while (exists) {
    key = '';
    for (let i = 0; i < keyLength; i++) {
      key += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    exists = await License.exists({ code: key });
  }

  return key;
};

module.exports = { generateUniqueLicenseCode };
