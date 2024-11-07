import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    video: { type: String },
    author: { type: String },
    authorId: { type: String },
    authorAvatar: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false },
}, { timestamps: true });

postSchema.virtual('likeCount', {
    ref: 'Like',
    localField: '_id',
    foreignField: 'postId',
    count: true,
    default : 0
});

const Post = mongoose.model('Post', postSchema);

export default Post;
