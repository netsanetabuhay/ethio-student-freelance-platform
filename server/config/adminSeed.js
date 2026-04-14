import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { env } from '../utils/env.js';

export const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (adminExists) {
            console.log(' Admin user already exists');
            return;
        }
        
        // Check if admin credentials exist in env
        if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
            console.log(' Admin credentials not found in .env file. Skipping admin creation.');
            return;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, salt);
        
        const admin = await User.create({
            username: 'netsanet',
            firstname: 'Netsanet',
            lastname: 'abuhay',
            email: env.ADMIN_EMAIL,
            password: hashedPassword,
            phone: env.ADMIN_PHONE,
            role: 'admin',
            coins: 0,
            status: 'active'
        });
        
        
        
    } catch (error) {
        console.error('Admin seed error:', error.message);
    }
};