import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
    userId: { type: String },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // Post that was liked
}, { timestamps: true });

const Like = mongoose.model('Like', likeSchema);
export default Like;