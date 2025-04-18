const crypto = require('crypto');

function generateMD5Hash(inputString) {
    const md5Hash = crypto.createHash('md5').update(inputString).digest('hex');
    return md5Hash;
}
module.exports = generateMD5Hash;
