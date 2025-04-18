const fs = require('fs');
const path = require('path');

const saveUploadedFile = async (uploadedFile, order, saveToPath) => {

    const extname = path.extname(uploadedFile.name);
    const uniqueSuffix = Date.now();
    const finalFileName = uniqueSuffix + order + extname;
    const saveTo = path.join(saveToPath, finalFileName);
    if (!fs.existsSync(saveToPath)) {
        fs.mkdirSync(saveToPath, { recursive: true }); // Create directory recursively
        // Set permissions to 777
        fs.chmodSync(saveToPath, '777');
    }
    await uploadedFile.mv(saveTo);
    return finalFileName;
}

module.exports = saveUploadedFile