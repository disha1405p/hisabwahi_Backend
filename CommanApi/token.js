
function generateTokenKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const charLength = characters.length;

    let tokenKey = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charLength);
        tokenKey += characters.charAt(randomIndex);
    } 2

    return tokenKey;
}

module.exports = generateTokenKey;