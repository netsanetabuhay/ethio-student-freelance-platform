const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Test route
app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});