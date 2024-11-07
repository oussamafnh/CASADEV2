import mongoose from 'mongoose';

const saveSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  });

const Save = mongoose.model('Save', saveSchema);
export default Save;
