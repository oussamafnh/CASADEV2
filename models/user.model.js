import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profilePicture: { type: String },
    coverPicture: { type: String },
    about: { type: String },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpiresAt:  { type: Date},
    verificationToken: { type: String },
    verificationTokenExpiresAt:  { type: Date},
},{timestamps:true});

const User = mongoose.model('User', userSchema);

export default User;
