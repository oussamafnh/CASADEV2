import Post from '../models/post.model.js';
import User from "../models/user.model.js";
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';




// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const newComment = new Comment({
            content,
            postId,
            userId: user._id,
            username: user.username,
            userAvatar: user.avatar
        });

        await newComment.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





// Get comments for a post
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user ? req.user._id : null;
        const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

        const commentsWithIsMe = comments.map((comment) => {
            const isMe = userId ? comment.userId.toString() === userId.toString() : false;
            return { ...comment._doc, isMe };
        });

        res.status(200).json(commentsWithIsMe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




// Edit a comment
export const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const user = req.user;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'User not authorized to edit this comment' });
        }

        comment.content = content;
        await comment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};







// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const user = req.user;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'User not authorized to delete this comment' });
        }

        await comment.remove();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
