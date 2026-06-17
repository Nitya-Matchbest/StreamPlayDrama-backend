const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./blog/models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');

        const email = 'nityaarya11@gmail.com';
        const password = '12345678';

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Admin user already exists. Overwriting password to ensure it matches.');
            
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            existingUser.password = await bcrypt.hash(password, salt);
            await existingUser.save();
            
            console.log('Admin user password updated successfully!');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        const newAdmin = new User({
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await newAdmin.save();
        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin user:', err);
        process.exit(1);
    }
};

seedAdmin();
