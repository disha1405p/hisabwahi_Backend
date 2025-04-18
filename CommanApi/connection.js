//const express = require('express');
const { MongoClient } = require('mongodb');

//const app = express();


const dbname = "Hisabwahi";
const password = "PTRdwlWTMXduUKRQ";
// //mongodb+srv://shreeharitechnology2311:HuFissgrkayViWs2@vibsdatabase.upb0opt.mongodb.net/
const uri = `mongodb://localhost:27017/?retryWrites=true&w=majority`;
//const uri = `mongodb+srv://shreeharitechnology2311:${password}@vibsdatabase.upb0opt.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Initialize the MongoDB connection
async function initializeConnection() {
    try {
        await client.connect();
        console.log('Connected to MongoDB.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Function to get the database instance
async function getDB(collectionName) {
   try{
    if (!client) {
        console.log('MongoDB connection is not established.');
        initializeConnection();
    }
    return client.db(dbname).collection(collectionName);
   }catch(disha){
    console.error('MongoDB connection error:', disha);
    throw error;
   }
   
}

// Middleware to handle closing the connection gracefully when the app is terminated
async function handleapptermination() {
    if (client) {
        await client.close();
        console.log('Closed MongoDB connection.');
    }
}

module.exports = { initializeConnection, getDB, handleapptermination };