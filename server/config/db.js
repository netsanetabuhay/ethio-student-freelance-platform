import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
    console.error("MONGO_URI is not defined in .env file");
    process.exit(1);
}

async function connectDB() {
    try {
        await mongoose.connect(uri);
        console.log(" MongoDB Connected");
        console.log(" Database ready for operations");
    } catch (error) {
        console.error(" DB Connection Error:", error.message);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('DB connection closed');
    process.exit(0);
});

export default connectDB;