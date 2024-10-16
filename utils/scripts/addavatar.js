import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Avatar from '../models/avatar.model.js'; // Adjust path based on your folder structure
import { connectDB } from '../db/connectDB.js'; // Assuming you have a connectDB.js file

dotenv.config();

// List of avatar URLs
const avatarUrls = [
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086387/pg3lptkcy3l7mgzjd0uf.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086387/ewlx4yphwli3db3nlxsa.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086387/flluner1azhrrwxhpjf1.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086386/uranf9g7vzoqcrducqwh.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086387/im3ykxnvavghexitddag.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086386/anlqaq769pf2zsv516el.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086386/yga20nalnknhumxl9oku.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086386/cy3pgmzlx4e4glzulclu.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086384/pkj3sjkb2fawlrsvwmd8.png",
    "https://res.cloudinary.com/dq7kjds8s/image/upload/v1729086384/egnk8rql9j72aykxxbo0.png"
];

// Function to insert avatars into the database
const addAvatars = async () => {
    try {
        await connectDB(); // Connect to the database

        // Loop through avatarUrls and insert them into the Avatar collection
        const avatarPromises = avatarUrls.map(url => new Avatar({ avatarUrl: url }).save());
        await Promise.all(avatarPromises);

        console.log('Avatars added successfully!');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error adding avatars:', error);
    }
};

// Execute the function to add avatars
addAvatars();
