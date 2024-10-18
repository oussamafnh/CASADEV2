import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
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
    ref: 'Like', // Reference to the Like model
    localField: '_id', // Find likes where `postId` matches this post's `_id`
    foreignField: 'postId', // The field in the Like model that references the post
    count: true, // Get the number of likes
    default : 0
});

const Post = mongoose.model('Post', postSchema);

export default Post;
