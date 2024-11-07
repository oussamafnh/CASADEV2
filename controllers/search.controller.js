import Post from '../models/post.model.js';
import User from "../models/user.model.js";



// Search controller
export const search = async (req, res) => {
    try {
        const query = req.query.query;

        let users = [];
        let posts = [];

        // query has 1 character
        if (query.length === 1) {
            users = await User.find({
                $or: [
                    { firstName: { $regex: `^${query}`, $options: "i" } },
                    { lastName: { $regex: `^${query}`, $options: "i" } },
                    { username: { $regex: `^${query}`, $options: "i" } }
                ]
            });

            posts = await Post.find({
                title: { $regex: `^${query}`, $options: "i" }
            });
        } 
        // query has 3 or more characters
        else if (query.length >= 3) {
            users = await User.find({
                $or: [
                    { firstName: { $regex: query, $options: "i" } },
                    { lastName: { $regex: query, $options: "i" } },
                    { username: { $regex: query, $options: "i" } }
                ]
            });

            posts = await Post.find({
                title: { $regex: query, $options: "i" }
            });
        }
        // query has multiple words
        else if (query.split(" ").length > 1) {
            const words = query.split(" ").join("|");

            users = await User.find({
                $or: [
                    { firstName: { $regex: words, $options: "i" } },
                    { lastName: { $regex: words, $options: "i" } },
                    { username: { $regex: words, $options: "i" } }
                ]
            });

            posts = await Post.find({
                $or: [
                    { title: { $regex: words, $options: "i" } },
                    { content: { $regex: words, $options: "i" } }
                ]
            });
        }

        res.status(200).json({
            usersResults: users.length,
            users,
            postsResults: posts.length,
            posts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
