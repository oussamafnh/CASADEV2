import mongoose from 'mongoose';

const avatarSchema = new mongoose.Schema({
  avatarUrl: { type: String, required: true }, // URL to the avatar image
  label: { type: String }, // Optional label or description of the avatar
});

const Avatar = mongoose.model('Avatar', avatarSchema);

export default Avatar;
