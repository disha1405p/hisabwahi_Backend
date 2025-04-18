const closeDB = async (client) => {
    if (client) {
        await client.closeDB;
        console.log('Closed MongoDB connection');
    }
};

module.exports = closeDB