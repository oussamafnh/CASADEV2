import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    avatar: { type: String },
    coverPicture: { type: String },
    bio: { type: String },
    birthday: { type: Date },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    Token: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);


export default User;
