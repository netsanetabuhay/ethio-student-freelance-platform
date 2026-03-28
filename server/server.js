const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB connection
const { connectDB } = require('./config/db');

console.log("🚀 Starting server setup...");

const app = express();
const PORT = process.env.PORT || 5000;

console.log("📦 Middlewares loading...");

app.use(cors());
app.use(express.json());


// Test route
app.get('/', (req, res) => {
    console.log("🌐 GET / request received");
    res.send('Server is running...');
});

app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
    console.log(`👉 http://localhost:${PORT}`);
});