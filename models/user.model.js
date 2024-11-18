import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    avatar: { 
        type: String, 
        default: 'https://res.cloudinary.com/dq7kjds8s/image/upload/v1731950268/x31lamftbwev3nyogmqy.jpg' 
    },
    coverPicture: { type: String },
    bio: { type: String },
    birthday: { type: Date },
    lastLogin: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    Token: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);


export default User;
