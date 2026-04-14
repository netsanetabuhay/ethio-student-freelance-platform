import mongoose from 'mongoose';
import { env } from '../utils/env.js';

const uri = env.MONGO_URI;

if (!uri) {
    console.error("❌ MONGO_URI is not defined in .env file");
    process.exit(1);
}

async function connectDB() {
    try {   
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        console.log("✅ MongoDB Atlas Connected successfully");
    } catch (error) {
        console.error("❌ DB Connection Error:", error.message);
        setTimeout(connectDB, 5000);
    }
}

mongoose.connection.on('error', (err) => {
    console.error('🔴 MongoDB error:', err.message);
});

export default connectDB;