import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { env } from './utils/env.js';
import { errorHandler, notFound } from './utils/errorHandler.js';
import { startExpiryJobs } from './services/expiryService.js';
import { seedAdmin } from './config/adminSeed.js';

// Import all routes
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import coinRoutes from './routes/coinRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const PORT = env.PORT || 5000;

// Connect to Database
connectDB();

// Seed admin user on first run
await seedAdmin();

// Start expiry cron jobs
startExpiryJobs();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ethio Student Freelance Platform API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            posts: '/api/posts',
            materials: '/api/materials',
            chat: '/api/chat',
            coins: '/api/coins',
            admin: '/api/admin',
            notifications: '/api/notifications'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Environment: ${env.NODE_ENV}`);
    console.log(`API URL: http://localhost:${PORT}`);
});