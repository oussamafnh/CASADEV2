import Like from '../models/like.model.js';
import Post from '../models/post.model.js';




// Like a post
export const likePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const existingLike = await Like.findOne({ userId, postId });

        if (existingLike) {
            return res.status(400).json({ message: "You have already liked this post" });
        }

        const newLike = new Like({ userId, postId });
        await newLike.save();

        res.status(201).json({ message: "Post liked successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Unlike a post
export const unlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { postId } = req.params;
        const like = await Like.findOneAndDelete({ userId, postId });

        if (!like) {
            return res.status(404).json({ message: "You haven't liked this post yet" });
        }

        res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Get the likecount for a post
export const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId).populate('likeCount');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ likeCount: post.likeCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
