const express = require('express');

const cors = require('cors');
const jwt = require('jsonwebtoken');
const { initializeconnection, getDB, handleapptermination } = require('../CommanApi/connection');
const dbname = "Hisabwahi";
const secretKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$_`~%^&*()'; // Replace this with your secret key (should be a long random string)

const middlewareAuth = async (req, res, next) => {
    console.log("middleware");
    //const client = await connectDB();
    try {
        const userToken = req.headers.authorization.split(' ')[1];
        if (!userToken) {
            return res.status(200).json({
                status: 0,
                message: 'AuthToken is required'
            });
        }
        //const db = client.db(dbname);
        const db = await getDB()
        const collection = db.collection('AccountMaster');
        const user = await collection.findOne({ userToken });

        if (!user) {
            return res.status(200).json({ status: 0, message: 'Invalid AuthToken' });
        } else {
            if (user.status == 'active') {
                req.accountId = user._id;
                next(); // Proceed to the next middleware or route handler
            } else {
                return res.status(200).json({ status: 0, message: 'user not active' });
            }
        }
    } catch (error) {
        await handleapptermination();
        await initializeconnection();
        //closeDB(client)
        res.status(200).json({ status: 0, message: 'Error checking AuthToken', error });
    } finally {
        //closeDB(client)
    }
};


module.exports = middlewareAuth;

/*
jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
        console.log('Token verification failed:', err.message);
    } else {
        console.log('Decoded payload:', decoded);
    }
});
module.exports = verify();*/