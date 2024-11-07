import mongoose from 'mongoose';

const avatarSchema = new mongoose.Schema({
  avatarUrl: { type: String, required: true },
  label: { type: String },
});

const Avatar = mongoose.model('Avatar', avatarSchema);

export default Avatar;
