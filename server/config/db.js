const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB Connected");

        db = client.db("freelanceDB");

        // Create users collection if it doesn't exist
        await db.createCollection("users");

        console.log("Users collection ready");

    } catch (error) {
        console.error("DB Connection Error:", error);
        process.exit(1);
    }
}

// function to get DB anywhere
function getDB() {
    return db;
}

module.exports = { connectDB, getDB };